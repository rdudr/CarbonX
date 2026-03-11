'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db, realtimeDb } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { ref, onValue, query as rtdbQuery, limitToLast } from 'firebase/database';
import { useSystem } from './SystemContext';
import type { RXEnergyUnit, TXEnergyUnit } from '@/types/energy';

interface TelemetryContextType {
    latestLogs: any[];
    loading: boolean;
    isLive: boolean;
    gatewayData: RXEnergyUnit | null;
    nodeData: TXEnergyUnit[];
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
    const { config } = useSystem();
    const [latestLogs, setLatestLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        // --- 1. Firestore Listener (Legacy/Backup) ---
        let unsubscribeFirestore = () => { };
        if (db) {
            const q = query(collection(db, "AI_Logs"), orderBy("timestamp", "desc"), limit(50));
            unsubscribeFirestore = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLatestLogs(prev => {
                    const combined = [...data, ...prev].slice(0, 100);
                    // Filter duplicates by id or Time
                    return Array.from(new Map(combined.map(item => [item.id || item.Time, item])).values());
                });
                setLoading(false);
                setIsLive(true);
            }, (error) => {
                console.warn("Firebase telemetry listener failed:", error);
                setIsLive(false);
                setLoading(false);
            });
        }

        // --- 2. Realtime Database Listener (Primary) ---
        let unsubscribeRTDB = () => { };
        if (realtimeDb) {
            const logsRef = rtdbQuery(ref(realtimeDb, 'AI_Logs'), limitToLast(50));
            unsubscribeRTDB = onValue(logsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const logsArray = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    })).reverse(); // Newest first

                    setLatestLogs(prev => {
                        const combined = [...logsArray, ...prev].slice(0, 100);
                        return Array.from(new Map(combined.map(item => [item.id || item.Time || Math.random(), item])).values());
                    });
                    setLoading(false);
                    setIsLive(true);
                }
            }, (error) => {
                console.warn("RTDB listener failed:", error);
                setIsLive(false);
                setLoading(false);
            });
        }

        return () => {
            unsubscribeFirestore();
            if (realtimeDb) unsubscribeRTDB();
        };
    }, []);

    // Transform raw logs into high-level energy units
    const { gatewayData, nodeData } = useMemo(() => {
        // Fallback for simulation/loading
        const createMockNode = (device: any, tx: any) => ({
            nodeId: device.id,
            name: device.name,
            zone: tx.name,
            phaseType: device.phaseType,
            targetKw: device.power / 1000,
            kwh: 0,
            kvarh: 0,
            currentKw: 0,
            phaseVoltages: [0, 0, 0] as [number, number, number],
            phaseCurrents: [0, 0, 0] as [number, number, number],
            powerFactor: 0.95,
            temperature: 45,
            vibration: 0,
            ppm: 420,
            isOnline: false,
            timestamp: new Date().toISOString()
        });

        if (latestLogs.length === 0) {
            const mockNodes = config.txUnits.flatMap(tx => tx.devices.map(d => createMockNode(d, tx)));
            return { gatewayData: null, nodeData: mockNodes };
        }

        // 1. Map TX Nodes based on latest unique telemetry per node_id
        const latestPerNode = new Map<string, any>();
        latestLogs.forEach(log => {
            const id = log.node_id || log.nodeId;
            if (id && !latestPerNode.has(id)) {
                latestPerNode.set(id, log);
            }
        });

        const txNodes: TXEnergyUnit[] = config.txUnits.flatMap(tx =>
            tx.devices.map(device => {
                const log = latestPerNode.get(tx.id) || latestPerNode.get(device.id);

                // --- Unified extraction logic for Nested vs Flat Industrial formats ---
                const rawTel = log?.telemetry || {};

                // 1. Identification & Timing
                const timestamp = log?.Time || log?.timestamp || new Date().toISOString();
                const lastSeen = new Date(timestamp).getTime();
                const isOnline = Date.now() - lastSeen < 45000; // Increased window for industrial latency

                // 2. Power Logic (Support both direct kW and calculated from phases)
                let currentKw = parseFloat(rawTel.active_power_kw || 0);
                if (currentKw === 0 && log?.R_A) {
                    // Calculate from industrial phase keys
                    const phasePower = (
                        (log.R_V || 230) * (log.R_A || 0) +
                        (log.Y_V || 230) * (log.Y_A || 0) +
                        (log.B_V || 230) * (log.B_A || 0)
                    );
                    currentKw = parseFloat((phasePower / 1000).toFixed(2));
                }

                // 3. Sensor Arrays
                const ppm = log?.CO2 || rawTel.co2_ppm || 420;
                const temp = log?.Temp || rawTel.temperature_c || 45;

                // Vibration: handle "NORM"/"HIGH" strings or numeric
                let vibration = rawTel.vibration_v_rms || 0;
                if (log?.Vib === "NORM") vibration = 0.45;
                else if (log?.Vib === "HIGH") vibration = 3.2;
                else if (typeof log?.Vib === 'number') vibration = log.Vib;

                return {
                    nodeId: device.id,
                    name: device.name,
                    zone: tx.name,
                    phaseType: device.phaseType,
                    targetKw: device.power / 1000,
                    kwh: log?.kwh || rawTel.kwh || 0,
                    kvarh: log?.kvarh || rawTel.kvarh || 0,
                    currentKw,
                    phaseVoltages: [log?.R_V || 400, log?.Y_V || 400, log?.B_V || 400],
                    phaseCurrents: [log?.R_A || 0, log?.Y_A || 0, log?.B_A || 0],
                    powerFactor: log?.PF || rawTel.power_factor || 0.92,
                    temperature: temp,
                    vibration: vibration,
                    ppm: ppm,
                    isOnline,
                    timestamp
                };
            })
        );

        // 2. Synthesize Gateway Data (Aggregate)
        const totalKwh = txNodes.reduce((acc, n) => acc + n.kwh, 0) * 1.02; // Simulate line loss overhead at RX
        const gateway: RXEnergyUnit = {
            gatewayId: config.id,
            name: config.name,
            totalKwh: totalKwh,
            totalKvarh: txNodes.reduce((acc, n) => acc + n.kvarh, 0),
            voltage: txNodes[0]?.phaseVoltages[0] || 400,
            current: txNodes.reduce((acc, n) => acc + n.phaseCurrents[0], 0),
            powerFactor: 0.92,
            timestamp: new Date().toISOString(),
            txNodes: txNodes
        };

        return { gatewayData: gateway, nodeData: txNodes };
    }, [latestLogs, config]);

    return (
        <TelemetryContext.Provider value={{ latestLogs, loading, isLive, gatewayData, nodeData }}>
            {children}
        </TelemetryContext.Provider>
    );
}

export function useTelemetry() {
    const context = useContext(TelemetryContext);
    if (!context) throw new Error('useTelemetry must be used within TelemetryProvider');
    return context;
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Activity, Zap, Leaf, AlertTriangle,
    ArrowDownRight, ArrowUpRight, Download, Server,
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { NotificationOverlay } from '@/components/NotificationSystem';
import { useEnergyNotifications } from '@/hooks/useEnergyNotifications';
import { calculateEnergyLoss, calculateMachineHealth, kwhToCo2Kg, getStatusColor } from '@/lib/energyCalculations';
import { debounce } from '@/lib/debounce';
import { cn } from '@/lib/utils';
import { useSystem } from '@/context/SystemContext';
import type { RXEnergyUnit, TXEnergyUnit } from '@/types/energy';

const COLORS = ['#10b981', '#fb923c', '#3b82f6', '#facc15'];

function generateMockGateway(tick: number, nodeConfigs: any[]): RXEnergyUnit {
    const jitter = () => (Math.random() - 0.5) * 2;
    const txNodes: TXEnergyUnit[] = nodeConfigs.map(config => {
        const baseKwh = (config.id === 'TX-1') ? 600 : (config.id === 'TX-2') ? 480 : (config.id === 'TX-3') ? 820 : 420;
        const currentKw = (config.id === 'TX-1') ? 12.4 : (config.id === 'TX-2') ? 8.2 : (config.id === 'TX-3') ? 45.1 : 64.8;

        const isThreePhase = config.phaseType === 'three';
        const phaseVoltages: [number, number, number] = isThreePhase ? [400 + jitter(), 402 + jitter(), 398 + jitter()] : [230 + jitter(), 0, 0];
        const phaseCurrents: [number, number, number] = isThreePhase ? [18 + jitter(), 17 + jitter(), 19 + jitter()] : [25 + jitter(), 0, 0];

        return {
            nodeId: config.id,
            name: config.name,
            zone: config.zone,
            phaseType: config.phaseType,
            targetKw: config.targetKw,
            kwh: baseKwh + jitter() * 10,
            kvarh: 180 + jitter() * 5,
            currentKw: currentKw + jitter(),
            phaseVoltages,
            phaseCurrents,
            powerFactor: 0.92 + jitter() * 0.05,
            temperature: 60 + jitter() * 5,
            timestamp: new Date().toISOString(),
        };
    });

    return {
        gatewayId: 'RX-PLANT-01',
        name: 'Main Plant Gateway',
        totalKwh: txNodes.reduce((acc, n) => acc + n.kwh, 0) * 1.05 + jitter() * 10,
        totalKvarh: 890 + jitter() * 10,
        voltage: 400 + jitter() * 5,
        current: 125 + jitter() * 3,
        powerFactor: 0.91 + jitter() * 0.03,
        timestamp: new Date().toISOString(),
        txNodes,
    };
}

const historicalTrend = [
    { time: '00:00', kwh: 120, predicted: 125 },
    { time: '04:00', kwh: 110, predicted: 115 },
    { time: '08:00', kwh: 350, predicted: 340 },
    { time: '12:00', kwh: 480, predicted: 490 },
    { time: '16:00', kwh: 520, predicted: 510 },
    { time: '20:00', kwh: 310, predicted: 300 },
];

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const [gateway, setGateway] = useState<RXEnergyUnit | null>(null);
    const [tick, setTick] = useState(0);
    const { addNotification } = useEnergyNotifications();
    const { config } = useSystem();

    const debouncedLossCheck = useRef(
        debounce((gw: RXEnergyUnit) => {
            const lossResult = calculateEnergyLoss(gw);
            if (lossResult.status === 'critical-loss') {
                addNotification({
                    severity: 'critical',
                    title: '⚡ Critical Energy Loss',
                    message: `${gw.name}: ${lossResult.lossPercent.toFixed(1)}% loss detected.`,
                    gatewayId: gw.gatewayId,
                    lossPercent: lossResult.lossPercent,
                });
            }
        }, 500)
    ).current;

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted) return;
        const poll = () => {
            setTick((t) => {
                const newGateway = generateMockGateway(t, config.nodes);
                setGateway(newGateway);
                debouncedLossCheck(newGateway);
                return t + 1;
            });
        };
        poll();
        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
    }, [mounted, debouncedLossCheck, config.nodes]);

    if (!mounted || !gateway) return <div className="p-20 text-center">Loading CarbonX Dashboard...</div>;

    const lossResult = calculateEnergyLoss(gateway);
    const totalCo2 = kwhToCo2Kg(gateway.totalKwh);
    const trendData = [...historicalTrend, { time: 'Now', kwh: Math.round(gateway.totalKwh / 10), predicted: 285 }];
    const pieData = gateway.txNodes.map((n) => ({ name: n.nodeId, value: Math.round(n.kwh) }));

    return (
        <div className="space-y-6 pb-10 fade-in px-4 md:px-0">
            <NotificationOverlay />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-8 glass-thick md:rounded-[50px] rounded-[35px] shadow-sm border border-brand-green-light/10 relative overflow-hidden group">
                <div className="absolute inset-0 grid-overlay opacity-10 -z-10" />
                <div className="flex items-center gap-5">
                    <div className="w-18 h-18 rounded-3xl bg-brand-green-light/5 flex items-center justify-center border border-brand-green-light/20 shadow-inner group-hover:bg-brand-green-light/10 transition-colors">
                        <Image src="/logo.png" alt="Logo" width={50} height={50} className="group-hover:rotate-12 transition-transform duration-500 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-brand-green-dark leading-none">Command Center</h1>
                        <p className="text-brand-green-dark/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Node Protocol: {gateway.name}</p>
                    </div>
                </div>
                <div className="mt-6 lg:mt-0 flex flex-wrap gap-3">
                    <Badge variant="outline" className="bg-brand-green-light/10 border-brand-green-light/20 text-brand-green-light px-6 py-2.5 rounded-full font-black italic uppercase tracking-widest text-[10px] flex items-center shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-green-light animate-pulse mr-3" />
                        Live Rx/Tx
                    </Badge>
                    <Badge variant="outline" className="bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow px-6 py-2.5 rounded-full font-black italic uppercase tracking-widest text-[10px] shadow-sm">
                        AI Verified
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card theme-mint shine-hover border-none shadow-sm md:rounded-[35px] rounded-3xl">
                    <CardContent className="p-7">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center border border-white shadow-inner">
                                <Zap className="text-emerald-700" size={24} />
                            </div>
                            <ArrowUpRight className="text-emerald-700/20" size={20} />
                        </div>
                        <div className="text-[10px] font-black text-emerald-900/30 uppercase tracking-[0.2em] mb-1 italic">Consolidated RX</div>
                        <div className="text-4xl font-black text-emerald-900 tracking-tighter italic">{gateway.totalKwh.toFixed(0)} <span className="text-lg opacity-30">kWh</span></div>
                        <div className="text-[8px] font-black text-emerald-700/40 mt-6 bg-white/40 px-3 py-1.5 rounded-full w-fit uppercase tracking-widest shadow-sm">Protocol 4.0 Reading</div>
                    </CardContent>
                </Card>

                <Card className="glass-card theme-peach shine-hover border-none shadow-sm md:rounded-[35px] rounded-3xl">
                    <CardContent className="p-7">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center border border-white shadow-inner">
                                <Leaf className="text-orange-700" size={24} />
                            </div>
                            <Activity className="text-orange-700/20" size={20} />
                        </div>
                        <div className="text-[10px] font-black text-orange-900/30 uppercase tracking-[0.2em] mb-1 italic">Carbon Footprint</div>
                        <div className="text-4xl font-black text-orange-900 tracking-tighter italic">{totalCo2.toFixed(0)} <span className="text-lg opacity-30">kg</span></div>
                        <div className="text-[8px] font-black text-orange-700/40 mt-6 bg-white/40 px-3 py-1.5 rounded-full w-fit uppercase tracking-widest shadow-sm">Delta Tracking</div>
                    </CardContent>
                </Card>

                <Card className="glass-card theme-blue shine-hover border-none shadow-sm md:rounded-[35px] rounded-3xl">
                    <CardContent className="p-7">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center border border-white shadow-inner">
                                <Server className="text-blue-700" size={24} />
                            </div>
                            <Download className="text-blue-700/20" size={20} />
                        </div>
                        <div className="text-[10px] font-black text-blue-900/30 uppercase tracking-[0.2em] mb-1 italic">Stability Score</div>
                        <div className="text-4xl font-black text-blue-900 tracking-tighter italic">92 <span className="text-lg opacity-30">/100</span></div>
                        <Progress value={92} className="h-2 mt-6 bg-blue-900/5 rounded-full" />
                    </CardContent>
                </Card>

                <Card className="glass-card theme-yellow shine-hover border-none shadow-sm md:rounded-[35px] rounded-3xl">
                    <CardContent className="p-7">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center border border-white shadow-inner">
                                <AlertTriangle className="text-yellow-700" size={24} />
                            </div>
                            <ArrowDownRight className="text-yellow-700/20" size={20} />
                        </div>
                        <div className="text-[10px] font-black text-yellow-900/30 uppercase tracking-[0.2em] mb-1 italic">Transmission Loss</div>
                        <div className="text-4xl font-black text-yellow-900 tracking-tighter italic">{lossResult.lossPercent.toFixed(1)} <span className="text-lg opacity-30">%</span></div>
                        <div className="text-[8px] font-black text-yellow-700 mt-6 bg-white/60 px-3 py-1.5 rounded-full w-fit uppercase tracking-widest border border-yellow-700/10">Limit: {config.lossThreshold}%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card md:rounded-[40px] rounded-3xl border-brand-green-light/5">
                    <CardHeader className="pt-8 px-8">
                        <CardTitle className="text-brand-green-dark text-xl font-black italic uppercase tracking-tight">Forensic Consumption Trend</CardTitle>
                        <p className="text-[10px] font-bold text-brand-green-dark/40 uppercase tracking-widest italic">Live vs AI Predictive Modeling</p>
                    </CardHeader>
                    <CardContent className="h-[320px] pb-8 px-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.05} vertical={false} />
                                <XAxis dataKey="time" stroke="#000" strokeOpacity={0.4} tick={{ fontSize: 10, fontWeight: 900 }} axisLine={false} />
                                <YAxis stroke="#000" strokeOpacity={0.4} tick={{ fontSize: 10, fontWeight: 900 }} axisLine={false} />
                                <RechartsTooltip
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: 'none',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                                        background: 'rgba(255,255,255,0.8)',
                                        backdropFilter: 'blur(20px)',
                                        fontWeight: '900',
                                        fontSize: '12px',
                                        textTransform: 'uppercase'
                                    }}
                                />
                                <Line type="step" dataKey="kwh" stroke="#10b981" strokeWidth={5} dot={{ r: 6, fill: '#10b981', strokeWidth: 4, stroke: '#fff' }} strokeLinecap="round" />
                                <Line type="monotone" dataKey="predicted" stroke="#facc15" strokeWidth={3} strokeDasharray="10 10" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="glass-card md:rounded-[40px] rounded-3xl border-brand-green-light/5">
                    <CardHeader className="pt-8 px-8">
                        <CardTitle className="text-brand-green-dark text-xl font-black italic uppercase tracking-tight">Node Topology Load</CardTitle>
                        <p className="text-[10px] font-bold text-brand-green-dark/40 uppercase tracking-widest italic">Inventory Power Distribution</p>
                    </CardHeader>
                    <CardContent className="h-[320px] flex items-center pr-8">
                        <ResponsiveContainer width="60%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    dataKey="value"
                                    stroke="#fff"
                                    strokeWidth={4}
                                    paddingAngle={8}
                                >
                                    {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />)}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-4">
                            {pieData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="text-[11px] font-black text-brand-green-dark/40 uppercase italic">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-brand-green-dark italic tracking-tighter">{item.value} <span className="text-[10px] opacity-40 italic">kWh</span></span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {gateway.txNodes.map((node, idx) => {
                    const health = calculateMachineHealth(node);
                    const color = getStatusColor(health.status);
                    const themes = ['theme-mint', 'theme-peach', 'theme-blue', 'theme-yellow'];
                    return (
                        <Card key={node.nodeId} className={cn("glass-card shine-hover md:rounded-[35px] rounded-3xl overflow-hidden", themes[idx % 4])}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <div className="text-xl font-black italic text-brand-green-dark tracking-tighter uppercase">{node.nodeId}</div>
                                        <Badge variant="outline" className="text-[7px] h-4 bg-white/40 border-black/5 uppercase font-black tracking-widest mt-1">
                                            {node.phaseType} PH PROTOCOL
                                        </Badge>
                                    </div>
                                    <div className="w-3 h-3 rounded-full animate-pulse shadow-sm shadow-black/10" style={{ backgroundColor: color }} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-black italic uppercase tracking-wider">
                                        <span className="opacity-30">AI Health Logic</span>
                                        <span style={{ color }} className="brightness-90">{health.score}%</span>
                                    </div>
                                    <Progress value={health.score} className="h-1.5 bg-black/5 rounded-full" />
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="bg-white/40 p-3 rounded-2xl border border-white shadow-sm">
                                            <div className="text-[8px] font-black opacity-30 uppercase italic mb-1">Load</div>
                                            <div className="text-sm font-black text-brand-green-dark italic tracking-tighter">{node.currentKw.toFixed(1)} kW</div>
                                        </div>
                                        <div className="bg-white/40 p-3 rounded-2xl border border-white shadow-sm">
                                            <div className="text-[8px] font-black opacity-30 uppercase italic mb-1">Cap</div>
                                            <div className="text-sm font-black text-brand-green-dark italic tracking-tighter">{node.targetKw} kW</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '@/context/SystemContext';
import { GaugeChart } from '@/components/GaugeChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Activity, ShieldCheck, Zap, Thermometer, Info } from 'lucide-react';
import type { TXEnergyUnit } from '@/types/energy';
import { cn } from '@/lib/utils';

// Mock live data generator for gauges
function generateMockMachineData(nodeConfigs: any[]): TXEnergyUnit[] {
    const jitter = () => (Math.random() - 0.5) * 2;
    return nodeConfigs.map(config => {
        const isThreePhase = config.phaseType === 'three';
        const basePower = (config.id === 'TX-3') ? 45.1 : (config.id === 'TX-4') ? 64.8 : 12.4;

        return {
            nodeId: config.id,
            name: config.name,
            zone: config.zone,
            phaseType: config.phaseType,
            targetKw: config.targetKw,
            kwh: 500, // Static for health page
            kvarh: 200,
            currentKw: basePower + jitter() * 2,
            phaseVoltages: isThreePhase ? [400 + jitter(), 402 + jitter(), 398 + jitter()] : [230 + jitter(), 0, 0],
            phaseCurrents: isThreePhase ? [18 + jitter(), 17 + jitter(), 19 + jitter()] : [25 + jitter(), 0, 0],
            powerFactor: 0.94 + jitter() * 0.02,
            temperature: 55 + jitter() * 5,
            timestamp: new Date().toISOString(),
        };
    });
}

const ZONES = ['Zone-A', 'Zone-B', 'Zone-C'];

export default function MachinesPage() {
    const { config } = useSystem();
    const [machines, setMachines] = useState<TXEnergyUnit[]>([]);
    const [activeZone, setActiveZone] = useState('Zone-A');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const poll = () => {
            setMachines(generateMockMachineData(config.nodes));
        };
        poll();
        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
    }, [config.nodes]);

    if (!mounted) return null;

    const filteredMachines = machines.filter(m => m.zone === activeZone);

    return (
        <div className="fade-in space-y-8 pb-20">
            {/* Header Area */}
            <div className="glass p-8 rounded-4xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tight text-brand-green-dark flex items-center gap-3">
                        <Activity className="text-brand-green-light" size={32} />
                        Machine Health
                    </h1>
                    <p className="text-brand-green-dark/60 font-medium mt-1">Real-time telemetry and gauge monitoring across plant zones.</p>
                </div>

                <div className="mt-6 md:mt-0 flex gap-4 relative z-10">
                    <div className="glass bg-brand-green-light/10 border-brand-green-light/20 px-6 py-3 rounded-2xl">
                        <div className="text-[10px] font-black opacity-40 uppercase tracking-widest text-brand-green-dark">Operational Machines</div>
                        <div className="text-2xl font-black text-brand-green-dark">{filteredMachines.length} / {machines.length} <span className="text-sm opacity-40">Online</span></div>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green-light/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Zone Filter Tabs */}
            <Tabs value={activeZone} onValueChange={setActiveZone} className="w-full">
                <TabsList className="bg-transparent h-auto p-0 gap-4 flex-wrap">
                    {ZONES.map(zone => (
                        <TabsTrigger
                            key={zone}
                            value={zone}
                            className={cn(
                                "px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300",
                                "data-[state=active]:bg-brand-green-dark data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-brand-green-dark/20",
                                "data-[state=inactive]:bg-white/50 data-[state=inactive]:text-brand-green-dark/40 data-[state=inactive]:hover:bg-white"
                            )}
                        >
                            {zone}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {ZONES.map(zone => (
                    <TabsContent key={zone} value={zone} className="mt-8">
                        <div className="grid grid-cols-1 gap-8">
                            {filteredMachines.length > 0 ? (
                                filteredMachines.map(machine => (
                                    <Card key={machine.nodeId} className="glass-card border-none overflow-hidden hover:shadow-2xl transition-all duration-500">
                                        <CardHeader className="bg-brand-green-dark/[0.02] border-b border-black/5 p-6">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle className="text-2xl font-black text-brand-green-dark flex items-center gap-3">
                                                        <ShieldCheck className="text-brand-green-light" size={24} />
                                                        {machine.name}
                                                    </CardTitle>
                                                    <Badge variant="outline" className="mt-2 bg-white/50 border-black/5 text-[10px] font-black uppercase">
                                                        ID: {machine.nodeId} • {machine.phaseType} Phase
                                                    </Badge>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">Efficiency</div>
                                                    <div className="text-xl font-black text-brand-green-dark">{(machine.powerFactor * 100).toFixed(0)}%</div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                                {/* Gauge 1: Power */}
                                                <GaugeChart
                                                    label={`${machine.zone} Power`}
                                                    value={machine.currentKw}
                                                    max={machine.targetKw * 1.5}
                                                    unit="kW"
                                                />

                                                {/* Gauge 2: Current */}
                                                <GaugeChart
                                                    label={`${machine.zone} Current`}
                                                    value={machine.phaseCurrents[0]}
                                                    max={100}
                                                    unit="Amps"
                                                />

                                                {/* Gauge 3: Voltage */}
                                                <GaugeChart
                                                    label={`${machine.zone} Voltage`}
                                                    value={machine.phaseVoltages[0]}
                                                    max={500}
                                                    unit="Volts"
                                                />
                                            </div>

                                            {/* Machine Details Footer */}
                                            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-3xl bg-black/5">
                                                <div className="p-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-black opacity-40 uppercase mb-1">
                                                        <Thermometer size={14} className="text-orange-500" /> Temperature
                                                    </div>
                                                    <div className="font-black text-brand-green-dark">{machine.temperature.toFixed(1)}°C</div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-black opacity-40 uppercase mb-1">
                                                        <Zap size={14} className="text-brand-yellow" /> Power Factor
                                                    </div>
                                                    <div className="font-black text-brand-green-dark">{machine.powerFactor.toFixed(2)}</div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-black opacity-40 uppercase mb-1">
                                                        <Activity size={14} className="text-blue-500" /> Active Frequency
                                                    </div>
                                                    <div className="font-black text-brand-green-dark">50.02 Hz</div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-black opacity-40 uppercase mb-1">
                                                        <Info size={14} className="text-emerald-500" /> Last Sync
                                                    </div>
                                                    <div className="font-black text-brand-green-dark/40 text-[11px]">Just Now</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="glass p-20 rounded-4xl text-center border-none shadow-sm">
                                    <div className="w-20 h-20 bg-brand-green-light/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Activity className="text-brand-green-light/40" size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-brand-green-dark mb-2">No Machines Detected</h3>
                                    <p className="text-brand-green-dark/40 font-medium">There are no TX nodes assigned to {zone} in the system config.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

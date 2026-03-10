'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '@/context/SystemContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Zap, Activity, ShieldAlert, Cpu,
    ArrowRightLeft, Gauge, Waves, Info
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    Cell, Cell as RechartsCell
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['#10b981', '#fb923c', '#3b82f6'];

export default function EnergyMonitorPage() {
    const { config } = useSystem();
    const [mounted, setMounted] = useState(false);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => setTick(t => t + 1), 3000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    // Simulation Data
    const totalKw = config.nodes.reduce((acc, n) => acc + (n.targetKw * (0.7 + Math.random() * 0.3)), 0);
    const rxKwh = totalKw * 1.08; // Simulate 8% leakage/loss at RX level
    const lossKw = rxKwh - totalKw;
    const lossPercent = (lossKw / rxKwh) * 100;

    const phaseData = [
        { phase: 'L1', voltage: 231 + Math.random() * 2, current: 85 + Math.random() * 5 },
        { phase: 'L2', voltage: 229 + Math.random() * 2, current: 82 + Math.random() * 5 },
        { phase: 'L3', voltage: 232 + Math.random() * 2, current: 88 + Math.random() * 5 },
    ];

    return (
        <div className="fade-in space-y-8 pb-20">
            {/* Energy Header */}
            <div className="glass p-8 rounded-4xl flex flex-col md:flex-row justify-between items-center shadow-sm border border-brand-green-light/10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-brand-green-light/10 flex items-center justify-center border border-brand-green-light/20 shadow-inner">
                        <Zap className="text-brand-green-light" size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-brand-green-dark">Energy Control</h1>
                        <p className="text-brand-green-dark/60 font-medium">Real-time Phase Distribution & Transmission Quality.</p>
                    </div>
                </div>
                <div className="mt-6 md:mt-0 flex gap-4">
                    <div className="glass flex items-center gap-4 px-6 py-3 rounded-2xl border-none">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-black text-brand-green-dark">GRID SYNC: 50.02 Hz</span>
                    </div>
                </div>
            </div>

            {/* Control Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card theme-mint border-none p-6 shine-hover">
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Total Plant Load</div>
                    <div className="text-3xl font-black text-emerald-950">{totalKw.toFixed(1)} <span className="text-lg opacity-40">kW</span></div>
                    <div className="mt-4 flex items-center gap-2 text-emerald-700/60 font-bold text-[10px] uppercase">
                        <Activity size={12} /> Live consumption
                    </div>
                </Card>

                <Card className="glass-card theme-blue border-none p-6 shine-hover">
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Transmission Loss</div>
                    <div className="text-3xl font-black text-blue-950">{lossPercent.toFixed(1)} <span className="text-lg opacity-40">%</span></div>
                    <Progress value={lossPercent} className="h-1.5 mt-4 bg-blue-950/10" />
                </Card>

                <Card className="glass-card theme-peach border-none p-6 shine-hover">
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Power Factor</div>
                    <div className="text-3xl font-black text-orange-950">0.96 <span className="text-lg opacity-40">Lag</span></div>
                    <div className="mt-4 flex items-center gap-2 text-orange-700/60 font-bold text-[10px] uppercase">
                        <Cpu size={12} /> Highly Efficient
                    </div>
                </Card>

                <Card className="glass-card theme-yellow border-none p-6 shine-hover">
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Average Voltage</div>
                    <div className="text-3xl font-black text-yellow-950">401 <span className="text-lg opacity-40">V</span></div>
                    <div className="mt-4 flex items-center gap-2 text-yellow-700/60 font-bold text-[10px] uppercase">
                        <ShieldAlert size={12} /> Within Safe Limits
                    </div>
                </Card>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Phase Balancing Chart */}
                <Card className="glass-card lg:col-span-2 p-8">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black text-brand-green-dark tracking-tight">Phase Balancing (RX Gateway)</h2>
                        <div className="flex gap-2">
                            <Badge className="bg-emerald-500 text-white font-black text-[10px]">L1</Badge>
                            <Badge className="bg-orange-500 text-white font-black text-[10px]">L2</Badge>
                            <Badge className="bg-blue-500 text-white font-black text-[10px]">L3</Badge>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={phaseData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="phase" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900, fill: '#64748b' }} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                                />
                                <Bar dataKey="current" radius={[12, 12, 0, 0]} barSize={60}>
                                    {phaseData.map((_, index) => (
                                        <RechartsCell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 flex justify-center gap-12 font-black text-[10px] tracking-widest text-brand-green-dark/40 uppercase">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-brand-green-dark">Current Balance</span>
                            <span className="text-emerald-600">98.2% Optimized</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-brand-green-dark">Voltage Deviation</span>
                            <span className="text-blue-600">± 1.2 Volts</span>
                        </div>
                    </div>
                </Card>

                {/* Efficiency Stats */}
                <div className="space-y-6">
                    <Card className="glass-card theme-blue p-8 border-none flex flex-col items-center text-center">
                        <Gauge className="text-blue-700 mb-4" size={40} />
                        <h3 className="text-lg font-black text-blue-900 uppercase tracking-widest">Load Factor</h3>
                        <div className="text-5xl font-black text-blue-950 my-2">0.84</div>
                        <p className="text-[10px] font-black opacity-40 text-blue-900 leading-tight uppercase px-4">
                            Ideal load factor maintained to prevent equipment heat-stress.
                        </p>
                    </Card>

                    <Card className="glass-card theme-peach p-8 border-none flex flex-col items-center text-center">
                        <Waves className="text-orange-700 mb-4" size={40} />
                        <h3 className="text-lg font-black text-orange-900 uppercase tracking-widest">Reactive Power</h3>
                        <div className="text-5xl font-black text-orange-950 my-2">12.4</div>
                        <div className="text-[10px] font-black opacity-40 text-orange-900 uppercase tracking-widest">kVAR per Unit</div>
                    </Card>
                </div>
            </div>

            {/* Loss Alert Advisory */}
            <div className="glass p-8 rounded-4xl border-2 border-dashed border-brand-green-light/20 flex gap-8 items-center bg-brand-green-light/[0.02]">
                <div className="w-14 h-14 rounded-2xl bg-white/80 border border-brand-green-light/20 flex items-center justify-center text-brand-green-dark shadow-sm shrink-0">
                    <Info size={32} />
                </div>
                <div>
                    <h4 className="text-lg font-black text-brand-green-dark">Energy Advisory Protocol</h4>
                    <p className="text-xs font-bold text-brand-green-dark/60 mt-1 max-w-3xl">
                        Plant transmission loss is currently at <span className="text-emerald-600 font-black">{lossPercent.toFixed(1)}%</span>.
                        While within the <span className="text-brand-green-dark font-black">10% threshold</span>, L3 Phase at RX-PLANT-01 is carrying 7% more load than L2.
                        Rebalancing TX-3 connection is advised during the next scheduled maintenance to maximize transformer lifespan.
                    </p>
                </div>
            </div>
        </div>
    );
}

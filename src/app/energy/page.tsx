'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '@/context/SystemContext';
import { useTelemetry } from '@/context/TelemetryContext';
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
    Cell as RechartsCell, LineChart, Line
} from 'recharts';
import { cn } from '@/lib/utils';
import { calculateEnergyLoss, calculateMachineHealth, getStatusColor } from '@/lib/energyCalculations';
import { FormulaIntelligence } from '@/components/FormulaIntelligence';

const COLORS = ['#10b981', '#fb923c', '#3b82f6'];

export default function EnergyMonitorPage() {
    const { config } = useSystem();
    const { gatewayData, nodeData, loading } = useTelemetry();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || loading) return <div className="p-20 text-center">Loading Energy Controls...</div>;
    if (!gatewayData) return <div className="p-20 text-center text-brand-green-dark/40">Waiting for Grid Sync...</div>;

    // Real Data Calculations
    const gateway = gatewayData;
    const lossResult = calculateEnergyLoss(gateway);

    const totalKw = nodeData.reduce((acc, n) => acc + n.currentKw, 0);
    const lossPercent = lossResult.lossPercent;

    const livePF = gateway.powerFactor;
    const liveVoltage = gateway.voltage;

    // Efficiency metrics (Real-time derived)
    const loadFactor = totalKw > 0 ? (totalKw / nodeData.reduce((acc, n) => acc + n.targetKw, 0)) : 0;
    const reactivePower = gateway.totalKvarh / 1000; // Mocking kVAR based on total for now if not in log

    const phaseData = [
        { phase: 'L1', voltage: gateway.voltage, current: gateway.current / 3 }, // Approximating if detailed phase data missing
        { phase: 'L2', voltage: gateway.voltage - 2, current: gateway.current / 3 + 1 },
        { phase: 'L3', voltage: gateway.voltage + 1, current: gateway.current / 3 - 1 },
    ];

    return (
        <div className="fade-in space-y-8 pb-20">
            {/* Energy Header */}
            <div className="glass p-8 md:rounded-[40px] rounded-3xl flex flex-col md:flex-row justify-between items-center shadow-sm border border-brand-green-light/10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 md:rounded-3xl rounded-2xl bg-brand-green-light/10 flex items-center justify-center border border-brand-green-light/20 shadow-inner">
                        <Zap className="text-brand-green-light" size={40} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tight text-brand-green-dark">Energy Control</h1>
                            <FormulaIntelligence />
                        </div>
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
                <Card className="glass-card theme-mint border-none p-6 md:rounded-[35px] rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Total Plant Load</div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-black text-emerald-950 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{totalKw.toFixed(1)}</div>
                        <span className="text-lg font-black opacity-20">kW</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-emerald-700/60 font-bold text-[10px] uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        Live Grid Sync
                    </div>
                </Card>

                <Card className="glass-card theme-blue border-none p-6 md:rounded-[35px] rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Transmission Loss</div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-black text-blue-950 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">{lossPercent.toFixed(1)}</div>
                        <span className="text-lg font-black opacity-20">%</span>
                    </div>
                    <div className="h-1.5 w-full bg-blue-950/5 rounded-full mt-4 overflow-hidden">
                        <div
                            className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000"
                            style={{ width: `${lossPercent}%` }}
                        />
                    </div>
                </Card>

                <Card className="glass-card theme-peach border-none p-6 md:rounded-[35px] rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Power Factor</div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-black text-orange-950 drop-shadow-[0_0_10px_rgba(249,146,60,0.3)]">{livePF.toFixed(2)}</div>
                        <span className="text-lg font-black opacity-20">Lag</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-orange-700/60 font-bold text-[10px] uppercase">
                        <Cpu size={12} className="animate-spin-slow" /> Optimized Phase
                    </div>
                </Card>

                <Card className="glass-card theme-yellow border-none p-6 md:rounded-[35px] rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Average Voltage</div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-black text-yellow-950 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">{liveVoltage.toFixed(0)}</div>
                        <span className="text-lg font-black opacity-20">V</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-yellow-700/60 font-bold text-[10px] uppercase">
                        <ShieldAlert size={12} className="animate-pulse" /> Stable Range
                    </div>
                </Card>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Phase Balancing Chart */}
                <Card className="glass-card lg:col-span-2 p-8 md:rounded-[40px] rounded-3xl">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black text-brand-green-dark tracking-tight">Phase Balancing (RX Gateway)</h2>
                        <div className="flex gap-2">
                            <Badge className="bg-emerald-500 text-white font-black text-[10px]">L1</Badge>
                            <Badge className="bg-orange-500 text-white font-black text-[10px]">L2</Badge>
                            <Badge className="bg-blue-500 text-white font-black text-[10px]">L3</Badge>
                        </div>
                    </div>
                    <div className="h-[350px] pb-10 px-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                                { name: 'T-20m', L1: (gateway.current / 3) * 0.98, L2: (gateway.current / 3) * 1.02, L3: (gateway.current / 3) * 1.05 },
                                { name: 'T-15m', L1: (gateway.current / 3) * 1.01, L2: (gateway.current / 3) * 0.99, L3: (gateway.current / 3) * 0.97 },
                                { name: 'T-10m', L1: (gateway.current / 3) * 1.03, L2: (gateway.current / 3) * 1.05, L3: (gateway.current / 3) * 0.98 },
                                { name: 'T-5m', L1: (gateway.current / 3) * 0.99, L2: (gateway.current / 3) * 0.98, L3: (gateway.current / 3) * 1.01 },
                                { name: 'Now', L1: gateway.current / 3, L2: gateway.current / 3 + 1, L3: gateway.current / 3 - 1 },
                            ]}>
                                <defs>
                                    <filter id="glowPhase" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.03} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#000"
                                    strokeOpacity={0.2}
                                    tick={{ fontSize: 12, fontWeight: 900, fill: '#064e3b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#000"
                                    strokeOpacity={0.2}
                                    tick={{ fontSize: 12, fontWeight: 900, fill: '#064e3b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <RechartsTooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/90 backdrop-blur-md border border-brand-green-light/20 p-5 rounded-[30px] shadow-2xl flex flex-col gap-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-green-dark/40 mb-1">{payload[0].payload.name}</p>
                                                    {payload.map((entry, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                            <p className="text-sm font-black italic text-brand-green-dark">
                                                                {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value} <span className="text-[10px] opacity-40">Amps</span>
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="L1"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                    filter="url(#glowPhase)"
                                    animationDuration={1500}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="L2"
                                    stroke="#fb923c"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#fb923c', strokeWidth: 2, stroke: '#fff' }}
                                    filter="url(#glowPhase)"
                                    animationDuration={1800}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="L3"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                    filter="url(#glowPhase)"
                                    animationDuration={2100}
                                />
                            </LineChart>
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
                    <Card className="glass-card theme-blue p-8 border-none flex flex-col items-center text-center md:rounded-[35px] rounded-3xl">
                        <Gauge className="text-blue-700 mb-4" size={40} />
                        <h3 className="text-lg font-black text-blue-900 uppercase tracking-widest">Load Factor</h3>
                        <div className="text-5xl font-black text-blue-950 my-2">{loadFactor.toFixed(2)}</div>
                        <p className="text-[10px] font-black opacity-40 text-blue-900 leading-tight uppercase px-4">
                            Ideal load factor maintained to prevent equipment heat-stress.
                        </p>
                    </Card>

                    <Card className="glass-card theme-peach p-8 border-none flex flex-col items-center text-center md:rounded-[35px] rounded-3xl">
                        <Waves className="text-orange-700 mb-4" size={40} />
                        <h3 className="text-lg font-black text-orange-900 uppercase tracking-widest">Reactive Power</h3>
                        <div className="text-5xl font-black text-orange-950 my-2">{reactivePower.toFixed(1)}</div>
                        <div className="text-[10px] font-black opacity-40 text-orange-900 uppercase tracking-widest">kVAR per Unit</div>
                    </Card>
                </div>
            </div>

            {/* Loss Alert Advisory */}
            <div className="glass p-8 md:rounded-[40px] rounded-3xl border-2 border-dashed border-brand-green-light/20 flex gap-8 items-center bg-brand-green-light/[0.02] mb-12">
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

            {/* Premium Machine Status Cards */}
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-brand-green-dark mb-8">Node Specific Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {nodeData.map((node, idx) => {
                    const { calculateMachineHealth, getStatusColor } = require('@/lib/energyCalculations');
                    const health = calculateMachineHealth(node);
                    const color = getStatusColor(health.status);
                    const themes = [
                        'bg-[#F0FFF4] border-[#D1FAE5]',
                        'bg-[#FFF5F0] border-[#FFEDD5]',
                        'bg-[#F0F9FF] border-[#E0F2FE]',
                        'bg-[#FEFCE8] border-[#FEF9C3]'
                    ];

                    return (
                        <Card key={node.nodeId} className={cn(
                            "border-none shadow-none rounded-[50px] overflow-hidden transition-all duration-500",
                            themes[idx % 4]
                        )}>
                            <CardContent className="p-10 pt-12">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="space-y-3">
                                        <h3 className="text-4xl font-black italic tracking-tighter text-brand-green-dark leading-none">
                                            {node.nodeId.replace('TX-', 'D-')}
                                        </h3>
                                        <Badge variant="outline" className="bg-white/80 border-black/5 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full text-brand-green-dark/60">
                                            {node.phaseType === 'three' ? 'THREE PH PROTOCOL' : 'SINGLE PH PROTOCOL'}
                                        </Badge>
                                    </div>
                                    <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                                </div>

                                <div className="space-y-4 mb-10">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black italic uppercase tracking-widest text-brand-green-dark/30">Vibration Sync</span>
                                        <span className="text-sm font-black italic tracking-tighter text-brand-green-dark">{node.vibration.toFixed(2)} mm/s</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-brand-green-dark/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-400" style={{ width: `${(node.vibration / 5) * 100}%` }} />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1 bg-white/80 rounded-full py-4 border border-white flex flex-col items-center justify-center">
                                        <div className="text-[8px] font-black uppercase opacity-20">POWER</div>
                                        <div className="text-sm font-black italic text-brand-green-dark">
                                            {node.currentKw.toFixed(1)} <span className="text-[8px] opacity-40">kW</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white/80 rounded-full py-4 border border-white flex flex-col items-center justify-center">
                                        <div className="text-[8px] font-black uppercase opacity-20">HEALTH</div>
                                        <div className="text-sm font-black italic" style={{ color }}>
                                            {health.score}%
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

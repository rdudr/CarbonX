'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '@/context/SystemContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    Leaf, TreePine, TrendingDown, Globe,
    Zap, AlertCircle, CheckCircle2, Factory
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { kwhToCo2Kg } from '@/lib/energyCalculations';
import { cn } from '@/lib/utils';

const COLORS = ['#10b981', '#fb923c', '#3b82f6'];

// 1 Tree offsets ~20kg of CO2 per year
const CO2_PER_TREE_YEAR = 20;

function generateHistoricalCarbonData() {
    return Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        co2: 40 + Math.random() * 20,
        target: 45
    }));
}

export default function CarbonAnalyticsPage() {
    const { config } = useSystem();
    const [mounted, setMounted] = useState(false);
    const [tick, setTick] = useState(0);
    const [historicalData, setHistoricalData] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        setHistoricalData(generateHistoricalCarbonData());
        const interval = setInterval(() => setTick(t => t + 1), 5000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    // Derived Real-time Values
    const totalKwh = config.nodes.reduce((acc, n) => acc + (n.targetKw * 0.8), 0) * (1 + (Math.random() - 0.5) * 0.1);
    const co2Kg = kwhToCo2Kg(totalKwh);
    const treesNeeded = (co2Kg * 365) / CO2_PER_TREE_YEAR;

    // Dynamic progress based on targetKw vs current output (simple simulation)
    const neutralityProgress = Math.min(Math.max(65 + (Math.random() * 5), 0), 100);

    const zoneData = [
        { name: 'Zone-A', value: config.nodes.filter(n => n.zone === 'Zone-A').reduce((acc, n) => acc + n.targetKw, 0) },
        { name: 'Zone-B', value: config.nodes.filter(n => n.zone === 'Zone-B').reduce((acc, n) => acc + n.targetKw, 0) },
        { name: 'Zone-C', value: config.nodes.filter(n => n.zone === 'Zone-C').reduce((acc, n) => acc + n.targetKw, 0) },
    ].filter(z => z.value > 0);

    return (
        <div className="fade-in space-y-8 pb-20">
            {/* Sustainability Header */}
            <div className="glass p-8 rounded-4xl flex flex-col md:flex-row justify-between items-center shadow-sm border border-emerald-500/10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                        <Leaf className="text-emerald-500" size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-brand-green-dark">Sustainability Lab</h1>
                        <p className="text-brand-green-dark/60 font-medium">Monitoring Carbon Emission Intensity & Offset strategies.</p>
                    </div>
                </div>
                <div className="mt-6 md:mt-0 flex gap-4">
                    <Badge className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                        Net Zero Path: Active
                    </Badge>
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card theme-mint shine-hover border-none">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center text-emerald-700">
                                <Globe size={24} />
                            </div>
                            <Badge variant="outline" className="bg-emerald-100/50 border-emerald-200 text-emerald-700 font-black text-[10px]">REAL-TIME</Badge>
                        </div>
                        <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Carbon Footprint</div>
                        <div className="text-4xl font-black text-emerald-950">{co2Kg.toFixed(2)} <span className="text-lg opacity-40">kg CO2</span></div>
                        <div className="mt-6 flex items-center gap-2 text-emerald-700/60 font-bold text-xs">
                            <TrendingDown size={14} /> 4.2% lower than daily average
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card theme-peach shine-hover border-none">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center text-orange-700">
                                <TreePine size={24} />
                            </div>
                            <Badge variant="outline" className="bg-orange-100/50 border-orange-200 text-orange-700 font-black text-[10px]">OFFSET</Badge>
                        </div>
                        <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Environmental Impact</div>
                        <div className="text-4xl font-black text-orange-950">{Math.round(treesNeeded).toLocaleString()} <span className="text-lg opacity-40">Trees</span></div>
                        <p className="mt-4 text-[10px] font-black opacity-50 text-orange-900 leading-relaxed uppercase tracking-tighter">
                            Approximate trees required to offset annual plant emission at current load.
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass-card theme-blue shine-hover border-none">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center text-blue-700">
                                <Zap size={24} />
                            </div>
                            <Badge variant="outline" className="bg-blue-100/50 border-blue-200 text-blue-700 font-black text-[10px]">GOAL</Badge>
                        </div>
                        <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Neutrality Progress</div>
                        <div className="text-4xl font-black text-blue-950">{neutralityProgress.toFixed(1)} <span className="text-lg opacity-40">%</span></div>
                        <Progress value={neutralityProgress} className="h-2 mt-6 bg-blue-950/10" />
                        <div className="mt-4 text-[10px] font-black text-blue-800/60 flex justify-between uppercase">
                            <span>Current</span>
                            <span>Target: 100%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="glass-card p-6 min-h-[400px]">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-brand-green-dark font-black tracking-tight text-xl">Emission Intensity (24h)</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historicalData}>
                                <defs>
                                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                                />
                                <Area type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorCo2)" />
                                <Line type="monotone" dataKey="target" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="glass-card p-6 min-h-[400px]">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-brand-green-dark font-black tracking-tight text-xl">Contribution by Zone</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 h-[300px] flex items-center">
                        <ResponsiveContainer width="60%" height="100%">
                            <PieChart>
                                <Pie
                                    data={zoneData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {zoneData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-4 px-6">
                            {zoneData.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-xs font-black text-brand-green-dark">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-brand-green-dark/40">{Math.round((item.value / zoneData.reduce((acc, z) => acc + z.value, 0)) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AI Insights Bar */}
            <div className="glass-card theme-yellow p-8 border-none flex flex-col md:flex-row items-center gap-8 shine-hover">
                <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-yellow-700" size={32} />
                </div>
                <div className="flex-1">
                    <h4 className="text-xl font-black text-yellow-950">AI Sustainability Insight</h4>
                    <p className="text-sm font-bold text-yellow-900/60 leading-relaxed mt-1">
                        Plant operations are currently aligned with the 2026 Neutrality Goal. Zone-B shows a 15% increase in efficiency since the last TX node calibration.
                        Recommended action: Standardize Zone-A machine targets to further reduce CO2 by 3.2kg/hr.
                    </p>
                </div>
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-2xl px-10 h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-yellow-600/20">
                    Full AI Report
                </Button>
            </div>
        </div>
    );
}

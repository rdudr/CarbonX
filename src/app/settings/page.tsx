'use client';

import React, { useState } from 'react';
import {
    Settings as SettingsIcon, Shield, Bell, User,
    HardDrive, Smartphone, Save, ChevronRight,
    Zap, Cpu, CheckCircle2
} from 'lucide-react';
import { useSystem } from '@/context/SystemContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
    const { config, updateNode, updateThreshold } = useSystem();
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="fade-in space-y-6 pb-20">
            <div className="glass p-8 rounded-4xl flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-brand-green-dark">System Protocol</h1>
                    <p className="text-brand-green-dark/60 font-medium">Configure RX Gateways, phase parameters, and alert matrices.</p>
                </div>
                {saved && (
                    <Badge className="bg-brand-green-light text-white px-4 py-2 rounded-full animate-bounce flex gap-2">
                        <CheckCircle2 size={16} /> Config Synced
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ─── Node Management (Dynamic Edit Section) ────────────────── */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-brand-green-dark flex items-center gap-3 px-2">
                        <Cpu size={22} className="text-brand-green-light" />
                        TX Node Calibration
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {config.nodes.map((node) => (
                            <Card key={node.id} className="glass-card border-none overflow-hidden group">
                                <CardContent className="p-0 flex flex-col md:flex-row">
                                    <div className="w-full md:w-48 bg-brand-green-dark/5 p-6 flex flex-col justify-center border-r border-black/5">
                                        <div className="text-xs font-black text-brand-green-dark/40 uppercase mb-1 tracking-widest">{node.id}</div>
                                        <div className="text-lg font-black text-brand-green-dark">{node.name}</div>
                                    </div>

                                    <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                        <div>
                                            <label className="text-[10px] font-black opacity-40 uppercase block mb-2">Phase Mode</label>
                                            <select
                                                value={node.phaseType}
                                                onChange={(e) => updateNode(node.id, { phaseType: e.target.value as any })}
                                                className="w-full bg-white/50 border border-black/5 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 ring-brand-green-light outline-none"
                                            >
                                                <option value="single">Single Phase</option>
                                                <option value="three">Three Phase</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black opacity-40 uppercase block mb-2">Target Load (kW)</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={node.targetKw}
                                                    onChange={(e) => updateNode(node.id, { targetKw: Number(e.target.value) })}
                                                    className="bg-white/50 border-black/5 rounded-xl pl-4 pr-10 font-bold"
                                                />
                                                <Zap className="absolute right-3 top-2.5 text-brand-yellow" size={16} />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                onClick={handleSave}
                                                className="bg-brand-green-light hover:bg-brand-green-dark text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-brand-green-light/20"
                                            >
                                                Calibrate
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* ─── Global Configuration ───────────────────────────────────── */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-brand-green-dark flex items-center gap-3 px-2">
                        <Bell size={22} className="text-brand-yellow" />
                        Alert Matrices
                    </h2>

                    <Card className="glass-card theme-peach border-none p-8">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-black text-orange-900 mb-2">Loss Sensitivity</h3>
                                <p className="text-xs text-orange-900/60 font-bold leading-relaxed mb-6">
                                    Define the percentage of unmonitored energy loss that triggers a CRITICAL protocol alert.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs font-black text-orange-900">
                                        <span>Current Threshold</span>
                                        <Badge className="bg-orange-600">{config.lossThreshold}%</Badge>
                                    </div>
                                    <input
                                        type="range"
                                        min="2"
                                        max="25"
                                        value={config.lossThreshold}
                                        onChange={(e) => updateThreshold(Number(e.target.value))}
                                        className="w-full h-3 bg-white/40 rounded-full appearance-none cursor-pointer accent-orange-600"
                                    />
                                    <div className="flex justify-between text-[10px] font-black opacity-40">
                                        <span>AGGRESSIVE (2%)</span>
                                        <span>RELAXED (25%)</span>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleSave} className="w-full bg-orange-600 hover:bg-orange-700 h-14 rounded-2xl font-black uppercase tracking-widest text-xs">
                                Update Alert Protocol
                            </Button>
                        </div>
                    </Card>

                    <Card className="glass-card theme-blue border-none p-6 shine-hover">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center text-blue-700">
                                <Shield />
                            </div>
                            <div>
                                <h4 className="font-black text-blue-900">Encrypted Storage</h4>
                                <p className="text-[10px] font-bold text-blue-900/40 uppercase mt-1">Config synced with local RX</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

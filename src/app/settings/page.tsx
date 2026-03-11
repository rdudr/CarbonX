'use client';

import React, { useState } from 'react';
import {
    Settings as SettingsIcon, Shield, Bell, Zap, Cpu,
    CheckCircle2, Plus, Trash2, Edit2, ArrowRight, X
} from 'lucide-react';
import { useSystem, DeviceSpec, TXUnit } from '@/context/SystemContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
    const {
        config, updateConfig,
        addTXUnit, updateTXUnit, deleteTXUnit,
        addDevice, updateDevice, deleteDevice
    } = useSystem();

    // States for interaction
    const [saved, setSaved] = useState(false);

    // TX Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardPhase, setWizardPhase] = useState<'single' | 'three'>('three');
    const [wizardTxName, setWizardTxName] = useState('New Transmitter');
    const [wizardDevices, setWizardDevices] = useState<Partial<DeviceSpec>[]>([{ name: 'Main Equipment', power: 1000, current: 5, phaseType: 'three' }]);

    const openWizard = () => {
        setWizardPhase('three');
        setWizardTxName(`TX-${config.txUnits.length + 1}`);
        setWizardDevices([{ name: 'Main Equipment', power: 1000, current: 5, phaseType: 'three' }]);
        setIsWizardOpen(true);
    };

    const handleWizardPhaseChange = (phase: 'single' | 'three') => {
        setWizardPhase(phase);
        if (phase === 'single') {
            setWizardDevices([
                { name: 'Line 1 Device', power: 1000, current: 5, phaseType: 'single' },
                { name: 'Line 2 Device', power: 1000, current: 5, phaseType: 'single' },
                { name: 'Line 3 Device', power: 1000, current: 5, phaseType: 'single' }
            ]);
        } else {
            setWizardDevices([{ name: 'Main Equipment', power: 1000, current: 5, phaseType: 'three' }]);
        }
    };

    const handleWizardDeviceChange = (index: number, field: string, value: any) => {
        const newDevices = [...wizardDevices];
        newDevices[index] = { ...newDevices[index], [field]: value };
        setWizardDevices(newDevices);
    };

    const saveWizardTX = () => {
        const newId = `TX-${config.txUnits.length + 1}`;
        const finalDevices: DeviceSpec[] = wizardDevices.map((d, i) => ({
            id: `D-${Math.floor(Math.random() * 10000) + i}`,
            name: d.name || `Device ${i + 1}`,
            phaseType: d.phaseType as 'single' | 'three',
            power: d.power || 0,
            current: d.current || 0
        }));

        addTXUnit({ id: newId, name: wizardTxName, devices: finalDevices });
        setIsWizardOpen(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    // Derived Power Data
    const totalPowerConsumption = config.txUnits.reduce((acc, tx) => {
        return acc + tx.devices.reduce((dAcc, d) => dAcc + d.power, 0);
    }, 0);

    const formatPower = (watts: number) => `${(watts / 1000).toFixed(2)} kW`;

    return (
        <div className="fade-in space-y-6 pb-20">
            {/* Header */}
            <div className="glass p-8 md:rounded-[40px] rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-brand-green-dark">Account & System</h1>
                    <p className="text-brand-green-dark/60 font-medium">Configure RX Gateways, tariffs, phase parameters, and alert matrices.</p>
                </div>
                {saved && (
                    <Badge className="bg-brand-green-light text-white px-4 py-2 rounded-full animate-bounce flex gap-2 w-fit">
                        <CheckCircle2 size={16} /> Config Synced
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ─── Main Receiver & Cost Analysis ──────────────────────────── */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* RX Display */}
                    <Card className="glass-card theme-mint border-none md:rounded-[30px] rounded-2xl lg:col-span-2 overflow-hidden relative shine-hover">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-xs font-black text-brand-green-dark/40 uppercase tracking-widest mb-1">{config.id}</div>
                                    <h3 className="text-2xl font-black text-brand-green-dark">{config.name}</h3>
                                </div>
                                <Badge className="bg-brand-green-dark text-white">ACTIVE</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-white/40 p-4 rounded-3xl border border-white/50">
                                <div>
                                    <p className="text-[10px] font-black opacity-40 uppercase mb-1">Total Connected Load</p>
                                    <div className="text-3xl font-black text-brand-green-dark">
                                        {formatPower(totalPowerConsumption)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black opacity-40 uppercase mb-1">Active TX Units</p>
                                    <div className="text-3xl font-black text-brand-green-dark">
                                        {config.txUnits.length}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Unit Tariff Settings */}
                    <Card className="glass-card theme-yellow border-none md:rounded-[30px] rounded-2xl shine-hover">
                        <CardContent className="p-8 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black text-yellow-900 mb-2">Electricity Tariff</h3>
                                <p className="text-xs text-yellow-900/60 font-bold leading-relaxed mb-4">
                                    Set the cost per kWh (Unit) for accurate cost projections and daily averages.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black opacity-40 uppercase block text-brand-green-dark">Rate (₹ / kWh)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-brand-green-dark font-black">₹</span>
                                    <Input
                                        type="number"
                                        value={config.unitRate}
                                        onChange={(e) => updateConfig({ unitRate: Number(e.target.value) })}
                                        className="bg-white/50 pl-8 rounded-xl font-bold border-white/60 focus:ring-brand-yellow"
                                    />
                                </div>
                                <Button onClick={handleSave} className="w-full bg-brand-yellow hover:bg-yellow-500 text-yellow-900 font-bold rounded-xl mt-2 shadow-lg shadow-brand-yellow/20">
                                    Save Rate
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alert Matrix / Loss Sensitivity */}
                    <Card className="glass-card theme-peach border-none md:rounded-[30px] rounded-2xl shine-hover">
                        <CardContent className="p-8 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black text-orange-900 mb-2">Loss Sensitivity</h3>
                                <p className="text-xs text-orange-900/60 font-bold leading-relaxed mb-4">
                                    Energy loss threshold that triggers a CRITICAL alert matrix.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-black text-orange-900">
                                    <span>Threshold</span>
                                    <Badge className="bg-orange-600">{config.lossThreshold}%</Badge>
                                </div>
                                <input
                                    type="range"
                                    min="2"
                                    max="25"
                                    value={config.lossThreshold}
                                    onChange={(e) => updateConfig({ lossThreshold: Number(e.target.value) })}
                                    className="w-full h-3 bg-white/40 rounded-full appearance-none cursor-pointer accent-orange-600"
                                />
                                <div className="flex justify-between text-[10px] font-black opacity-40">
                                    <span>AGGRESSIVE (2%)</span>
                                    <span>RELAXED (25%)</span>
                                </div>
                                <Button onClick={handleSave} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20">
                                    Update Threshold
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Device Management Hierarchy ──────────────────────────────── */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-2xl font-black text-brand-green-dark flex items-center gap-3">
                            <Cpu size={28} className="text-brand-green-light" />
                            Transmitters & Devices
                        </h2>
                        <Button
                            onClick={openWizard}
                            className="bg-brand-green-dark hover:bg-brand-green-light text-white rounded-full font-bold px-6"
                        >
                            <Plus size={16} className="mr-2" /> Add TX Unit
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {config.txUnits.map((tx) => (
                            <Card key={tx.id} className="glass-card border-none md:rounded-[35px] rounded-3xl overflow-hidden">
                                {/* TX Header */}
                                <div className="bg-brand-green-dark/5 p-6 border-b border-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="text-[10px] font-black text-brand-green-dark/40 uppercase tracking-widest">{tx.id}</div>
                                        <Input
                                            value={tx.name}
                                            onChange={(e) => updateTXUnit(tx.id, { name: e.target.value })}
                                            className="text-xl font-black text-brand-green-dark bg-white/40 border-none rounded-xl mt-1 w-full md:w-80 px-4 py-2"
                                        />
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        {!tx.devices.some(d => d.phaseType === 'three') && (
                                            <Button
                                                onClick={() => addDevice(tx.id, {
                                                    id: `D-${Math.floor(Math.random() * 1000)}`,
                                                    name: 'New Device', power: 1000, current: 5, phaseType: 'single'
                                                })}
                                                variant="outline"
                                                className="bg-white/50 border-brand-green-light/20 text-brand-green-dark hover:bg-brand-green-light/20 rounded-xl font-bold flex-1 md:flex-none"
                                            >
                                                <Plus size={16} className="mr-2" /> Add Device
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => deleteTXUnit(tx.id)}
                                            variant="ghost"
                                            className="text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Devices List */}
                                <div className="p-6">
                                    {tx.devices.length === 0 ? (
                                        <div className="text-center py-8 text-brand-green-dark/40 font-bold">
                                            No devices connected to this TX yet. Add one above.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {tx.devices.map((device) => (
                                                <div key={device.id} className="bg-white/40 border border-white/60 p-5 rounded-2xl flex flex-col gap-4 relative group">

                                                    {/* Top Row: Info & Actions */}
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Zap size={14} className="text-brand-yellow" />
                                                                <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">{device.id}</span>
                                                            </div>
                                                            <Input
                                                                value={device.name}
                                                                onChange={(e) => updateDevice(tx.id, device.id, { name: e.target.value })}
                                                                className="font-bold text-brand-green-dark bg-transparent border-b border-black/10 rounded-none px-0 h-8 focus-visible:ring-0"
                                                            />
                                                        </div>
                                                        <Button
                                                            onClick={() => deleteDevice(tx.id, device.id)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-black/20 hover:text-red-500 hover:bg-red-50 rounded-lg -mr-2 -mt-2"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>

                                                    {/* Specs Grid */}
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="bg-brand-green-dark/5 p-3 rounded-xl border border-black/5">
                                                            <label className="text-[9px] font-black opacity-40 uppercase block mb-1">Phase</label>
                                                            <select
                                                                value={device.phaseType}
                                                                onChange={(e) => updateDevice(tx.id, device.id, { phaseType: e.target.value as any })}
                                                                className="w-full bg-transparent text-sm font-bold text-brand-green-dark outline-none cursor-pointer"
                                                            >
                                                                <option value="single">Single (1Φ)</option>
                                                                <option value="three">Three (3Φ)</option>
                                                            </select>
                                                        </div>

                                                        <div className="bg-brand-green-dark/5 p-3 rounded-xl border border-black/5 relative">
                                                            <label className="text-[9px] font-black opacity-40 uppercase block mb-1">Power (W)</label>
                                                            <input
                                                                type="number"
                                                                value={device.power}
                                                                onChange={(e) => updateDevice(tx.id, device.id, { power: Number(e.target.value) })}
                                                                className="w-full bg-transparent text-sm font-bold text-brand-green-dark outline-none"
                                                            />
                                                        </div>

                                                        <div className="bg-brand-green-dark/5 p-3 rounded-xl border border-black/5 relative">
                                                            <label className="text-[9px] font-black opacity-40 uppercase block mb-1">Max Current (A)</label>
                                                            <input
                                                                type="number"
                                                                value={device.current}
                                                                onChange={(e) => updateDevice(tx.id, device.id, { current: Number(e.target.value) })}
                                                                className="w-full bg-transparent text-sm font-bold text-brand-green-dark outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

            </div>

            {/* TX Addition Wizard Modal */}
            {isWizardOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="glass-thick bg-white/95 md:rounded-[40px] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white p-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-black text-brand-green-dark tracking-tight">Add TX Unit</h2>
                                <p className="text-sm font-bold text-brand-green-dark/50">Setup connection topology and specific equipment limits.</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsWizardOpen(false)} className="rounded-full hover:bg-black/5">
                                <X size={24} className="text-brand-green-dark" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest block text-brand-green-dark mb-2">Transmitter Name / Zone</label>
                                <Input
                                    value={wizardTxName}
                                    onChange={(e) => setWizardTxName(e.target.value)}
                                    className="bg-white/50 border-black/10 rounded-xl font-bold text-lg text-brand-green-dark"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest block text-brand-green-dark mb-2">Network Phase Topology</label>
                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleWizardPhaseChange('three')}
                                        className={`flex-1 h-14 rounded-2xl font-black tracking-widest text-xs uppercase ${wizardPhase === 'three' ? 'bg-orange-500 text-white border-transparent shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:text-white' : 'bg-white/50 text-brand-green-dark/40 border-black/5 hover:bg-white'} transition-all`}
                                    >
                                        Three Phase (3&Phi;)
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleWizardPhaseChange('single')}
                                        className={`flex-1 h-14 rounded-2xl font-black tracking-widest text-xs uppercase ${wizardPhase === 'single' ? 'bg-blue-500 text-white border-transparent shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:text-white' : 'bg-white/50 text-brand-green-dark/40 border-black/5 hover:bg-white'} transition-all`}
                                    >
                                        Single Phase (1&Phi;)
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-brand-green-dark/5 p-6 rounded-3xl border border-black/5 space-y-4">
                                <div className="text-[10px] font-black opacity-40 uppercase tracking-widest text-brand-green-dark border-b border-black/5 pb-2">
                                    {wizardPhase === 'single' ? 'Connected Devices (3 Lines)' : 'Connected Equipment (Main Line)'}
                                </div>
                                {wizardDevices.map((dev, i) => (
                                    <div key={i} className="bg-white/70 p-4 rounded-2xl border border-white/50 shadow-sm flex flex-col gap-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Zap size={14} className={wizardPhase === 'three' ? 'text-orange-500' : 'text-blue-500'} />
                                            <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">Device {i + 1}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="md:col-span-2">
                                                <label className="text-[9px] font-black opacity-40 uppercase block mb-1">Device Name</label>
                                                <Input
                                                    value={dev.name}
                                                    onChange={e => handleWizardDeviceChange(i, 'name', e.target.value)}
                                                    className="bg-transparent border-black/10 rounded-lg font-bold text-sm text-brand-green-dark focus-visible:ring-brand-green-light"
                                                    placeholder="e.g. CNC Machine"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black opacity-40 uppercase block mb-1">Power Rating (Watts)</label>
                                                <Input
                                                    type="number"
                                                    value={dev.power}
                                                    onChange={e => handleWizardDeviceChange(i, 'power', Number(e.target.value))}
                                                    className="bg-transparent border-black/10 rounded-lg font-bold text-sm text-brand-green-dark focus-visible:ring-brand-green-light"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black opacity-40 uppercase block mb-1">Max Current (Amps)</label>
                                                <Input
                                                    type="number"
                                                    value={dev.current}
                                                    onChange={e => handleWizardDeviceChange(i, 'current', Number(e.target.value))}
                                                    className="bg-transparent border-black/10 rounded-lg font-bold text-sm text-brand-green-dark focus-visible:ring-brand-green-light"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-black/5">
                            <Button variant="ghost" onClick={() => setIsWizardOpen(false)} className="rounded-xl font-bold text-brand-green-dark/40 hover:text-brand-green-dark hover:bg-black/5">Cancel</Button>
                            <Button onClick={saveWizardTX} className="rounded-xl font-bold bg-brand-green-dark text-white hover:bg-brand-green-light px-8 py-6 shadow-lg shadow-brand-green-dark/20 text-md">
                                Confirm & Add
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

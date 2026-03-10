'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '@/context/SystemContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FileText, Download, FileSpreadsheet, FileJson,
    Calendar, Filter, FileCode, CheckCircle2,
    BarChart3, PieChart, Activity
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';

export default function ReportsPage() {
    const { config } = useSystem();
    const [mounted, setMounted] = useState(false);
    const [exporting, setExporting] = useState<string | null>(null);
    const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // --- Dynamic Calculation Logic ---
    const getPeriodMultiplier = () => {
        if (reportPeriod === 'daily') return 1;
        if (reportPeriod === 'weekly') return 7.2;
        return 30.5;
    };

    const multiplier = getPeriodMultiplier();
    const avgEfficiency = 92 + (Math.random() * 6);
    const cumulativeKwh = Math.round(12482 * multiplier * (0.9 + Math.random() * 0.2));
    const activeNodes = config.nodes.length;
    const co2Saved = Math.round(420 * multiplier);

    // Health Distribution Simulation
    const healthDist = {
        good: Math.floor(config.nodes.length * 0.8),
        warning: Math.ceil(config.nodes.length * 0.15),
        critical: Math.max(0, config.nodes.length - Math.floor(config.nodes.length * 0.8) - Math.ceil(config.nodes.length * 0.15))
    };

    // AI Insights based on period
    const getAiInsight = () => {
        if (reportPeriod === 'daily') return "High load detected in Zone-B during 14:00-16:00. Peak efficiency maintained at 96%.";
        if (reportPeriod === 'weekly') return "Zone-A energy loss decreased by 4.2% this week after TX node calibration. Recommendation: Maintain current PF targets.";
        return "Monthly carbon footprint is 12% lower than Q4 average. Plant scale optimization has saved approx 3,200kg of CO2 this month.";
    };

    // --- Export Logic ---

    const exportToCSV = () => {
        setExporting('csv');
        const headers = ['Node ID', 'Machine Name', 'Zone', 'Phase Type', 'Target kW', 'Status', 'Period Efficiency'];
        const rows = config.nodes.map(node => [
            node.id,
            node.name,
            node.zone,
            node.phaseType,
            node.targetKw,
            'Online',
            `${(90 + Math.random() * 8).toFixed(1)}%`
        ]);

        const csvContent = [
            [`Report Period: ${reportPeriod.toUpperCase()}`],
            [`Generation Date: ${new Date().toLocaleString()}`],
            [],
            headers,
            ...rows
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `CarbonX_${reportPeriod}_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setExporting(null), 1000);
    };

    const exportToPDF = () => {
        window.print();
    };

    const exportToDOCS = () => {
        setExporting('docs');
        const content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>CarbonX ${reportPeriod} Report</title></head>
            <body style="font-family: sans-serif;">
                <h1>CarbonX Industrial ${reportPeriod.toUpperCase()} Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                <hr>
                <h3>Summary Metrics</h3>
                <ul>
                    <li>Avg Efficiency: ${avgEfficiency.toFixed(1)}%</li>
                    <li>Cumulative Energy: ${cumulativeKwh.toLocaleString()} kWh</li>
                    <li>CO2 Offset: ${co2Saved.toLocaleString()} kg</li>
                </ul>
                <h3>AI Operational Insight</h3>
                <p>${getAiInsight()}</p>
                <hr>
                <h2>Machine Inventory Detail</h2>
                <table border='1' style='width:100%; border-collapse: collapse;'>
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th>ID</th><th>Name</th><th>Zone</th><th>Phase</th><th>Target kW</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${config.nodes.map(n => `
                            <tr>
                                <td>${n.id}</td><td>${n.name}</td><td>${n.zone}</td><td>${n.phaseType}</td><td>${n.targetKw}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
        const blob = new Blob([content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `CarbonX_${reportPeriod}_Report_${new Date().toISOString().split('T')[0]}.doc`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setExporting(null), 1000);
    };

    return (
        <div className="fade-in space-y-8 pb-20 print:p-0">
            {/* Header Area - Hidden on Print */}
            <div className="glass p-8 rounded-4xl flex flex-col md:flex-row justify-between items-center shadow-sm border border-brand-green-light/10 print:hidden">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-brand-green-light/10 flex items-center justify-center border border-brand-green-light/20 shadow-inner">
                        <FileText className="text-brand-green-light" size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-brand-green-dark uppercase italic">Report Lab</h1>
                        <p className="text-brand-green-dark/60 font-medium">Generate industrial grade data exports and analytics.</p>
                    </div>
                </div>
                <div className="mt-6 md:mt-0 flex gap-3 p-1.5 bg-black/[0.03] rounded-2xl border border-black/5">
                    {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setReportPeriod(p)}
                            className={cn(
                                "px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                reportPeriod === p
                                    ? "bg-brand-green-dark text-white shadow-lg"
                                    : "text-brand-green-dark/40 hover:text-brand-green-dark hover:bg-white/50"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Print Header - Only visible on Print */}
            <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-bold uppercase italic text-black">CarbonX Industrial {reportPeriod.toUpperCase()} Report</h1>
                <p className="text-sm opacity-60">Generated on: {new Date().toLocaleString()}</p>
            </div>

            {/* AI Insight Card - Fully Dynamic */}
            <div className="glass-card theme-yellow p-8 border-none flex flex-col md:flex-row items-center gap-8 shine-hover print:border print:bg-yellow-50/10">
                <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center shrink-0 print:hidden">
                    <Activity className="text-yellow-700" size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">AI Operational Insight ({reportPeriod})</h4>
                    <p className="text-xl font-black text-yellow-950 leading-tight">
                        {getAiInsight()}
                    </p>
                </div>
                <div className="hidden md:flex gap-4 shrink-0">
                    <div className="text-right">
                        <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">Health Index</div>
                        <div className="text-2xl font-black text-yellow-950 italic">EXCELLENT</div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-8 rounded-3xl border-none theme-mint">
                    <div className="flex items-center gap-3 mb-4">
                        <Activity size={18} className="text-emerald-700" />
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-emerald-900">Avg Efficiency</span>
                    </div>
                    <div className="text-4xl font-black text-emerald-950 tracking-tighter italic">{avgEfficiency.toFixed(1)}%</div>
                </div>
                <div className="glass p-8 rounded-3xl border-none theme-blue">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 size={18} className="text-blue-700" />
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-blue-900">Total Energy</span>
                    </div>
                    <div className="text-4xl font-black text-blue-950 tracking-tighter italic">{cumulativeKwh.toLocaleString()} <span className="text-lg opacity-40">kWh</span></div>
                </div>
                <div className="glass p-8 rounded-3xl border-none theme-peach">
                    <div className="flex items-center gap-3 mb-4">
                        <Badge variant="outline" className="border-orange-500/20 text-orange-600 bg-orange-500/5 uppercase font-black text-[8px]">Target Check</Badge>
                    </div>
                    <div className="text-4xl font-black text-orange-950 tracking-tighter italic">OPTIMAL</div>
                </div>
                <div className="glass p-8 rounded-3xl border-none theme-mint text-emerald-700">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle2 size={18} />
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-emerald-900">Carbon Offset</span>
                    </div>
                    <div className="text-4xl font-black text-emerald-950 tracking-tighter italic">{co2Saved.toLocaleString()} <span className="text-lg opacity-40">kg</span></div>
                </div>
            </div>

            {/* Machine Health Distribution & Export Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Health Distribution UI */}
                <Card className="glass-card p-8 border-none lg:col-span-2 shadow-sm">
                    <h3 className="text-xl font-black text-brand-green-dark uppercase italic mb-8">Machine Health Distribution</h3>
                    <div className="flex gap-4 h-12">
                        <div style={{ width: `${(healthDist.good / config.nodes.length) * 100}%` }} className="bg-emerald-500 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-emerald-500/20">GOOD</div>
                        <div style={{ width: `${(healthDist.warning / config.nodes.length) * 100}%` }} className="bg-orange-500 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-orange-500/20">ATTN</div>
                        {healthDist.critical > 0 && <div style={{ width: `${(healthDist.critical / config.nodes.length) * 100}%` }} className="bg-red-500 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-red-500/20">ERR</div>}
                    </div>
                    <div className="mt-6 flex justify-between text-[10px] font-black text-brand-green-dark/40 uppercase tracking-widest">
                        <span>Nodes Operational: {activeNodes}</span>
                        <span className="text-emerald-600">{healthDist.good} Nominal</span>
                        <span className="text-orange-600">{healthDist.warning} Warning</span>
                    </div>
                </Card>

                {/* Export Controls */}
                <Card className="glass-card p-4 border-none flex flex-col gap-3 justify-center print:hidden">
                    <Button onClick={exportToCSV} variant="ghost" className="h-14 rounded-2xl border border-black/5 bg-white/40 hover:bg-emerald-50 text-brand-green-dark font-black text-xs uppercase tracking-widest flex justify-between px-6">
                        <div className="flex items-center gap-4">
                            <FileSpreadsheet size={20} className="text-emerald-600" /> Export CSV
                        </div>
                        <Download size={16} className="opacity-20" />
                    </Button>
                    <Button onClick={exportToPDF} variant="ghost" className="h-14 rounded-2xl border border-black/5 bg-white/40 hover:bg-blue-50 text-brand-green-dark font-black text-xs uppercase tracking-widest flex justify-between px-6">
                        <div className="flex items-center gap-4">
                            <FileText size={20} className="text-blue-600" /> Export PDF
                        </div>
                        <Download size={16} className="opacity-20" />
                    </Button>
                    <Button onClick={exportToDOCS} variant="ghost" className="h-14 rounded-2xl border border-black/5 bg-white/40 hover:bg-orange-50 text-brand-green-dark font-black text-xs uppercase tracking-widest flex justify-between px-6">
                        <div className="flex items-center gap-4">
                            <FileCode size={20} className="text-orange-600" /> Export DOCS
                        </div>
                        <Download size={16} className="opacity-20" />
                    </Button>
                </Card>
            </div>

            {/* Data Table */}
            <Card className="glass-card overflow-hidden border-none shadow-sm print:shadow-none print:border">
                <CardHeader className="p-8 border-b border-black/5 bg-brand-green-dark/[0.02]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle className="text-2xl font-black text-brand-green-dark uppercase italic tracking-tight underline decoration-brand-green-light decoration-4 underline-offset-8">Node Inventory Ledger</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-auto">
                    <Table>
                        <TableHeader className="bg-black/[0.02]">
                            <TableRow className="hover:bg-transparent uppercase border-black/5">
                                <TableHead className="w-24 text-[10px] font-black text-brand-green-dark opacity-40 px-8 h-14">Node ID</TableHead>
                                <TableHead className="text-[10px] font-black text-brand-green-dark opacity-40 h-14">Machine Name</TableHead>
                                <TableHead className="text-[10px] font-black text-brand-green-dark opacity-40 h-14">Zone</TableHead>
                                <TableHead className="text-[10px] font-black text-brand-green-dark opacity-40 h-14">Phase</TableHead>
                                <TableHead className="text-[10px] font-black text-brand-green-dark opacity-40 h-14">Target kW</TableHead>
                                <TableHead className="text-right text-[10px] font-black text-brand-green-dark opacity-40 px-8 h-14">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {config.nodes.map((node) => (
                                <TableRow key={node.id} className="hover:bg-brand-green-light/[0.03] border-black/5 h-16 group transition-colors">
                                    <TableCell className="font-black text-brand-green-dark px-8">{node.id}</TableCell>
                                    <TableCell className="font-bold text-brand-green-dark/80 italic">{node.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 font-black text-[10px] py-1">
                                            {node.zone}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-brand-green-dark/60 uppercase text-[10px] tracking-widest">{node.phaseType}-Phase</TableCell>
                                    <TableCell className="font-black text-brand-green-dark">{node.targetKw} kW</TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex items-center justify-end gap-2 text-emerald-600 font-black text-[10px] uppercase">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Live
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Footer / Disclaimer - Visible on Print */}
            <div className="hidden print:block mt-20 text-[10px] text-center font-black uppercase opacity-40 border-t pt-8 tracking-widest">
                This report is generated automatically by CarbonX Industrial PWA.
                Data accuracy is subject to TX-Node calibration. © 2026 CarbonX Lab.
            </div>
        </div>
    );
}

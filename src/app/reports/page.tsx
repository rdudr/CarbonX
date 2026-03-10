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

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // --- Export Logic ---

    const exportToCSV = () => {
        setExporting('csv');
        const headers = ['Node ID', 'Machine Name', 'Zone', 'Phase Type', 'Target kW', 'Status'];
        const rows = config.nodes.map(node => [
            node.id,
            node.name,
            node.zone,
            node.phaseType,
            node.targetKw,
            'Online'
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `CarbonX_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setExporting(null), 1000);
    };

    const exportToPDF = () => {
        // We use window.print() as a lightweight way to generate PDFs
        // The CSS @media print handles the styling
        window.print();
    };

    const exportToDOCS = () => {
        setExporting('docs');
        const content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>CarbonX Report</title></head>
            <body>
                <h1>CarbonX Industrial Energy Report</h1>
                <p>Date: ${new Date().toLocaleString()}</p>
                <hr>
                <h2>Machine Inventory</h2>
                <table border='1' style='width:100%; border-collapse: collapse;'>
                    <thead>
                        <tr>
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
        link.setAttribute("download", `CarbonX_Report_${new Date().toISOString().split('T')[0]}.doc`);
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
                <div className="mt-6 md:mt-0 flex gap-3">
                    <Badge variant="outline" className="text-[10px] font-black uppercase bg-white/50 border-black/5 px-4 h-10 flex items-center">
                        <Calendar size={14} className="mr-2" /> Last 30 Days
                    </Badge>
                </div>
            </div>

            {/* Print Header - Only visible on Print */}
            <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-bold">CarbonX Industrial Energy Report</h1>
                <p className="text-sm opacity-60">Generated on: {new Date().toLocaleString()}</p>
            </div>

            {/* Export Actions - Hidden on Print */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
                <Card className="glass-card theme-mint border-none p-8 shine-hover group cursor-pointer" onClick={exportToCSV}>
                    <div className="flex justify-between items-start">
                        <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
                            <FileSpreadsheet size={28} />
                        </div>
                        <Download size={20} className="text-emerald-700/40" />
                    </div>
                    <h3 className="text-xl font-black text-emerald-950 mt-6 uppercase italic">CSV Export</h3>
                    <p className="text-xs font-bold text-emerald-700/60 mt-1 uppercase tracking-tighter">Spreadsheet compatible raw data.</p>
                </Card>

                <Card className="glass-card theme-blue border-none p-8 shine-hover group cursor-pointer" onClick={exportToPDF}>
                    <div className="flex justify-between items-start">
                        <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform">
                            <FileText size={28} />
                        </div>
                        <Download size={20} className="text-blue-700/40" />
                    </div>
                    <h3 className="text-xl font-black text-blue-950 mt-6 uppercase italic">PDF Report</h3>
                    <p className="text-xs font-bold text-blue-700/60 mt-1 uppercase tracking-tighter">High fidelity visual document.</p>
                </Card>

                <Card className="glass-card theme-peach border-none p-8 shine-hover group cursor-pointer" onClick={exportToDOCS}>
                    <div className="flex justify-between items-start">
                        <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center text-orange-700 group-hover:scale-110 transition-transform">
                            <FileCode size={28} />
                        </div>
                        <Download size={20} className="text-orange-700/40" />
                    </div>
                    <h3 className="text-xl font-black text-orange-950 mt-6 uppercase italic">DOCS Export</h3>
                    <p className="text-xs font-bold text-orange-700/60 mt-1 uppercase tracking-tighter">Editable word processor format.</p>
                </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="glass p-6 rounded-3xl border-none">
                    <div className="flex items-center gap-3 mb-4">
                        <Activity size={18} className="text-brand-green-light" />
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-brand-green-dark">Avg Efficiency</span>
                    </div>
                    <div className="text-3xl font-black text-brand-green-dark tracking-tighter italic">94.2%</div>
                </div>
                <div className="glass p-6 rounded-3xl border-none">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 size={18} className="text-blue-500" />
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-brand-green-dark">Cumulative kWh</span>
                    </div>
                    <div className="text-3xl font-black text-brand-green-dark tracking-tighter italic">12,482</div>
                </div>
                <div className="glass p-6 rounded-3xl border-none">
                    <div className="flex items-center gap-3 mb-4">
                        <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/5">Goal Met</Badge>
                    </div>
                    <div className="text-3xl font-black text-brand-green-dark tracking-tighter italic">YES</div>
                </div>
                <div className="glass p-6 rounded-3xl border-none">
                    <div className="flex items-center gap-3 mb-4">
                        <PieChart size={18} className="text-orange-500" />
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-brand-green-dark">Nodes Reporting</span>
                    </div>
                    <div className="text-3xl font-black text-brand-green-dark tracking-tighter italic">{config.nodes.length} / {config.nodes.length}</div>
                </div>
            </div>

            {/* Data Table */}
            <Card className="glass-card overflow-hidden border-none shadow-sm print:shadow-none print:border">
                <CardHeader className="p-8 border-b border-black/5 bg-brand-green-dark/[0.02]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle className="text-2xl font-black text-brand-green-dark uppercase italic tracking-tight">Node Inventory Ledger</CardTitle>
                        <div className="flex gap-2 print:hidden">
                            <Button variant="outline" className="rounded-full px-6 font-black text-xs uppercase bg-white/50 border-black/5">
                                <Filter size={14} className="mr-2" /> Filter
                            </Button>
                        </div>
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
                                            <CheckCircle2 size={12} /> Live
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Footer / Disclaimer - Visible on Print */}
            <div className="hidden print:block mt-20 text-[10px] text-center opacity-40 border-t pt-8">
                This report is generated automatically by CarbonX Industrial PWA.
                Data accuracy is subject to TX-Node calibration. © 2026 CarbonX Lab.
            </div>
        </div>
    );
}

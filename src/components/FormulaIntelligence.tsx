'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, X, Zap, Activity, Leaf, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FormulaIntelligence() {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const formulas = [
        {
            icon: Zap,
            title: "Transmission Loss",
            formula: "((Grid - Node) / Grid)*100",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Leaf,
            title: "Carbon Drift",
            formula: "((PPM - 400) / 400)*10",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Activity,
            title: "Health Score",
            formula: "(PF+V_Bal+Temp+Load)*0.25",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            icon: Cpu,
            title: "Forest Offset",
            formula: "1 Tree = 20kg CO2/yr",
            color: "text-brand-green-light",
            bg: "bg-brand-green-light/10"
        }
    ];

    return (
        <div className="relative inline-flex items-center" ref={popoverRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 rounded-full bg-brand-green-light/10 border border-brand-green-light/20 flex items-center justify-center text-brand-green-light hover:bg-brand-green-light hover:text-white transition-all cursor-pointer shadow-sm group"
                title="View Calculation Formulas"
            >
                <HelpCircle size={16} className={cn("transition-transform duration-300", isOpen && "rotate-90")} />
            </button>

            {isOpen && (
                <div className="absolute top-12 left-0 z-[100] w-72 glass-thick md:rounded-[30px] rounded-3xl border-2 border-white/50 p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-black/5">
                        <h3 className="text-xs font-black italic uppercase tracking-tighter text-brand-green-dark flex items-center gap-2">
                            <HelpCircle size={14} />
                            Intelligence
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center text-brand-green-dark/40 hover:text-brand-green-dark hover:bg-black/10 transition-all cursor-pointer"
                        >
                            <X size={12} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formulas.map((f, i) => (
                            <div key={i} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white/60 border border-white shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shadow-inner shrink-0", f.bg, f.color)}>
                                        <f.icon size={12} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-brand-green-dark tracking-tight">{f.title}</span>
                                </div>
                                <div className="bg-brand-green-dark text-emerald-400 rounded-xl py-2 px-3 font-mono text-[9px] font-bold break-all shadow-inner border border-white/10 ml-8 text-center flex items-center justify-center tracking-widest leading-none">
                                    {f.formula}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


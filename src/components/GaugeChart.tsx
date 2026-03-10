'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GaugeChartProps {
    value: number;
    max: number;
    label: string;
    unit: string;
    className?: string;
}

export function GaugeChart({ value, max, label, unit, className }: GaugeChartProps) {
    const [displayValue, setDisplayValue] = useState(0);

    // Smooth animation effect
    useEffect(() => {
        const timeout = setTimeout(() => setDisplayValue(value), 100);
        return () => clearTimeout(timeout);
    }, [value]);

    const percentage = Math.min(Math.max((displayValue / max) * 100, 0), 100);

    // SVG Parameters for a semi-circle gauge
    const radius = 80;
    const strokeWidth = 24;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * Math.PI; // Only half circle
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Needle rotation (starts from -90deg to 90deg for semi-circle)
    const rotation = (percentage / 100) * 180 - 90;

    // Status label logic
    let status = "Good";
    let statusColor = "text-emerald-500";
    if (percentage > 85) {
        status = "Critical";
        statusColor = "text-red-500";
    } else if (percentage > 60) {
        status = "Warning";
        statusColor = "text-amber-500";
    }

    return (
        <div className={cn("flex flex-col items-center justify-center p-4", className)}>
            <div className="text-[10px] font-black text-brand-green-dark/40 uppercase mb-2 tracking-widest">{label}</div>

            <div className="relative w-[200px] h-[100px] overflow-hidden">
                {/* SVG Gauge Background */}
                <svg
                    height="100"
                    width="200"
                    viewBox="0 0 200 100"
                    className="absolute top-0 left-0"
                >
                    {/* Background Track (Gray) */}
                    <path
                        d="M 20,100 A 80,80 0 0,1 180,100"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />

                    {/* Progress Track (Colored Zones) */}
                    {/* Green Segment (0-50%) */}
                    <path
                        d="M 20,100 A 80,80 0 0,1 100,20"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={strokeWidth}
                    />
                    {/* Yellow/Lime Segment (50-100%) */}
                    <path
                        d="M 100,20 A 80,80 0 0,1 180,100"
                        fill="none"
                        stroke="#84cc16"
                        strokeWidth={strokeWidth}
                    />

                    {/* Progress Overlay (This hides the color segments based on value) */}
                    {/* In a real speedometer we want the segments visible, so we don't need a dynamic stroke here usually, 
                        just a needle. But yours shows colors. */}
                </svg>

                {/* The Needle */}
                <div
                    className="absolute bottom-0 left-1/2 w-1.5 h-16 bg-blue-500 rounded-full origin-bottom transition-transform duration-1000 ease-out"
                    style={{
                        transform: `translateX(-50%) rotate(${rotation}deg)`,
                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                    }}
                >
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white" />
                </div>

                {/* Min/Max Labels */}
                <div className="absolute bottom-0 left-4 text-[10px] font-bold text-slate-400">0</div>
                <div className="absolute bottom-0 right-4 text-[10px] font-bold text-slate-400">{max}</div>
            </div>

            {/* Value & Status */}
            <div className="mt-4 text-center">
                <div className="text-xl font-black text-brand-green-dark">
                    {displayValue.toFixed(0)} <span className="text-xs opacity-40">{unit}</span>
                </div>
                <div className={cn("text-[10px] font-black uppercase tracking-tighter", statusColor)}>
                    {status}
                </div>
            </div>
        </div>
    );
}

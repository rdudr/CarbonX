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
                    <defs>
                        <filter id="glowGauge" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Background Track (Gray) */}
                    <path
                        d="M 20,100 A 80,80 0 0,1 180,100"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        opacity={0.3}
                    />

                    {/* Progress Track (Colored Zones) */}
                    <path
                        d="M 20,100 A 80,80 0 0,1 100,20"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={strokeWidth}
                        filter="url(#glowGauge)"
                    />
                    <path
                        d="M 100,20 A 80,80 0 0,1 180,100"
                        fill="none"
                        stroke="#fb923c"
                        strokeWidth={strokeWidth}
                        filter="url(#glowGauge)"
                    />
                </svg>

                {/* The Needle */}
                <div
                    className="absolute bottom-0 left-1/2 w-1 h-18 bg-blue-500 rounded-full origin-bottom transition-transform duration-1000 ease-out"
                    style={{
                        transform: `translateX(-50%) rotate(${rotation}deg)`,
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.8)',
                    }}
                >
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
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

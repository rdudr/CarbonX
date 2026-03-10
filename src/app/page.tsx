'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Activity, Zap, Leaf, Factory, ArrowRight, Globe, Box, HardHat
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function Page() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <div className="space-y-32 mb-32">
      <HeroSection />
      <FeatureGrid />
      <HardwareShowcase />
      <SustainabilityInsight />
    </div>
  );
}

function HeroSection() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center relative py-12 px-4 overflow-hidden">
      {/* Refined Industrial Background */}
      <div className="absolute inset-0 grid-overlay opacity-40 -z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl aspect-square bg-brand-green-light/5 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full max-w-7xl mx-auto relative z-10">
        <div className="space-y-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 p-2 pr-6 glass rounded-full border border-brand-green-light/20 mb-2"
          >
            <div className="p-2 bg-brand-green-light rounded-full">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-dark/60">v4.0 Protocol Active</span>
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-7xl md:text-9xl font-black text-brand-green-dark tracking-tighter uppercase italic leading-[0.8] text-glow"
            >
              Industry <br />
              <span className="text-brand-green-light underline decoration-[12px] underline-offset-[12px]">Forensics</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-brand-green-dark/50 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Real-time energy telemetry and AI machine diagnostics for the next generation of industrial efficiency.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5"
          >
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              <Button className="h-20 px-12 rounded-[2rem] bg-brand-green-dark text-white hover:bg-brand-green-dark/95 text-xl font-black uppercase italic tracking-widest gap-4 shadow-2xl shadow-brand-green-dark/30 group border-b-4 border-black/20 transform active:translate-y-1 transition-all">
                {isAuthenticated ? "Enter Command" : "Get Started"}
                <ArrowRight className="group-hover:translate-x-3 transition-transform" />
              </Button>
            </Link>
            <Button variant="ghost" className="h-20 px-8 rounded-full text-brand-green-dark/40 font-black uppercase italic tracking-widest hover:text-brand-green-dark hover:bg-brand-green-light/5 gap-3">
              <Globe size={18} />
              Global Scale
            </Button>
          </motion.div>
        </div>

        {/* 3D Product Model Placeholder with better Framing */}
        <div className="relative h-[600px] flex items-center justify-center group">
          <div className="absolute inset-0 bg-brand-green-light/5 blur-[100px] rounded-full scale-75 animate-pulse" />
          <motion.div
            animate={{ y: [0, -30, 0], rotate: [0, 2, 0, -2, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="w-full max-w-lg aspect-square glass-thick md:rounded-[80px] rounded-[50px] border border-white flex items-center justify-center relative shadow-inner overflow-hidden"
          >
            <div className="absolute inset-0 dot-pattern opacity-20" />
            <div className="absolute top-8 left-8 p-3 glass rounded-2xl border-white/40">
              <div className="w-2 h-2 rounded-full bg-brand-green-light animate-ping" />
            </div>

            <div className="flex flex-col items-center gap-8 relative z-10 text-brand-green-dark/10">
              <Box size={160} className="animate-float" />
              <div className="flex flex-col items-center gap-2">
                <div className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Industrial Node</div>
                <div className="h-1 w-20 bg-brand-green-light/20 rounded-full" />
              </div>
            </div>

            {/* Corner Decorative Lines */}
            <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-brand-green-light/10 rounded-br-[80px]" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FeatureGrid() {
  const features = [
    { title: "Plant Scale", desc: "RX/TX mesh networking for seamless factory-wide data aggregation.", icon: Globe, theme: "theme-mint" },
    { title: "AI Integrity", desc: "Neural forecasting models detecting anomalies before failure.", icon: Activity, theme: "theme-peach" },
    { title: "Zero Loss", desc: "Identify 3-phase imbalances and energy leakages instantly.", icon: Zap, theme: "theme-blue" },
    { title: "Sustainability", desc: "Automated carbon footprint reporting and tree offset tracking.", icon: Leaf, theme: "theme-yellow" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -12, scale: 1.02 }}
            className={cn("p-10 rounded-[2.5rem] shadow-sm border border-black/5 relative overflow-hidden group", f.theme)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="w-16 h-16 rounded-[1.25rem] bg-white/60 flex items-center justify-center mb-8 shadow-sm">
              <f.icon className="text-brand-green-dark" size={32} />
            </div>
            <h3 className="text-2xl font-black text-brand-green-dark mb-3 tracking-tight italic uppercase">{f.title}</h3>
            <p className="text-brand-green-dark/60 text-sm font-medium leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HardwareShowcase() {
  const [mode, setMode] = useState<'operational' | 'debug' | 'emergency'>('operational');

  const modeContent = {
    operational: { title: "Standard Protocol", desc: "High-precision sampling active. AES-256 encrypted sync loop running every 500ms." },
    debug: { title: "Telemetry Audit", desc: "Detailed wave-form analysis enabled. Reporting phase-level harmonic distortion." },
    emergency: { title: "Critical Safe", desc: "Automatic disconnect sequence primed. Cooling protocols initialized." }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16 py-32 relative">
      <div className="absolute top-0 right-10 w-64 h-64 bg-brand-yellow/5 blur-[120px] rounded-full -z-10" />

      <div className="flex-1 space-y-10 text-center lg:text-left">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-green-dark text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-green-dark/20">
            Hardware 4.0
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-brand-green-dark tracking-tighter uppercase italic leading-[0.85]">
            The <span className="text-brand-green-light">CarbonX</span> <br /> Core Node
          </h2>
          <p className="text-xl text-brand-green-dark/40 font-medium max-w-lg leading-relaxed">
            Industrial-grade RX/TX nodes designed for harsh environments and zero-latency forensics.
          </p>
        </div>

        {/* Hardware Mode Switcher */}
        <div className="space-y-6 glass p-8 rounded-[2.5rem] border border-black/5 bg-white/40">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black text-brand-green-light uppercase tracking-[0.3em]">{modeContent[mode].title}</p>
            <p className="text-sm font-medium text-brand-green-dark/60 italic">{modeContent[mode].desc}</p>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {(['operational', 'debug', 'emergency'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all transform active:scale-95 border-b-4",
                  mode === m
                    ? "bg-brand-green-dark text-white border-black/20 shadow-xl"
                    : "bg-white border-black/5 text-brand-green-dark/40 hover:bg-black/5 border-b-transparent"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-2xl h-[550px] relative">
        <motion.div
          animate={{
            scale: mode === 'emergency' ? [1, 1.05, 1] : 1,
            rotate: mode === 'debug' ? [0, 3, 0, -3, 0] : 0
          }}
          transition={{ duration: 0.4, repeat: mode !== 'operational' ? Infinity : 0 }}
          className="w-full h-full glass-thick md:rounded-[80px] rounded-[50px] border-2 border-dashed border-black/10 flex items-center justify-center relative shadow-2xl overflow-hidden"
        >
          <div className={cn(
            "absolute inset-0 transition-all duration-1000 blur-[100px] opacity-40",
            mode === 'operational' ? "bg-brand-green-light" : mode === 'debug' ? "bg-brand-yellow" : "bg-red-500"
          )} />
          <div className="absolute inset-0 dot-pattern opacity-10" />

          <div className="flex flex-col items-center gap-10 relative z-10">
            <div className={cn(
              "w-32 h-32 rounded-[2.5rem] border-4 flex items-center justify-center transition-all duration-500 shadow-xl bg-white",
              mode === 'operational' ? "border-brand-green-light text-brand-green-light" :
                mode === 'debug' ? "border-brand-yellow text-brand-yellow" :
                  "border-red-500 text-red-500 animate-pulse"
            )}>
              <HardHat size={56} />
            </div>
            <div className="text-center space-y-2">
              <div className="text-brand-green-dark font-black text-3xl italic uppercase tracking-tighter">TX-Node v4.0</div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-[10px] font-black uppercase text-brand-green-dark/30 tracking-widest">Active Link</span>
                <div className="w-12 h-1 bg-brand-green-light/20 rounded-full">
                  <motion.div
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-brand-green-light rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SustainabilityInsight() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-32 text-center space-y-16 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />

      <div className="space-y-6">
        <h2 className="text-5xl md:text-7xl font-black text-brand-green-dark tracking-tighter uppercase italic leading-[0.85]">
          Built for <span className="text-brand-green-light">Net-Zero</span>
        </h2>
        <p className="text-xl text-brand-green-dark/40 font-medium max-w-2xl mx-auto leading-relaxed">
          The only industrial platform combining high-resolution IoT forensics with automated carbon neutrality workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "CO2 Tracked", val: "1.2M+", sub: "Metric Tons Annually" },
          { label: "Offset Value", val: "850k", sub: "Simulated Tree Units" },
          { label: "Avg Reduction", val: "14%", sub: "Industrial Waste Recovery" }
        ].map((stat, i) => (
          <div key={i} className="glass p-12 rounded-[3rem] border border-black/5 bg-white group hover:border-brand-green-light/20 transition-all">
            <div className="text-5xl md:text-6xl font-black text-brand-green-dark mb-4 tabular-nums tracking-tighter text-glow group-hover:scale-110 transition-transform">{stat.val}</div>
            <div className="space-y-1">
              <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{stat.label}</div>
              <div className="text-xs font-bold text-brand-green-light/40 italic">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

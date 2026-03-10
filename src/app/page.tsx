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
    <div className="min-h-[85vh] flex flex-col items-center justify-center relative py-10 px-4">
      {/* Background Polish */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl aspect-square bg-brand-green-light/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full max-w-7xl mx-auto">
        <div className="space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-block p-4 glass rounded-3xl border border-brand-green-light/20 mb-2"
          >
            <Image src="/logo.png" alt="CarbonX" width={180} height={50} className="object-contain" priority />
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-6xl md:text-8xl font-black text-brand-green-dark tracking-tighter uppercase italic leading-[0.85]"
            >
              Next Gen <br />
              <span className="text-brand-green-light">Industrial</span><br />
              Intelligence
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-brand-green-dark/60 font-medium max-w-xl mx-auto lg:mx-0"
            >
              Unlock real-time energy forensics, AI machine health tracking, and plant-wide carbon neutrality with RX/TX architecture.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              <Button className="h-16 px-10 rounded-2xl bg-brand-green-dark text-white hover:bg-brand-green-dark/90 text-lg font-black uppercase italic tracking-widest gap-4 shadow-xl shadow-brand-green-dark/20 group">
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" className="h-16 px-10 rounded-2xl border-brand-green-light/20 text-brand-green-dark font-black uppercase italic tracking-widest hover:bg-brand-green-light/5">
              Request Demo
            </Button>
          </motion.div>
        </div>

        {/* 3D Product Model Placeholder */}
        <div className="relative h-[500px] flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full glass md:rounded-[60px] rounded-[40px] border border-white/40 shadow-2xl flex items-center justify-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-green-light/10 to-transparent" />
            <div className="flex flex-col items-center gap-6 relative z-10 text-brand-green-dark/20">
              <Box size={120} className="animate-pulse" />
              <div className="text-xs font-black uppercase tracking-[0.4em]">Product Model Slot</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FeatureGrid() {
  const features = [
    { title: "Plant Scale", desc: "Monitor thousands of RX/TX nodes simultaneously.", icon: Globe },
    { title: "AI Health Score", desc: "Predictive failure detection with 99% accuracy.", icon: Activity },
    { title: "Energy Forensics", desc: "Identify hidden leakages across your entire plant.", icon: Zap },
    { title: "Carbon Offset", desc: "Real-time sustainability metrics and tree tracking.", icon: Leaf },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className="glass p-8 rounded-3xl border border-black/5 hover:border-brand-green-light/20 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-green-light/10 flex items-center justify-center mb-6 group-hover:bg-brand-green-light/20 transition-colors">
              <f.icon className="text-brand-green-light" size={28} />
            </div>
            <h3 className="text-xl font-black text-brand-green-dark mb-2 tracking-tight">{f.title}</h3>
            <p className="text-brand-green-dark/50 text-sm font-medium leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HardwareShowcase() {
  const [mode, setMode] = useState<'operational' | 'debug' | 'emergency'>('operational');

  const modeColors: Record<'operational' | 'debug' | 'emergency', string> = {
    operational: 'text-brand-green-light bg-brand-green-light/10 border-brand-green-light/20',
    debug: 'text-brand-yellow bg-brand-yellow/10 border-brand-yellow/20',
    emergency: 'text-red-500 bg-red-500/10 border-red-500/20'
  };

  return (
    <section className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-20 py-20 bg-brand-green-light/[0.02] rounded-[100px] border border-brand-green-light/5">
      <div className="flex-1 space-y-8 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green-dark/5 text-brand-green-dark/40 text-[10px] font-black uppercase tracking-widest">
          Hardware Intelligence
        </div>
        <h2 className="text-5xl md:text-7xl font-black text-brand-green-dark tracking-tighter uppercase italic leading-[0.9]">
          The <span className="text-brand-green-light">CarbonX</span> <br /> TX-Node
        </h2>
        <p className="text-lg text-brand-green-dark/60 font-medium max-w-lg">
          Our proprietary hardware handles high-speed sampling and local encryption before syncing to the RX Gateway.
        </p>

        {/* Hardware Mode Switcher */}
        <div className="space-y-4">
          <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Select Hardware Mode</p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            {(['operational', 'debug', 'emergency'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                  mode === m
                    ? "bg-brand-green-dark text-white shadow-xl shadow-brand-green-dark/20"
                    : "bg-white border border-black/5 text-brand-green-dark/40 hover:bg-black/5"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-xl h-[450px] relative">
        <motion.div
          animate={{
            scale: mode === 'emergency' ? [1, 1.02, 1] : 1,
            rotate: mode === 'debug' ? [0, 2, 0, -2, 0] : 0
          }}
          transition={{ duration: 0.5, repeat: mode !== 'operational' ? Infinity : 0 }}
          className="w-full h-full glass md:rounded-[60px] rounded-[40px] border-2 border-dashed border-black/10 flex items-center justify-center relative shadow-inner group"
        >
          {/* Glow effect based on mode */}
          <div className={cn(
            "absolute inset-0 transition-all duration-1000 blur-[80px] opacity-30",
            mode === 'operational' ? "bg-brand-green-light" : mode === 'debug' ? "bg-brand-yellow" : "bg-red-500"
          )} />

          <div className="flex flex-col items-center gap-6 relative z-10">
            <div className={cn("w-24 h-24 rounded-3xl border-2 flex items-center justify-center transition-all duration-500", modeColors[mode])}>
              <HardHat size={40} />
            </div>
            <div className="text-center">
              <div className="text-brand-green-dark font-black text-xl italic uppercase">TX-Node v4.0</div>
              <div className={cn("text-[10px] font-black uppercase mt-1", mode === 'emergency' ? 'text-red-500' : 'opacity-40')}>Hardware Placeholder</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SustainabilityInsight() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-black text-brand-green-dark tracking-tighter uppercase italic">
          Built for <span className="text-brand-green-light">Sustainability</span>
        </h2>
        <p className="text-lg text-brand-green-dark/40 font-medium max-w-2xl mx-auto">
          We combine IIoT data with environmental modeling to help industrial leaders reach Net Zero targets faster.
        </p>
      </div>

      <div className="glass p-12 md:rounded-[60px] rounded-[40px] border border-black/5 bg-gradient-to-br from-emerald-500/[0.03] to-transparent">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="text-4xl font-black text-brand-green-dark mb-1 tabular-nums">1.2M+</div>
            <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Metric Tons CO2 Tracked</div>
          </div>
          <div>
            <div className="text-4xl font-black text-brand-green-dark mb-1 tabular-nums">850k</div>
            <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Simulated Tree Offsets</div>
          </div>
          <div>
            <div className="text-4xl font-black text-brand-green-dark mb-1 tabular-nums">14%</div>
            <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Avg Energy Savings</div>
          </div>
        </div>
      </div>
    </section>
  );
}



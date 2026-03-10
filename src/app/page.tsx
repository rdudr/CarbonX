'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Activity, Zap, Leaf, Factory, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Page() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <motion.div
      key="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LandingPage />
    </motion.div>
  );
}

function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center relative py-20 px-4">
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-6 justify-center lg:justify-start pt-8"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-brand-green-light/10 overflow-hidden">
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-brand-green-dark/40 italic">USER</div>
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-sm font-black text-brand-green-dark">50+ Manufacturing Plants</div>
              <div className="text-xs font-bold text-brand-green-dark/40">Powered by CarbonX Architecture</div>
            </div>
          </motion.div>
        </div>

        {/* 3D-like Animated Visuals Group */}
        <div className="relative group perspective-1000 h-[500px] flex items-center justify-center">
          <motion.div
            animate={{
              rotateY: [0, 10, 0, -10, 0],
              rotateX: [0, -10, 0, 10, 0],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative z-20"
          >
            {/* Central Hub Piece */}
            <div className="w-56 h-56 md:w-64 md:h-64 glass md:rounded-[60px] rounded-[40px] border border-white/40 shadow-2xl flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green-light/20 to-transparent" />
              <Factory size={80} className="text-brand-green-dark relative z-10" />

              {/* Scanning line effect */}
              <motion.div
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-brand-green-light/50 blur-[4px] z-20"
              />
            </div>

            {/* Floating Nodes Around */}
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              className="absolute -top-10 -right-5 md:-right-10 w-28 h-28 md:w-32 md:h-32 glass md:rounded-3xl rounded-2xl border border-white/50 shadow-xl flex flex-col items-center justify-center gap-2 p-4"
            >
              <Zap className="text-brand-yellow" size={24} />
              <div className="text-[10px] font-black text-brand-green-dark/40 uppercase">RX Gateway</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-10 md:-bottom-12 -left-5 md:-left-8 w-36 md:w-40 h-24 glass md:rounded-3xl rounded-2xl border border-white/50 shadow-xl flex items-center gap-3 p-4"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-green-light/20 flex items-center justify-center">
                <Activity size={20} className="text-brand-green-light" />
              </div>
              <div>
                <div className="text-[8px] font-black text-brand-green-dark/40 uppercase">Efficiency</div>
                <div className="text-sm font-black text-brand-green-dark italic">98.4%</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              className="absolute top-1/2 -left-16 md:-left-20 w-16 h-16 glass rounded-full border border-white/60 shadow-lg flex items-center justify-center"
            >
              <Leaf size={20} className="text-brand-green-light" />
            </motion.div>
          </motion.div>

          {/* Shadow/Reflection */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[200px] h-[30px] bg-black/5 blur-[20px] rounded-full scale-x-150 -z-10" />
        </div>
      </div>
    </div>
  );
}

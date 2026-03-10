'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    ShieldCheck,
    HardHat,
    UserCircle,
    ArrowRight,
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole>(null);

    const handleLogin = (role: UserRole) => {
        setSelectedRole(role);
        // Simulate delay for effect
        setTimeout(() => login(role), 800);
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
            {/* Background Polish */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-green-light/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-yellow/5 blur-[180px] rounded-full pointer-events-none" />

            <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Visual Branding Section */}
                <div className="space-y-8 text-center lg:text-left">
                    <div className="inline-block p-4 glass rounded-3xl border border-brand-green-light/20 mb-4 animate-bounce-slow">
                        <Image src="/logo.png" alt="CarbonX Logo" width={180} height={50} className="object-contain" priority />
                    </div>
                    <div>
                        <h1 className="text-5xl lg:text-7xl font-black text-brand-green-dark tracking-tighter uppercase italic leading-[0.9]">
                            Industrial <br />
                            <span className="text-brand-green-light underline decoration-8 underline-offset-8">Intelligence</span>
                        </h1>
                        <p className="mt-8 text-lg font-medium text-brand-green-dark/60 max-w-md">
                            CarbonX RX/TX Architecture for real-time energy monitoring and AI-driven carbon neutrality.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-black text-brand-green-dark/40 uppercase tracking-[0.2em] justify-center lg:justify-start">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-brand-green-light/20 flex items-center justify-center">
                                    <ShieldCheck size={14} className="text-brand-green-light" />
                                </div>
                            ))}
                        </div>
                        Secure Protocol 4.0 Active
                    </div>
                </div>

                {/* Login Role Selection Card */}
                <Card className="glass p-1 rounded-[40px] border-brand-green-light/10 shadow-2xl overflow-hidden group shadow-brand-green-light/5">
                    <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[38px] space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-brand-green-dark uppercase italic">Command Access</h2>
                            <div className="p-2 bg-brand-green-light/10 rounded-xl">
                                <Lock size={20} className="text-brand-green-light" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-brand-green-dark/40 uppercase tracking-widest pl-1 mb-4">Select Authorized Personnel</p>

                            {/* Role Buttons */}
                            <button
                                onClick={() => handleLogin('ADMIN')}
                                className={cn(
                                    "w-full group p-6 rounded-3xl border border-black/5 flex items-center justify-between transition-all duration-300",
                                    selectedRole === 'ADMIN' ? "bg-brand-green-dark text-white scale-95" : "hover:bg-brand-green-light/5 hover:border-brand-green-light/20 bg-black/[0.02]"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", selectedRole === 'ADMIN' ? "bg-white/10" : "bg-brand-green-dark/5")}>
                                        <ShieldCheck size={24} className={cn(selectedRole === 'ADMIN' ? "text-white" : "text-brand-green-dark")} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-black uppercase tracking-widest opacity-40">Level 0: Root</div>
                                        <div className="text-lg font-black italic">Super Admin</div>
                                    </div>
                                </div>
                                <ArrowRight size={20} className={cn("opacity-0 group-hover:opacity-100 transition-all", selectedRole === 'ADMIN' && "opacity-100")} />
                            </button>

                            <button
                                onClick={() => handleLogin('ENGINEER')}
                                className={cn(
                                    "w-full group p-6 rounded-3xl border border-black/5 flex items-center justify-between transition-all duration-300",
                                    selectedRole === 'ENGINEER' ? "bg-brand-green-dark text-white scale-95" : "hover:bg-blue-500/5 hover:border-blue-500/20 bg-black/[0.02]"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", selectedRole === 'ENGINEER' ? "bg-white/10" : "bg-blue-500/5")}>
                                        <HardHat size={24} className={cn(selectedRole === 'ENGINEER' ? "text-white" : "text-blue-600")} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-black uppercase tracking-widest opacity-40">Level 1: Ops</div>
                                        <div className="text-lg font-black italic">Maintenance Engineer</div>
                                    </div>
                                </div>
                                <ArrowRight size={20} className={cn("opacity-0 group-hover:opacity-100 transition-all", selectedRole === 'ENGINEER' && "opacity-100")} />
                            </button>

                            <button
                                onClick={() => handleLogin('MANAGER')}
                                className={cn(
                                    "w-full group p-6 rounded-3xl border border-black/5 flex items-center justify-between transition-all duration-300",
                                    selectedRole === 'MANAGER' ? "bg-brand-green-dark text-white scale-95" : "hover:bg-orange-500/5 hover:border-orange-500/20 bg-black/[0.02]"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", selectedRole === 'MANAGER' ? "bg-white/10" : "bg-orange-500/5")}>
                                        <UserCircle size={24} className={cn(selectedRole === 'MANAGER' ? "text-white" : "text-orange-600")} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-black uppercase tracking-widest opacity-40">Level 2: Zone</div>
                                        <div className="text-lg font-black italic">Zone Manager</div>
                                    </div>
                                </div>
                                <ArrowRight size={20} className={cn("opacity-0 group-hover:opacity-100 transition-all", selectedRole === 'MANAGER' && "opacity-100")} />
                            </button>
                        </div>

                        <div className="pt-4 text-center">
                            <p className="text-[10px] font-bold text-brand-green-dark/30 uppercase tracking-[0.3em]">
                                Encryption Protocol AES-256 Enabled
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

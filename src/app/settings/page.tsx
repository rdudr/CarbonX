'use client';

import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, User, HardDrive, Smartphone } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="fade-in space-y-6">
            <div className="glass p-6 rounded-3xl">
                <h1 className="text-3xl font-bold text-brand-green-dark">System Settings</h1>
                <p className="text-brand-green-dark/60 mt-2">Manage TX nodes, user profiles, and AI thresholds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Card */}
                <div className="glass-card theme-mint p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center">
                        <User className="text-brand-green-dark" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-brand-green-dark">Admin Profile</h3>
                        <p className="text-brand-green-dark/60 text-xs mt-1">Manage institutional credentials.</p>
                        <button className="mt-4 text-xs font-bold text-brand-green-light bg-brand-green-light/10 p-2 px-4 rounded-full border border-brand-green-light/20">Edit Profile</button>
                    </div>
                </div>

                {/* Notifications Card */}
                <div className="glass-card theme- peach p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center">
                        <Bell className="text-orange-700" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-orange-900">Alert Configuration</h3>
                        <p className="text-orange-900/60 text-xs mt-1">Set loss threshold (currently 10%).</p>
                        <button className="mt-4 text-xs font-bold text-orange-700 bg-orange-700/10 p-2 px-4 rounded-full border border-orange-700/20">Update Limits</button>
                    </div>
                </div>

                {/* Nodes Card */}
                <div className="glass-card theme-blue p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center">
                        <HardDrive className="text-blue-700" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-blue-900">TX Node Manager</h3>
                        <p className="text-blue-900/60 text-xs mt-1">Connect or decommission nodes.</p>
                        <button className="mt-4 text-xs font-bold text-blue-700 bg-blue-700/10 p-2 px-4 rounded-full border border-blue-700/20">Manage Nodes</button>
                    </div>
                </div>

                {/* Security Card */}
                <div className="glass-card theme-yellow p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center">
                        <Shield className="text-yellow-700" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-yellow-900">Security & Keys</h3>
                        <p className="text-yellow-900/60 text-xs mt-1">Gateway API keys and firewall rules.</p>
                        <button className="mt-4 text-xs font-bold text-yellow-700 bg-yellow-700/10 p-2 px-4 rounded-full border border-yellow-700/20">Config Store</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

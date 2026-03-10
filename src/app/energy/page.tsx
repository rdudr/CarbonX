import React from 'react';

export default function EnergyPage() {
    return (
        <div className="fade-in space-y-6">
            <div className="glass p-6 rounded-3xl">
                <h1 className="text-3xl font-bold text-brand-green-dark">Energy Monitor</h1>
                <p className="text-brand-green-dark/60 mt-2">Real-time RX/TX energy balancing and loss detection.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card theme-mint p-8 min-h-[200px] flex items-center justify-center">
                    <span className="text-brand-green-dark font-semibold">Live Load Balancer coming soon...</span>
                </div>
                <div className="glass-card theme-blue p-8 min-h-[200px] flex items-center justify-center">
                    <span className="text-brand-green-dark font-semibold">Real-time Flux coming soon...</span>
                </div>
            </div>
        </div>
    );
}

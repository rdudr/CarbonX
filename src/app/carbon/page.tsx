import React from 'react';

export default function CarbonPage() {
    return (
        <div className="fade-in space-y-6">
            <div className="glass p-6 rounded-3xl">
                <h1 className="text-3xl font-bold text-brand-green-dark">Carbon Analytics</h1>
                <p className="text-brand-green-dark/60 mt-2">Track emissions and environmental impact across the plant.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card theme-peach p-8 min-h-[200px] flex items-center justify-center">
                    <span className="text-brand-green-dark font-semibold">Emission Trends coming soon...</span>
                </div>
                <div className="glass-card theme-yellow p-8 min-h-[200px] flex items-center justify-center">
                    <span className="text-brand-green-dark font-semibold">CO2 Offset Data coming soon...</span>
                </div>
            </div>
        </div>
    );
}

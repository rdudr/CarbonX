import React from 'react';

export default function MachinesPage() {
    return (
        <div className="fade-in space-y-6">
            <div className="glass p-6 rounded-3xl">
                <h1 className="text-3xl font-bold text-brand-green-dark">Machine Health Detailed</h1>
                <p className="text-brand-green-dark/60 mt-2">Deep dive into TX nodes and performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card theme-mint p-8 min-h-[200px] flex items-center justify-center">
                    <span className="text-brand-green-dark font-semibold">Detailed Diagnostics coming soon...</span>
                </div>
                <div className="glass-card theme-blue p-8 min-h-[200px] flex items-center justify-center">
                    <span className="text-brand-green-dark font-semibold">Phase Analysis coming soon...</span>
                </div>
            </div>
        </div>
    );
}

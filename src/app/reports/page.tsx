import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
    return (
        <div className="fade-in space-y-6">
            <div className="glass p-6 rounded-3xl">
                <h1 className="text-3xl font-bold text-brand-green-dark">Reports Center</h1>
                <p className="text-brand-green-dark/60 mt-2">Download AI datasets and machine health PDFs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card theme-mint p-8 flex flex-col items-center justify-center gap-4 text-center">
                    <h3 className="font-bold text-brand-green-dark">Machine Metrics (PDF)</h3>
                    <p className="text-brand-green-dark/60 text-sm">Comprehensive plant-wide health report.</p>
                    <a href="/api/export?type=pdf">
                        <Button className="bg-brand-green-light hover:bg-brand-green-light/80 text-white rounded-full px-6">
                            <Download size={18} className="mr-2" /> Download PDF
                        </Button>
                    </a>
                </div>

                <div className="glass-card theme-blue p-8 flex flex-col items-center justify-center gap-4 text-center">
                    <h3 className="font-bold text-brand-green-dark">AI Telemetry (CSV)</h3>
                    <p className="text-brand-green-dark/60 text-sm">Raw data for external AI processing.</p>
                    <a href="/api/export?type=csv">
                        <Button className="bg-brand-green-light hover:bg-brand-green-light/80 text-white rounded-full px-6">
                            <Download size={18} className="mr-2" /> Download CSV
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}

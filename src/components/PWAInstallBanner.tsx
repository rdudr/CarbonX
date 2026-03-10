'use client';

import { usePWA } from '@/hooks/usePWA';
import { Download } from 'lucide-react';

/**
 * PWAInstallBanner — shows a subtle install prompt banner at the top of the screen
 * when the app is installable (before it's added to home screen).
 */
export function PWAInstallBanner() {
    const { isInstallable, isInstalled, promptInstall } = usePWA();

    if (!isInstallable || isInstalled) return null;

    return (
        <div
            id="pwa-install-banner"
            className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-2
                 bg-brand-green-dark/95 backdrop-blur-md border-b border-brand-green-light/30
                 text-brand-white text-sm shadow-lg"
        >
            <span className="flex items-center gap-2">
                <Download size={16} className="text-brand-green-light" />
                <span>Install CarbonX as an app for offline access</span>
            </span>
            <div className="flex gap-2">
                <button
                    onClick={promptInstall}
                    id="pwa-install-btn"
                    className="bg-brand-green-light text-white text-xs font-semibold px-3 py-1 rounded-full
                     hover:bg-brand-green-light/80 transition-colors cursor-pointer"
                >
                    Install
                </button>
                <button
                    onClick={() => {
                        const banner = document.getElementById('pwa-install-banner');
                        if (banner) banner.style.display = 'none';
                    }}
                    className="text-brand-white/60 hover:text-brand-white text-xs px-2 cursor-pointer"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

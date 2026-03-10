"use client";

import { Home, Activity, Leaf, Settings, Download } from 'lucide-react';
import Dock from './Dock';

export function NavigationDock() {
  const items = [
    { icon: <Home size={24} />, label: 'Dashboard', onClick: () => window.location.hash = 'dashboard' },
    { icon: <Activity size={24} />, label: 'Machines Health', onClick: () => window.location.hash = 'health' },
    { icon: <Leaf size={24} />, label: 'Carbon Analytics', onClick: () => window.location.hash = 'carbon' },
    { icon: <Download size={24} />, label: 'Reports (CSV/PDF)', onClick: () => window.location.hash = 'reports' },
    { icon: <Settings size={24} />, label: 'Settings', onClick: () => window.location.hash = 'settings' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass shadow-2xl rounded-2xl p-2 border-brand-green-light/30">
        <Dock 
          items={items} 
          panelHeight={68} 
          baseItemSize={50} 
          magnification={70} 
        />
      </div>
    </div>
  );
}

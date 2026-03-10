"use client";

import { Home, Activity, Leaf, Settings, Download } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Dock from './Dock';

export function NavigationDock() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const hideNav = pathname === '/login' || (!isAuthenticated && pathname === '/');

  if (hideNav) return null;

  const items = [
    { icon: <Home size={24} />, label: 'Dashboard', onClick: () => router.push('/dashboard') },
    { icon: <Activity size={24} />, label: 'Machines Health', onClick: () => router.push('/machines') },
    { icon: <Leaf size={24} />, label: 'Carbon Analytics', onClick: () => router.push('/carbon') },
    { icon: <Download size={24} />, label: 'Reports (CSV/PDF)', onClick: () => router.push('/reports') },
    { icon: <Settings size={24} />, label: 'Settings', onClick: () => router.push('/settings') },
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

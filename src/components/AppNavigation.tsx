'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Activity,
    Leaf,
    Download,
    Settings,
    Zap,
    Menu,
    X,
    LogOut,
    UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/machines', label: 'Machine Health', icon: Activity },
    { href: '/carbon', label: 'Carbon Analytics', icon: Leaf },
    { href: '/energy', label: 'Energy Monitor', icon: Zap },
    { href: '/reports', label: 'Reports', icon: Download },
    { href: '/settings', label: 'Settings', icon: Settings },
] as const;

// ─── Desktop Top Navigation ───────────────────────────────────────────────────
function DesktopNav({ pathname }: { pathname: string }) {
    const { role, logout, user } = useAuth();

    // Role-based filtering
    const visibleNavItems = NAV_ITEMS.filter(item => {
        if (role === 'ADMIN') return true;
        if (role === 'ENGINEER') return ['/dashboard', '/machines', '/energy', '/settings'].includes(item.href);
        if (role === 'MANAGER') return ['/dashboard', '/carbon', '/reports'].includes(item.href);
        return false;
    });

    return (
        <nav
            id="desktop-nav"
            className="hidden md:flex items-center justify-between px-8 py-1 glass border-b border-brand-green-light/10 shadow-sm sticky top-0 z-50 print:hidden"
        >
            {/* Logo + Brand */}
            <Link href="/" className="flex items-center gap-2 group" id="nav-logo">
                <Image src="/logo.png" alt="CarbonX Logo" width={80} height={28} className="group-hover:scale-105 transition-all duration-300 object-contain" priority />
            </Link>

            {/* Nav Links */}
            <ul className="flex items-center gap-1" role="list">
                {visibleNavItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <li key={href}>
                            <Link
                                href={href}
                                id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-brand-green-dark text-white shadow-md'
                                        : 'text-brand-green-dark/70 hover:text-brand-green-dark hover:bg-brand-green-light/5'
                                )}
                            >
                                <Icon size={16} />
                                {label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-black/[0.03] rounded-full border border-black/5">
                    <UserCircle size={14} className="text-brand-green-dark/40" />
                    <span className="text-[10px] font-black uppercase text-brand-green-dark/60 tracking-wider font-mono">
                        {role}
                    </span>
                    <button onClick={logout} className="ml-2 p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-md transition-colors" title="Logout">
                        <LogOut size={14} />
                    </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-green-dark/60 font-medium whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-brand-green-light animate-pulse" />
                    Online
                </div>
            </div>
        </nav>
    );
}

// ─── Mobile Navigation (hamburger) ──────────────────────────────────────────
function MobileNav({ pathname }: { pathname: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { role, logout, user } = useAuth();

    const visibleNavItems = NAV_ITEMS.filter(item => {
        if (role === 'ADMIN') return true;
        if (role === 'ENGINEER') return ['/dashboard', '/machines', '/energy', '/settings'].includes(item.href);
        if (role === 'MANAGER') return ['/dashboard', '/carbon', '/reports'].includes(item.href);
        return false;
    });

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <>
            <div
                id="mobile-topbar"
                className="md:hidden flex items-center justify-between px-4 py-2 glass border-b border-brand-green-light/10 shadow-sm sticky top-0 z-50"
            >
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="CarbonX Logo" width={100} height={28} className="object-contain" priority />
                </Link>

                <button
                    id="hamburger-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-brand-green-dark/80 hover:bg-brand-green-light/10 transition-all duration-200 cursor-pointer"
                >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[100] flex"
                    id="mobile-menu"
                >
                    <div
                        className="absolute inset-0 bg-white/60 backdrop-blur-md"
                        onClick={() => setIsOpen(false)}
                    />

                    <div
                        className="relative ml-auto w-72 h-full glass border-l border-brand-green-light/10 shadow-2xl flex flex-col p-6 gap-6 animate-slide-in"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Image src="/logo.png" alt="CarbonX Logo" width={90} height={24} className="object-contain" />
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg
                           text-brand-green-dark/40 hover:text-brand-green-dark transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <nav>
                            <ul className="flex flex-col gap-1" role="list">
                                {visibleNavItems.map(({ href, label, icon: Icon }) => {
                                    const isActive = pathname === href;
                                    return (
                                        <li key={href}>
                                            <Link
                                                href={href}
                                                id={`mobile-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                                                className={cn(
                                                    'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                                                    isActive
                                                        ? 'bg-brand-green-dark text-white shadow-lg'
                                                        : 'text-brand-green-dark/70 hover:bg-brand-green-light/5'
                                                )}
                                            >
                                                <Icon size={20} />
                                                {label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        <div className="mt-auto space-y-4">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest border border-red-500/10"
                            >
                                Sign Out Session
                                <LogOut size={16} />
                            </button>
                            <div className="flex items-center gap-2 text-xs text-brand-green-dark/40 px-1 font-medium">
                                <span className="w-2 h-2 rounded-full bg-brand-green-light animate-pulse" />
                                {role} Connected
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function AppNavigation() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    // Hide navigation on login page or when logged out on home page (landing)
    const hideNav = pathname === '/login' || (!isAuthenticated && pathname === '/');

    if (hideNav) return null;

    return (
        <>
            <MobileNav pathname={pathname} />
            <DesktopNav pathname={pathname} />
        </>
    );
}

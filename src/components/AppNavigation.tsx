'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Activity,
    Leaf,
    Download,
    Settings,
    Zap,
    Menu,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Navigation items config ─────────────────────────────────────────────────
const NAV_ITEMS = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/machines', label: 'Machine Health', icon: Activity },
    { href: '/carbon', label: 'Carbon Analytics', icon: Leaf },
    { href: '/energy', label: 'Energy Monitor', icon: Zap },
    { href: '/reports', label: 'Reports', icon: Download },
    { href: '/settings', label: 'Settings', icon: Settings },
] as const;

// ─── Desktop Top Navigation ───────────────────────────────────────────────────
function DesktopNav({ pathname }: { pathname: string }) {
    return (
        <nav
            id="desktop-nav"
            className="hidden md:flex items-center justify-between px-6 py-3
                 glass border-b border-brand-green-light/20 shadow-lg"
        >
            {/* Logo + Brand */}
            <Link href="/" className="flex items-center gap-3 group" id="nav-logo">
                <div className="w-8 h-8 rounded-lg bg-brand-green-light flex items-center justify-center
                        group-hover:scale-110 transition-transform">
                    <Zap size={18} className="text-white" />
                </div>
                <span className="text-brand-white font-bold text-lg tracking-tight">
                    Carbon<span className="text-brand-green-light">X</span>
                </span>
            </Link>

            {/* Nav Links */}
            <ul className="flex items-center gap-1" role="list">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <li key={href}>
                            <Link
                                href={href}
                                id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-brand-green-light/20 text-brand-green-light border border-brand-green-light/30'
                                        : 'text-brand-white/70 hover:text-brand-white hover:bg-white/5'
                                )}
                            >
                                <Icon size={16} />
                                {label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* Status indicator */}
            <div className="flex items-center gap-2 text-xs text-brand-white/60">
                <span className="w-2 h-2 rounded-full bg-brand-green-light animate-pulse" />
                System Online
            </div>
        </nav>
    );
}

// ─── Mobile Navigation (hamburger) ──────────────────────────────────────────
function MobileNav({ pathname }: { pathname: string }) {
    const [isOpen, setIsOpen] = useState(false);

    // Close menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <>
            {/* Mobile Top Bar */}
            <div
                id="mobile-topbar"
                className="md:hidden flex items-center justify-between px-4 py-3
                   glass border-b border-brand-green-light/20 shadow-lg"
            >
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-green-light flex items-center justify-center">
                        <Zap size={15} className="text-white" />
                    </div>
                    <span className="text-brand-white font-bold tracking-tight">
                        Carbon<span className="text-brand-green-light">X</span>
                    </span>
                </Link>

                <button
                    id="hamburger-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={isOpen}
                    aria-controls="mobile-menu"
                    className="w-9 h-9 flex items-center justify-center rounded-lg
                     text-brand-white/80 hover:text-brand-white hover:bg-white/10
                     transition-all duration-200 cursor-pointer"
                >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Slide-out Menu */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 z-50 flex"
                    id="mobile-menu"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navigation menu"
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div
                        className="relative ml-auto w-72 h-full glass border-l border-brand-green-light/20
                       shadow-2xl flex flex-col p-6 gap-6 animate-slide-in"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <span className="text-brand-white font-bold text-lg tracking-tight">
                                Carbon<span className="text-brand-green-light">X</span>
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close menu"
                                className="w-8 h-8 flex items-center justify-center rounded-lg
                           text-brand-white/60 hover:text-brand-white hover:bg-white/10
                           transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Nav Links */}
                        <nav>
                            <ul className="flex flex-col gap-1" role="list">
                                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                                    const isActive = pathname === href;
                                    return (
                                        <li key={href}>
                                            <Link
                                                href={href}
                                                id={`mobile-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                                                className={cn(
                                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                                    isActive
                                                        ? 'bg-brand-green-light/20 text-brand-green-light border border-brand-green-light/30'
                                                        : 'text-brand-white/70 hover:text-brand-white hover:bg-white/5'
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

                        {/* Footer status */}
                        <div className="mt-auto flex items-center gap-2 text-xs text-brand-white/50 px-1">
                            <span className="w-2 h-2 rounded-full bg-brand-green-light animate-pulse" />
                            RX Gateway · System Online
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── Main Navigation export ────────────────────────────────────────────────
export function AppNavigation() {
    const pathname = usePathname();
    return (
        <>
            <MobileNav pathname={pathname} />
            <DesktopNav pathname={pathname} />
        </>
    );
}

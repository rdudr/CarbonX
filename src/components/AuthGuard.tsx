'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRole?: 'ADMIN' | 'ENGINEER' | 'MANAGER';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
    const { isAuthenticated, role, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated && pathname !== '/login') {
                router.push('/login');
            } else if (isAuthenticated && requiredRole && role !== 'ADMIN' && role !== requiredRole) {
                // If logged in but lacks specific role (ADMIN can see everything)
                router.push('/');
            }
        }
    }, [isAuthenticated, role, loading, router, pathname, requiredRole]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-[999] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-green-light border-t-transparent rounded-full animate-spin" />
                    <p className="text-brand-green-dark font-black text-xs uppercase tracking-widest animate-pulse">
                        Authenticating...
                    </p>
                </div>
            </div>
        );
    }

    // Don't render content if we are about to redirect
    if (!isAuthenticated && pathname !== '/login') return null;
    if (isAuthenticated && requiredRole && role !== 'ADMIN' && role !== requiredRole) return null;

    return <>{children}</>;
}

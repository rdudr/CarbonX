'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'ADMIN' | 'ENGINEER' | 'MANAGER' | null;

interface User {
    id: string;
    name: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    role: UserRole;
    login: (role: UserRole) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Mock persistence
        const savedUser = localStorage.getItem('carbonx_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (role: UserRole) => {
        const mockUser: User = {
            id: '1',
            name: role === 'ADMIN' ? 'Plant Director' : role === 'ENGINEER' ? 'Chief Engineer' : 'Zone Manager',
            role
        };
        setUser(mockUser);
        localStorage.setItem('carbonx_user', JSON.stringify(mockUser));
        router.push('/');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('carbonx_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            role: user?.role || null,
            login,
            logout,
            isAuthenticated: !!user,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

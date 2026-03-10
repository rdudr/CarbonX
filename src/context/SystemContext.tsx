'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { PhaseType } from '@/types/energy';

interface TXNodeConfig {
    id: string;
    name: string;
    phaseType: PhaseType;
    targetKw: number;
}

interface SystemConfig {
    nodes: TXNodeConfig[];
    lossThreshold: number; // Percentage
}

interface SystemContextType {
    config: SystemConfig;
    updateNode: (id: string, updates: Partial<TXNodeConfig>) => void;
    updateThreshold: (val: number) => void;
}

const DEFAULT_CONFIG: SystemConfig = {
    nodes: [
        { id: 'TX-1', name: 'CNC Machine A', phaseType: 'three', targetKw: 15 },
        { id: 'TX-2', name: 'Lathe B', phaseType: 'three', targetKw: 10 },
        { id: 'TX-3', name: 'Compressor Array', phaseType: 'three', targetKw: 50 },
        { id: 'TX-4', name: 'HVAC System', phaseType: 'single', targetKw: 80 },
    ],
    lossThreshold: 10,
};

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);

    // Persistence (Optional but good for "Dynamic" feel)
    useEffect(() => {
        const saved = localStorage.getItem('carbonx_config');
        if (saved) {
            try {
                setConfig(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load config', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('carbonx_config', JSON.stringify(config));
    }, [config]);

    const updateNode = (id: string, updates: Partial<TXNodeConfig>) => {
        setConfig(prev => ({
            ...prev,
            nodes: prev.nodes.map(n => n.id === id ? { ...n, ...updates } : n)
        }));
    };

    const updateThreshold = (val: number) => {
        setConfig(prev => ({ ...prev, lossThreshold: val }));
    };

    return (
        <SystemContext.Provider value={{ config, updateNode, updateThreshold }}>
            {children}
        </SystemContext.Provider>
    );
}

export function useSystem() {
    const context = useContext(SystemContext);
    if (!context) throw new Error('useSystem must be used within SystemProvider');
    return context;
}

'use client';

import { useState, useCallback, useRef } from 'react';
import type { EnergyNotification, NotificationSeverity } from '@/types/energy';
import { notificationRateLimiter } from '@/lib/debounce';

let notificationCounter = 0;

/**
 * Task 7: Hook for managing the CarbonX notification queue.
 * Integrates Task 6.2 rate limiter (5-second cooldown).
 * Critical notifications bypass the cooldown.
 */
export function useEnergyNotifications() {
    const [notifications, setNotifications] = useState<EnergyNotification[]>([]);
    const audioRef = useRef<AudioContext | null>(null);

    const addNotification = useCallback(
        (
            params: {
                severity: NotificationSeverity;
                title: string;
                message: string;
                gatewayId?: string;
                nodeId?: string;
                lossPercent?: number;
            }
        ) => {
            const isCritical = params.severity === 'critical';
            const rateLimitKey = params.gatewayId ?? params.nodeId ?? 'global';

            // Rate limiting check — critical alerts bypass cooldown
            if (!notificationRateLimiter.isAllowed(rateLimitKey, isCritical)) {
                return null; // Rate limited — skip notification
            }

            const notification: EnergyNotification = {
                id: `notif-${++notificationCounter}-${Date.now()}`,
                ...params,
                timestamp: new Date().toISOString(),
                dismissed: false,
            };

            // Play audio alert for critical notifications (Task 7.2)
            if (isCritical) {
                playCriticalAlert();
            }

            setNotifications((prev) => [notification, ...prev].slice(0, 20)); // Keep max 20
            return notification.id;
        },
        []
    );

    const dismiss = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n))
        );
    }, []);

    const dismissAll = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, dismissed: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const activeNotifications = notifications.filter((n) => !n.dismissed);
    const criticalCount = activeNotifications.filter((n) => n.severity === 'critical').length;

    return {
        notifications,
        activeNotifications,
        criticalCount,
        addNotification,
        dismiss,
        dismissAll,
        clearAll,
    };
}

// ─── Audio Alert for critical loss (Task 7.2) ─────────────────────────────────
function playCriticalAlert() {
    try {
        const AudioContextClass =
            window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    } catch {
        // Audio not available — silent fallback
    }
}

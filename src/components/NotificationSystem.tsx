'use client';

import React from 'react';
import { X, AlertTriangle, Info, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnergyNotifications } from '@/hooks/useEnergyNotifications';
import type { EnergyNotification, NotificationSeverity } from '@/types/energy';

// ─── Individual Notification Toast ───────────────────────────────────────────

function NotificationToast({
    notification,
    onDismiss,
}: {
    notification: EnergyNotification;
    onDismiss: (id: string) => void;
}) {
    const isCritical = notification.severity === 'critical';

    const iconMap: Record<NotificationSeverity, React.ReactNode> = {
        info: <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />,
        warning: <AlertTriangle size={16} className="text-brand-yellow flex-shrink-0 mt-0.5" />,
        critical: <Zap size={16} className="text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />,
    };

    const containerClasses: Record<NotificationSeverity, string> = {
        info: 'border-blue-500/30 bg-blue-500/10',
        warning: 'border-brand-yellow/40 bg-brand-yellow/10',
        critical: 'border-red-500/60 bg-red-500/15 glow-red ring-1 ring-red-500/30',
    };

    return (
        <div
            id={`notification-${notification.id}`}
            role="alert"
            aria-live={isCritical ? 'assertive' : 'polite'}
            className={cn(
                'flex items-start gap-3 p-3 rounded-xl border backdrop-blur-sm',
                'text-brand-white text-sm fade-in',
                containerClasses[notification.severity]
            )}
        >
            {iconMap[notification.severity]}

            <div className="flex-1 min-w-0">
                <div className="font-semibold leading-tight">{notification.title}</div>
                <div className="text-brand-white/70 text-xs mt-0.5 leading-relaxed">
                    {notification.message}
                </div>
                {notification.lossPercent !== undefined && (
                    <div className="text-xs mt-1 font-mono text-brand-white/50">
                        Loss: {notification.lossPercent.toFixed(1)}%
                    </div>
                )}
            </div>

            <button
                onClick={() => onDismiss(notification.id)}
                aria-label="Dismiss notification"
                className="flex-shrink-0 text-brand-white/40 hover:text-brand-white/80 transition-colors cursor-pointer"
            >
                <X size={14} />
            </button>
        </div>
    );
}

// ─── Critical Alert Banner (Task 7.2) ─────────────────────────────────────────

function CriticalAlertBanner({ count }: { count: number }) {
    if (count === 0) return null;

    return (
        <div
            id="critical-alert-banner"
            role="alert"
            aria-live="assertive"
            className="flex items-center gap-3 px-4 py-3 rounded-xl
                 bg-red-500/20 border border-red-500/50 backdrop-blur-sm
                 ring-1 ring-red-500/30"
        >
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <span className="font-bold text-red-400 text-sm">
                    ⚡ CRITICAL ALERT — {count} critical energy loss event{count > 1 ? 's' : ''} detected
                </span>
            </div>
            <span className="text-brand-white/60 text-xs ml-auto">Requires immediate action</span>
        </div>
    );
}

// ─── Notification Panel ────────────────────────────────────────────────────────

interface NotificationPanelProps {
    className?: string;
}

export function NotificationPanel({ className }: NotificationPanelProps) {
    const { activeNotifications, criticalCount, dismiss, dismissAll } = useEnergyNotifications();

    if (activeNotifications.length === 0) return null;

    return (
        <div
            id="notification-panel"
            className={cn('flex flex-col gap-2', className)}
            aria-label="Energy monitoring notifications"
        >
            {/* Critical banner at top */}
            <CriticalAlertBanner count={criticalCount} />

            {/* Notification list */}
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                {activeNotifications.map((n) => (
                    <NotificationToast key={n.id} notification={n} onDismiss={dismiss} />
                ))}
            </div>

            {/* Dismiss all */}
            {activeNotifications.length > 1 && (
                <button
                    id="dismiss-all-notifications"
                    onClick={dismissAll}
                    className="text-xs text-brand-white/40 hover:text-brand-white/70
                     transition-colors self-end cursor-pointer"
                >
                    Dismiss all ({activeNotifications.length})
                </button>
            )}
        </div>
    );
}

// ─── Floating Notification Overlay (fixed position) ───────────────────────────

export function NotificationOverlay() {
    const { activeNotifications, criticalCount, dismiss } = useEnergyNotifications();

    if (activeNotifications.length === 0) return null;

    // Show max 3 toasts in the overlay
    const visibleNotifications = activeNotifications.slice(0, 3);

    return (
        <div
            id="notification-overlay"
            className="fixed top-20 right-4 z-[90] flex flex-col gap-2 w-80"
            aria-label="Live energy alerts"
        >
            {criticalCount > 0 && <CriticalAlertBanner count={criticalCount} />}
            {visibleNotifications.map((n) => (
                <NotificationToast key={n.id} notification={n} onDismiss={dismiss} />
            ))}
        </div>
    );
}

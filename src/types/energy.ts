/**
 * CarbonX — Energy Monitoring TypeScript Interfaces
 * Task 5.1: Core data types for RX/TX architecture, energy loss, and machine health
 */

// ─── Core RX/TX Unit Types ───────────────────────────────────────────────────

/** Energy units received at the RX (Gateway) level */
export interface RXEnergyUnit {
    /** Unique gateway identifier (e.g. "RX-PLANT-01") */
    gatewayId: string;
    /** Human-readable display name */
    name: string;
    /** Total energy received at gateway in kWh */
    totalKwh: number;
    /** Total energy reading in kVARh (reactive) */
    totalKvarh: number;
    /** Voltage reading in Volts */
    voltage: number;
    /** Current reading in Amperes */
    current: number;
    /** Power factor (0–1) */
    powerFactor: number;
    /** ISO timestamp of this reading */
    timestamp: string;
    /** Array of child TX nodes connected to this gateway */
    txNodes: TXEnergyUnit[];
}

export type PhaseType = 'single' | 'three';

/** Energy units transmitted from a TX (Node/Machine) level */
export interface TXEnergyUnit {
    /** Unique node identifier (e.g. "TX-1") */
    nodeId: string;
    /** Human-readable machine name */
    name: string;
    /** Operational Zone (e.g. "Zone-A") */
    zone: string;
    /** Phase type (Single or Three Phase) */
    phaseType: PhaseType;
    /** Targeted or rated power in kW for health comparison */
    targetKw: number;
    /** Energy transmitted/consumed by this machine in kWh */
    kwh: number;
    /** Reactive energy in kVARh */
    kvarh: number;
    /** Current power draw in kW */
    currentKw: number;
    /** Phase voltages [L1, L2, L3] in Volts. For single phase, L2 and L3 are 0 */
    phaseVoltages: [number, number, number];
    /** Phase currents [L1, L2, L3] in Amperes. For single phase, L2 and L3 are 0 */
    phaseCurrents: [number, number, number];
    /** Power factor (0–1) */
    powerFactor: number;
    /** Machine operating temperature in °C */
    temperature: number;
    /** Vibration levels in mm/s (Velocity RMS) */
    vibration: number;
    /** Calculated PPM (Parts Per Million) for CO2/Gas */
    ppm: number;
    /** Calculated machine status based on activity */
    isOnline: boolean;
    /** ISO timestamp of this reading */
    timestamp: string;
}

// ─── Energy Loss Calculation Types ───────────────────────────────────────────

/**
 * Three-tier status system for energy loss:
 * - no-loss: Loss < 2% (acceptable operation)
 * - acceptable-loss: Loss 2–10% (normal losses, monitor)
 * - critical-loss: Loss > 10% (immediate intervention required)
 */
export type EnergyLossStatus = 'no-loss' | 'acceptable-loss' | 'critical-loss';

/** Detailed energy loss calculation result */
export interface EnergyLossResult {
    /** The RX gateway ID this calculation is for */
    gatewayId: string;
    /** Total energy received at RX level in kWh */
    rxTotalKwh: number;
    /** Sum of all TX node energy in kWh */
    txSumKwh: number;
    /** Raw energy loss in kWh (rxTotal - txSum) */
    lossKwh: number;
    /** Loss as percentage of RX total (0–100) */
    lossPercent: number;
    /** Classified status based on loss percentage */
    status: EnergyLossStatus;
    /** ISO timestamp of this calculation */
    calculatedAt: string;
    /** Map of nodeId → its share of total loss */
    nodeContributions: Record<string, number>;
}

// ─── AI Machine Health Score ─────────────────────────────────────────────────

/** Machine health score with contributing factors */
export interface MachineHealthScore {
    /** TX node identifier */
    nodeId: string;
    /** 0–100 health score */
    score: number;
    /** Status derived from score */
    status: MachineHealthStatus;
    /** Individual factor scores (all 0–100) */
    factors: {
        /** Power stability score */
        powerStability: number;
        /** Voltage balance score */
        voltageBalance: number;
        /** Power factor quality score */
        powerFactorScore: number;
        /** Temperature safety score */
        temperatureScore: number;
    };
    /** ISO timestamp */
    calculatedAt: string;
}

export type MachineHealthStatus = 'healthy' | 'warning' | 'critical';

// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationSeverity = 'info' | 'warning' | 'critical';

export interface EnergyNotification {
    id: string;
    severity: NotificationSeverity;
    title: string;
    message: string;
    gatewayId?: string;
    nodeId?: string;
    lossPercent?: number;
    timestamp: string;
    /** Has this notification been dismissed by the user */
    dismissed: boolean;
}

// ─── Real-time Data Stream Types ──────────────────────────────────────────────

export interface EnergyDataPoint {
    time: string;
    kwh: number;
    predicted: number;
}

export interface PlantOverview {
    totalKwh24h: number;
    totalCo2Kg: number;
    avgHealthScore: number;
    activeNodes: number;
    criticalAlerts: number;
    energyTrend: EnergyDataPoint[];
    rxGateways: RXEnergyUnit[];
}

// ─── Validation helpers ───────────────────────────────────────────────────────

export function isValidKwh(value: unknown): value is number {
    return typeof value === 'number' && isFinite(value) && value >= 0;
}

export function isValidPowerFactor(value: unknown): value is number {
    return typeof value === 'number' && value >= 0 && value <= 1;
}

export function isValidTemperature(value: unknown): value is number {
    return typeof value === 'number' && value >= -50 && value <= 500;
}

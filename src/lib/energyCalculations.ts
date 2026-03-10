/**
 * CarbonX — Energy Calculation Utilities
 * Task 5.3: RX vs TX comparison, 3-tier status logic, AI health score
 */

import type {
    RXEnergyUnit,
    TXEnergyUnit,
    EnergyLossResult,
    EnergyLossStatus,
    MachineHealthScore,
    MachineHealthStatus,
} from '@/types/energy';

// ─── Loss Threshold Constants ─────────────────────────────────────────────────

export const LOSS_THRESHOLDS = {
    /** Below this % → no-loss */
    NO_LOSS_MAX: 2,
    /** Below this % → acceptable-loss; above → critical-loss */
    ACCEPTABLE_LOSS_MAX: 10,
} as const;

// ─── Energy Loss Calculation ──────────────────────────────────────────────────

/**
 * Compares RX (gateway) energy with the sum of all connected TX (node) energy
 * and returns a detailed loss result.
 *
 * Task 5.3: Implements the 3-tier status logic:
 *   - no-loss:         lossPercent < 2%
 *   - acceptable-loss: 2% ≤ lossPercent ≤ 10%
 *   - critical-loss:   lossPercent > 10%
 */
export function calculateEnergyLoss(gateway: RXEnergyUnit): EnergyLossResult {
    const txSum = gateway.txNodes.reduce((acc, node) => acc + node.kwh, 0);
    const lossKwh = Math.max(0, gateway.totalKwh - txSum);
    const lossPercent = gateway.totalKwh > 0 ? (lossKwh / gateway.totalKwh) * 100 : 0;

    // Determine 3-tier status
    let status: EnergyLossStatus;
    if (lossPercent < LOSS_THRESHOLDS.NO_LOSS_MAX) {
        status = 'no-loss';
    } else if (lossPercent <= LOSS_THRESHOLDS.ACCEPTABLE_LOSS_MAX) {
        status = 'acceptable-loss';
    } else {
        status = 'critical-loss';
    }

    // Per-node contribution to total loss (proportional to their kWh)
    const nodeContributions: Record<string, number> = {};
    if (lossKwh > 0 && txSum > 0) {
        for (const node of gateway.txNodes) {
            // Each node's share = (its consumption / total TX sum) * total loss
            nodeContributions[node.nodeId] = (node.kwh / txSum) * lossKwh;
        }
    }

    return {
        gatewayId: gateway.gatewayId,
        rxTotalKwh: gateway.totalKwh,
        txSumKwh: txSum,
        lossKwh: parseFloat(lossKwh.toFixed(3)),
        lossPercent: parseFloat(lossPercent.toFixed(2)),
        status,
        calculatedAt: new Date().toISOString(),
        nodeContributions,
    };
}

/**
 * Batch calculate energy losses for multiple gateways.
 * Returns a map of gatewayId → EnergyLossResult.
 */
export function calculateAllGatewayLosses(
    gateways: RXEnergyUnit[]
): Map<string, EnergyLossResult> {
    const results = new Map<string, EnergyLossResult>();
    for (const gateway of gateways) {
        results.set(gateway.gatewayId, calculateEnergyLoss(gateway));
    }
    return results;
}

// ─── AI Machine Health Score ──────────────────────────────────────────────────

/** Ideal reference values for health calculation */
const HEALTH_REFS = {
    voltageNominal: 400,          // Volts (3-phase)
    voltageTolerancePct: 5,       // ±5% allowed
    minPowerFactor: 0.85,         // Minimum acceptable PF
    maxTemperature: 85,           // °C max safe operating temp
    criticalTemperature: 110,     // °C beyond this = critical
} as const;

/**
 * Calculates an AI machine health score (0–100) from TX node data.
 * Factors:
 *   1. Power stability  (25%) — how consistent current draw is vs. rated
 *   2. Voltage balance  (25%) — how balanced 3-phase voltages are
 *   3. Power factor     (25%) — quality of power factor
 *   4. Temperature      (25%) — operating temperature safety margin
 */
export function calculateMachineHealth(node: TXEnergyUnit): MachineHealthScore {
    // 1. Power stability: based on current kW vs. ideal draw
    //    Penalise if drawing 0 kW (idle/stalled) or above 20 kW threshold (example)
    const powerStability = node.currentKw > 0 ? Math.min(100, (node.currentKw / 20) * 100) : 10;

    // 2. Voltage balance: max deviation from nominal
    const avgV = node.phaseVoltages.reduce((a, b) => a + b, 0) / 3;
    const maxDeviation = Math.max(...node.phaseVoltages.map((v) => Math.abs(v - avgV)));
    const tolerancePct = (maxDeviation / HEALTH_REFS.voltageNominal) * 100;
    const voltageBalance = Math.max(0, 100 - tolerancePct * 10);

    // 3. Power factor score
    const pfScore =
        node.powerFactor >= HEALTH_REFS.minPowerFactor
            ? 100
            : (node.powerFactor / HEALTH_REFS.minPowerFactor) * 80;

    // 4. Temperature score
    let tempScore: number;
    if (node.temperature <= HEALTH_REFS.maxTemperature) {
        tempScore = 100;
    } else if (node.temperature >= HEALTH_REFS.criticalTemperature) {
        tempScore = 0;
    } else {
        const range = HEALTH_REFS.criticalTemperature - HEALTH_REFS.maxTemperature;
        const excess = node.temperature - HEALTH_REFS.maxTemperature;
        tempScore = Math.max(0, 100 - (excess / range) * 100);
    }

    // Weighted average
    const score = Math.round(
        powerStability * 0.25 +
        voltageBalance * 0.25 +
        pfScore * 0.25 +
        tempScore * 0.25
    );

    let status: MachineHealthStatus;
    if (score >= 70) status = 'healthy';
    else if (score >= 40) status = 'warning';
    else status = 'critical';

    return {
        nodeId: node.nodeId,
        score,
        status,
        factors: {
            powerStability: Math.round(powerStability),
            voltageBalance: Math.round(voltageBalance),
            powerFactorScore: Math.round(pfScore),
            temperatureScore: Math.round(tempScore),
        },
        calculatedAt: new Date().toISOString(),
    };
}

// ─── CO₂ Emissions Calculation ────────────────────────────────────────────────

/** Indian grid emission factor: ~0.82 kg CO₂/kWh (CEA 2023) */
export const INDIA_GRID_EMISSION_FACTOR = 0.82;

/**
 * Convert kWh → kg CO₂ using Indian grid emission factor
 */
export function kwhToCo2Kg(kwh: number, emissionFactor = INDIA_GRID_EMISSION_FACTOR): number {
    return parseFloat((kwh * emissionFactor).toFixed(3));
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export function getStatusColor(status: EnergyLossStatus | MachineHealthStatus): string {
    switch (status) {
        case 'no-loss':
        case 'healthy':
            return '#48A111';
        case 'acceptable-loss':
        case 'warning':
            return '#F2B50B';
        case 'critical-loss':
        case 'critical':
            return '#ef4444';
        default:
            return '#F7F0F0';
    }
}

export function getStatusLabel(status: EnergyLossStatus | MachineHealthStatus): string {
    switch (status) {
        case 'no-loss': return 'No Loss';
        case 'acceptable-loss': return 'Acceptable Loss';
        case 'critical-loss': return 'Critical Loss';
        case 'healthy': return 'Healthy';
        case 'warning': return 'Warning';
        case 'critical': return 'Critical';
        default: return 'Unknown';
    }
}

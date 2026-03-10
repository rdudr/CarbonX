'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Activity, Zap, Leaf, AlertTriangle,
  ArrowDownRight, ArrowUpRight, Download, Server, Factory,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { NotificationOverlay } from '@/components/NotificationSystem';
import { useEnergyNotifications } from '@/hooks/useEnergyNotifications';
import { calculateEnergyLoss, calculateMachineHealth, kwhToCo2Kg, getStatusColor } from '@/lib/energyCalculations';
import { debounce } from '@/lib/debounce';
import type { RXEnergyUnit } from '@/types/energy';

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const COLORS = ['#48A111', '#25671E', '#F2B50B', '#2a9d8f'];

// ─── Mock RX Gateway Data (simulates Firebase real-time data) ────────────────
function generateMockGateway(tick: number): RXEnergyUnit {
  const jitter = () => (Math.random() - 0.5) * 2;
  return {
    gatewayId: 'RX-PLANT-01',
    name: 'Main Plant Gateway',
    totalKwh: 2450 + jitter() * 20,
    totalKvarh: 890 + jitter() * 10,
    voltage: 400 + jitter() * 5,
    current: 125 + jitter() * 3,
    powerFactor: 0.91 + jitter() * 0.03,
    timestamp: new Date().toISOString(),
    txNodes: [
      {
        nodeId: 'TX-1', name: 'CNC Machine A',
        kwh: 600 + jitter() * 10, kvarh: 180,
        currentKw: 12.4 + jitter(), phaseVoltages: [399, 401, 400], phaseCurrents: [18, 19, 18],
        powerFactor: 0.95, temperature: 62 + jitter() * 2, timestamp: new Date().toISOString(),
      },
      {
        nodeId: 'TX-2', name: 'Lathe B',
        kwh: 480 + jitter() * 8, kvarh: 140,
        currentKw: 8.2 + jitter(), phaseVoltages: [398, 402, 400], phaseCurrents: [13, 13, 12],
        powerFactor: 0.93, temperature: 55 + jitter() * 2, timestamp: new Date().toISOString(),
      },
      {
        nodeId: 'TX-3', name: 'Compressor Array',
        kwh: 820 + jitter() * 15 + (tick % 10 < 3 ? 200 : 0), kvarh: 310,
        currentKw: 45.1 + jitter() * 2, phaseVoltages: [395, 405, 401], phaseCurrents: [68, 70, 67],
        powerFactor: 0.82, temperature: 88 + jitter() * 3, timestamp: new Date().toISOString(),
      },
      {
        nodeId: 'TX-4', name: 'HVAC System',
        kwh: 420 + jitter() * 8, kvarh: 200,
        currentKw: 64.8 + jitter() * 3, phaseVoltages: [390, 398, 395], phaseCurrents: [98, 100, 97],
        powerFactor: 0.78, temperature: 95 + jitter() * 5, timestamp: new Date().toISOString(),
      },
    ],
  };
}

// ─── Energy Trend (historical + real) ─────────────────────────────────────────
const historicalTrend = [
  { time: '00:00', kwh: 120, predicted: 125 },
  { time: '04:00', kwh: 110, predicted: 115 },
  { time: '08:00', kwh: 350, predicted: 340 },
  { time: '12:00', kwh: 480, predicted: 490 },
  { time: '16:00', kwh: 520, predicted: 510 },
  { time: '20:00', kwh: 310, predicted: 300 },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [gateway, setGateway] = useState<RXEnergyUnit | null>(null);
  const [tick, setTick] = useState(0);
  const { addNotification } = useEnergyNotifications();

  // Debounced energy loss checker (Task 6.1 — 500ms debounce)
  const debouncedLossCheck = useRef(
    debounce((gw: RXEnergyUnit) => {
      const lossResult = calculateEnergyLoss(gw);
      if (lossResult.status === 'critical-loss') {
        addNotification({
          severity: 'critical',
          title: '⚡ Critical Energy Loss Detected',
          message: `Gateway ${gw.gatewayId}: ${lossResult.lossPercent.toFixed(1)}% loss (${lossResult.lossKwh.toFixed(1)} kWh unaccounted)`,
          gatewayId: gw.gatewayId,
          lossPercent: lossResult.lossPercent,
        });
      } else if (lossResult.status === 'acceptable-loss') {
        addNotification({
          severity: 'warning',
          title: 'Energy Loss Warning',
          message: `Gateway ${gw.gatewayId}: ${lossResult.lossPercent.toFixed(1)}% loss detected. Monitor closely.`,
          gatewayId: gw.gatewayId,
          lossPercent: lossResult.lossPercent,
        });
      }
    }, 500)
  ).current;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time data polling (Task 9.2 — simulates Firebase listener)
  useEffect(() => {
    if (!mounted) return;

    const poll = () => {
      setTick((t) => {
        const newTick = t + 1;
        const newGateway = generateMockGateway(newTick);
        setGateway(newGateway);
        debouncedLossCheck(newGateway);
        return newTick;
      });
    };

    poll(); // Initial load
    const interval = setInterval(poll, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [mounted, debouncedLossCheck]);

  if (!mounted || !gateway) return (
    <div className="flex items-center justify-center h-96 fade-in">
      <div className="flex flex-col items-center gap-4 text-brand-white/50">
        <div className="w-12 h-12 rounded-full border-2 border-brand-green-light/40 border-t-brand-green-light animate-spin" />
        <span className="text-sm">Initializing CarbonX...</span>
      </div>
    </div>
  );

  // Derived calculations
  const lossResult = calculateEnergyLoss(gateway);
  const machineHealthScores = gateway.txNodes.map(calculateMachineHealth);
  const avgHealth = Math.round(machineHealthScores.reduce((a, b) => a + b.score, 0) / machineHealthScores.length);
  const totalCo2 = kwhToCo2Kg(gateway.totalKwh);

  const pieData = gateway.txNodes.map((n) => ({ name: n.nodeId, value: Math.round(n.kwh) }));
  const trendData = [
    ...historicalTrend,
    { time: 'Now', kwh: Math.round(gateway.totalKwh / 10), predicted: 285 },
  ];

  const lossStatusColor = getStatusColor(lossResult.status);

  return (
    <div className="space-y-6 pb-4 fade-in">
      {/* Notification Overlay */}
      <NotificationOverlay />

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 glass rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-green-light/20 flex items-center justify-center border border-brand-green-light/30">
            <Zap className="text-brand-green-light" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-white flex items-center gap-2">
              CarbonX
            </h1>
            <p className="text-brand-white/70 mt-1 text-sm">
              RX Gateway: {gateway.name} • AI Health &amp; Energy Platform
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3 flex-wrap">
          <Badge variant="outline" className="bg-brand-green-dark/50 border-brand-green-light text-brand-green-light px-4 py-1 text-sm">
            <span className="w-2 h-2 rounded-full bg-brand-green-light animate-pulse mr-2 inline-block" />
            System Online
          </Badge>
          <Badge variant="outline" className="bg-brand-yellow/10 border-brand-yellow text-brand-yellow px-4 py-1 text-sm">
            AI Active
          </Badge>
          <Badge
            variant="outline"
            className="px-4 py-1 text-sm"
            style={{ borderColor: lossStatusColor + '60', color: lossStatusColor, background: lossStatusColor + '15' }}
          >
            Loss: {lossResult.lossPercent.toFixed(1)}% · {lossResult.status.replace('-', ' ')}
          </Badge>
        </div>
      </div>

      {/* ─── Top Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Energy */}
        <Card className="glass border-brand-green-light/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Zap size={72} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-brand-white/80 text-xs font-medium uppercase tracking-wide">RX Total Energy (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-white">
              {gateway.totalKwh.toFixed(0)} <span className="text-lg text-brand-white/50">kWh</span>
            </div>
            <div className="flex items-center text-brand-green-light mt-2 text-xs font-medium">
              <ArrowDownRight size={14} className="mr-1" /> -12.5% vs yesterday
            </div>
          </CardContent>
        </Card>

        {/* CO₂ Emissions */}
        <Card className="glass border-brand-green-light/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Leaf size={72} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-brand-white/80 text-xs font-medium uppercase tracking-wide">Carbon Emission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-white">
              {totalCo2.toFixed(0)} <span className="text-lg text-brand-white/50">kg CO₂</span>
            </div>
            <div className="flex items-center text-brand-yellow mt-2 text-xs font-medium">
              <AlertTriangle size={14} className="mr-1" /> +2.1% deviation
            </div>
          </CardContent>
        </Card>

        {/* Energy Loss */}
        <Card className="glass border-brand-green-light/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Factory size={72} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-brand-white/80 text-xs font-medium uppercase tracking-wide">Energy Loss (RX-TX)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: lossStatusColor }}>
              {lossResult.lossPercent.toFixed(1)}<span className="text-lg text-brand-white/50">%</span>
            </div>
            <div className="text-xs mt-2 font-medium" style={{ color: lossStatusColor }}>
              {lossResult.lossKwh.toFixed(1)} kWh unaccounted · {lossResult.status.replace('-', ' ')}
            </div>
          </CardContent>
        </Card>

        {/* Avg Health */}
        <Card className="glass border-brand-green-light/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity size={72} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-brand-white/80 text-xs font-medium uppercase tracking-wide">Avg Plant Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-white">
              {avgHealth}<span className="text-lg text-brand-white/50">/100</span>
            </div>
            <Progress value={avgHealth} className="h-2 mt-3 bg-brand-green-dark" />
            <div className="text-brand-green-light mt-2 text-xs">
              {avgHealth >= 70 ? 'Healthy' : avgHealth >= 40 ? 'Warning' : 'Critical'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Charts Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Forecast */}
        <Card className="glass border-brand-green-light/20">
          <CardHeader>
            <CardTitle className="text-brand-white flex items-center gap-2">
              <Activity className="text-brand-green-light" size={20} />
              AI Energy Forecast (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="time" stroke="#ffffff50" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#ffffff50" tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#25671E', borderColor: '#48A111', color: '#F7F0F0', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#F7F0F0' }}
                  />
                  <Line type="monotone" dataKey="kwh" stroke="#48A111" strokeWidth={3} dot={{ r: 4, fill: '#48A111' }} name="Actual kWh" />
                  <Line type="monotone" dataKey="predicted" stroke="#F2B50B" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted kWh" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* TX Distribution */}
        <Card className="glass border-brand-green-light/20">
          <CardHeader>
            <CardTitle className="text-brand-white flex items-center gap-2">
              <Server className="text-brand-green-light" size={20} />
              TX Node Energy Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6 h-[280px]">
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#25671E', borderColor: '#48A111', color: '#F7F0F0', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 flex flex-col gap-3">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-brand-white/80 text-xs">{item.name}</span>
                  </div>
                  <span className="text-brand-white font-medium text-xs">{item.value} kWh</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── TX Node Health Cards ─────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-semibold text-brand-white mb-4 flex items-center gap-2">
          <Activity size={20} className="text-brand-green-light" />
          TX Node Health Monitor
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gateway.txNodes.map((node, idx) => {
            const health = machineHealthScores[idx];
            const statusColor = getStatusColor(health.status);
            return (
              <Card
                key={node.nodeId}
                id={`machine-card-${node.nodeId.toLowerCase()}`}
                className="glass-light backdrop-blur-md border border-white/20 hover:scale-[1.02] transition-all duration-300"
              >
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-brand-green-dark text-base font-bold">{node.nodeId}</CardTitle>
                    <p className="text-brand-green-dark/70 text-xs font-medium mt-0.5">{node.name}</p>
                  </div>
                  <Activity style={{ color: statusColor }} size={22} />
                </CardHeader>
                <CardContent>
                  <div className="my-3">
                    <div className="flex justify-between text-xs mb-1 font-semibold text-brand-green-dark">
                      <span>Health Score</span>
                      <span style={{ color: statusColor }}>{health.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-brand-green-dark/20 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${health.score}%`, backgroundColor: statusColor }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-brand-green-dark/70 mt-3">
                    <div>
                      <div className="text-xs font-semibold mb-0.5">Power</div>
                      <div className="font-bold text-brand-green-dark">{node.currentKw.toFixed(1)} kW</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold mb-0.5">Temp</div>
                      <div className="font-bold" style={{ color: node.temperature > 85 ? '#ef4444' : '#25671E' }}>
                        {node.temperature.toFixed(0)}°C
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold mb-0.5">PF</div>
                      <div className="font-bold text-brand-green-dark">{node.powerFactor.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold mb-0.5">Status</div>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                        style={{ borderColor: statusColor + '80', color: statusColor }}
                      >
                        {health.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ─── Report & Export ─────────────────────────────────────────────────── */}
      <div className="glass p-6 rounded-2xl border border-brand-green-light/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-brand-white">Report &amp; Dataset Generator</h3>
          <p className="text-brand-white/70 text-sm mt-1">
            Export AI-ready telemetry data or download machine health PDF metrics.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="/api/export?type=pdf" id="export-pdf-btn" className="inline-block">
            <Button variant="outline" className="bg-brand-white text-brand-green-dark hover:bg-brand-white/90 border-transparent font-semibold shadow-xl cursor-pointer">
              <Download size={16} className="mr-2" />
              Machine Report (PDF)
            </Button>
          </a>
          <a href="/api/export?type=csv" id="export-csv-btn" className="inline-block">
            <Button className="bg-brand-green-light text-brand-white hover:bg-brand-green-light/80 font-semibold shadow-xl border-transparent cursor-pointer">
              <Download size={16} className="mr-2" />
              AI Dataset (CSV)
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

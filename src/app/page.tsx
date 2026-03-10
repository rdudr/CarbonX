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

// ─── PowerByte Chart Colors ───────────────────────────────────────────────────
const COLORS = ['#10b981', '#fb923c', '#3b82f6', '#facc15'];

// ─── Mock RX Gateway Data ─────────────────────────────────────────────────────
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

const historicalTrend = [
  { time: '00:00', kwh: 120, predicted: 125 },
  { time: '04:00', kwh: 110, predicted: 115 },
  { time: '08:00', kwh: 350, predicted: 340 },
  { time: '12:00', kwh: 480, predicted: 490 },
  { time: '16:00', kwh: 520, predicted: 510 },
  { time: '20:00', kwh: 310, predicted: 300 },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [gateway, setGateway] = useState<RXEnergyUnit | null>(null);
  const [tick, setTick] = useState(0);
  const { addNotification } = useEnergyNotifications();

  const debouncedLossCheck = useRef(
    debounce((gw: RXEnergyUnit) => {
      const lossResult = calculateEnergyLoss(gw);
      if (lossResult.status === 'critical-loss') {
        addNotification({
          severity: 'critical',
          title: '⚡ Critical Energy Loss',
          message: `${gw.name}: ${lossResult.lossPercent.toFixed(1)}% loss detected.`,
          gatewayId: gw.gatewayId,
          lossPercent: lossResult.lossPercent,
        });
      }
    }, 500)
  ).current;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const poll = () => {
      setTick((t) => {
        const newGateway = generateMockGateway(t + 1);
        setGateway(newGateway);
        debouncedLossCheck(newGateway);
        return t + 1;
      });
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [mounted, debouncedLossCheck]);

  if (!mounted || !gateway) return <div className="p-20 text-center">Loading CarbonX...</div>;

  const lossResult = calculateEnergyLoss(gateway);
  const totalCo2 = kwhToCo2Kg(gateway.totalKwh);
  const trendData = [...historicalTrend, { time: 'Now', kwh: Math.round(gateway.totalKwh / 10), predicted: 285 }];
  const pieData = gateway.txNodes.map((n) => ({ name: n.nodeId, value: Math.round(n.kwh) }));

  return (
    <div className="space-y-6 pb-10 fade-in px-4 md:px-0">
      <NotificationOverlay />

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 glass rounded-4xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-green-light/10 flex items-center justify-center border border-brand-green-light/20 shadow-inner">
            <Image src="/logo.png" alt="CarbonX Logo" width={40} height={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-green-dark">Industrial Dashboard</h1>
            <p className="text-brand-green-dark/60 text-sm font-medium">Plant Gateway: {gateway.name}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Badge variant="outline" className="bg-brand-green-light/10 border-brand-green-light/20 text-brand-green-light px-4 py-1.5 rounded-full font-bold">
            <span className="w-2 h-2 rounded-full bg-brand-green-light animate-pulse mr-2" />
            LIVE
          </Badge>
          <Badge variant="outline" className="bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
            AI Active
          </Badge>
        </div>
      </div>

      {/* ─── Summary Stats (PowerByte Cards) ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card theme-mint shine-hover cursor-pointer border-none shadow-sm h-full">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
                <Zap className="text-emerald-700" size={20} />
              </div>
              <ArrowUpRight className="text-emerald-700/40" size={18} />
            </div>
            <div className="text-sm font-bold text-emerald-900/60 uppercase tracking-wider mb-1">RX Energy</div>
            <div className="text-3xl font-black text-emerald-900">{gateway.totalKwh.toFixed(0)} <span className="text-lg font-bold opacity-40">kWh</span></div>
            <div className="text-xs font-bold text-emerald-700/70 mt-3 p-1 px-2 bg-white/30 rounded-full inline-block">Real-time Telemetry</div>
          </CardContent>
        </Card>

        <Card className="glass-card theme-peach shine-hover cursor-pointer border-none shadow-sm h-full">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
                <Leaf className="text-orange-700" size={20} />
              </div>
              <Activity className="text-orange-700/40" size={18} />
            </div>
            <div className="text-sm font-bold text-orange-900/60 uppercase tracking-wider mb-1">CO2 Footprint</div>
            <div className="text-3xl font-black text-orange-900">{totalCo2.toFixed(0)} <span className="text-lg font-bold opacity-40">kg</span></div>
            <div className="text-xs font-bold text-orange-700/70 mt-3 p-1 px-2 bg-white/30 rounded-full inline-block">AI Projected</div>
          </CardContent>
        </Card>

        <Card className="glass-card theme-blue shine-hover cursor-pointer border-none shadow-sm h-full">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
                <Factory className="text-blue-700" size={20} />
              </div>
              <Download className="text-blue-700/40" size={18} />
            </div>
            <div className="text-sm font-bold text-blue-900/60 uppercase tracking-wider mb-1">Plant Health</div>
            <div className="text-3xl font-black text-blue-900">92 <span className="text-lg font-bold opacity-40">/100</span></div>
            <Progress value={92} className="h-2 mt-4 bg-blue-900/10" />
          </CardContent>
        </Card>

        <Card className="glass-card theme-yellow shine-hover cursor-pointer border-none shadow-sm h-full">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
                <AlertTriangle className="text-yellow-700" size={20} />
              </div>
              <ArrowDownRight className="text-yellow-700/40" size={18} />
            </div>
            <div className="text-sm font-bold text-yellow-900/60 uppercase tracking-wider mb-1">Energy Loss</div>
            <div className="text-3xl font-black text-yellow-900">{lossResult.lossPercent.toFixed(1)} <span className="text-lg font-bold opacity-40">%</span></div>
            <div className="text-xs font-bold text-yellow-700 mt-3 flex items-center gap-1">
              {lossResult.lossKwh.toFixed(1)} kWh unmonitored
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Charts Row (PowerByte Style) ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-brand-green-dark text-lg font-bold flex items-center gap-2">
              <div className="w-1.5 h-6 bg-brand-green-light rounded-full" />
              Power Consumption Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11, fontWeight: 'bold' }} axisLine={false} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 11, fontWeight: 'bold' }} axisLine={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="kwh" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} name="Actual kWh" />
                  <Line type="monotone" dataKey="predicted" stroke="#facc15" strokeWidth={2} strokeDasharray="5 5" dot={false} name="AI Pred." />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-brand-green-dark text-lg font-bold flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
              Active Node Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6 h-[280px]">
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 flex flex-col gap-3">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-brand-green-dark/70 text-xs font-bold">{item.name}</span>
                  </div>
                  <span className="text-brand-green-dark font-black text-xs">{item.value} kWh</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Machine Grid ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-brand-green-dark flex items-center gap-3">
          <Server size={22} />
          Node Health Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gateway.txNodes.map((node, idx) => {
            const health = calculateMachineHealth(node);
            const statusColor = getStatusColor(health.status);
            const cardThemes = ['theme-mint', 'theme-peach', 'theme-blue', 'theme-yellow'];
            return (
              <Card key={node.nodeId} className={cn("glass-card border-none shadow-sm shine-hover", cardThemes[idx % 4])}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-brand-green-dark text-lg font-black">{node.nodeId}</CardTitle>
                      <span className="text-[10px] font-bold text-brand-green-dark/40 uppercase">{node.name}</span>
                    </div>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mt-2 mb-4">
                    <div className="flex justify-between text-[10px] font-black text-brand-green-dark/60 uppercase mb-1">
                      <span>Health Score</span>
                      <span style={{ color: statusColor }}>{health.score}%</span>
                    </div>
                    <Progress value={health.score} className="h-1.5 bg-black/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="p-2 bg-white/40 rounded-xl">
                      <div className="text-[8px] font-bold opacity-50 uppercase">Power</div>
                      <div className="font-black text-xs">{node.currentKw.toFixed(1)} kW</div>
                    </div>
                    <div className="p-2 bg-white/40 rounded-xl">
                      <div className="text-[8px] font-bold opacity-50 uppercase">Temp</div>
                      <div className="font-black text-xs">{node.temperature.toFixed(0)}°C</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

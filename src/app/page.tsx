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
import { cn } from '@/lib/utils';
import { useSystem } from '@/context/SystemContext';
import type { RXEnergyUnit, TXEnergyUnit } from '@/types/energy';

const COLORS = ['#10b981', '#fb923c', '#3b82f6', '#facc15'];

function generateMockGateway(tick: number, nodeConfigs: any[]): RXEnergyUnit {
  const jitter = () => (Math.random() - 0.5) * 2;
  const txNodes: TXEnergyUnit[] = nodeConfigs.map(config => {
    const baseKwh = (config.id === 'TX-1') ? 600 : (config.id === 'TX-2') ? 480 : (config.id === 'TX-3') ? 820 : 420;
    const currentKw = (config.id === 'TX-1') ? 12.4 : (config.id === 'TX-2') ? 8.2 : (config.id === 'TX-3') ? 45.1 : 64.8;

    const isThreePhase = config.phaseType === 'three';
    const phaseVoltages: [number, number, number] = isThreePhase ? [400 + jitter(), 402 + jitter(), 398 + jitter()] : [230 + jitter(), 0, 0];
    const phaseCurrents: [number, number, number] = isThreePhase ? [18 + jitter(), 17 + jitter(), 19 + jitter()] : [25 + jitter(), 0, 0];

    return {
      nodeId: config.id,
      name: config.name,
      phaseType: config.phaseType,
      targetKw: config.targetKw,
      kwh: baseKwh + jitter() * 10,
      kvarh: 180 + jitter() * 5,
      currentKw: currentKw + jitter(),
      phaseVoltages,
      phaseCurrents,
      powerFactor: 0.92 + jitter() * 0.05,
      temperature: 60 + jitter() * 5,
      timestamp: new Date().toISOString(),
    };
  });

  return {
    gatewayId: 'RX-PLANT-01',
    name: 'Main Plant Gateway',
    totalKwh: txNodes.reduce((acc, n) => acc + n.kwh, 0) * 1.05 + jitter() * 10, // Simulate a small line loss
    totalKvarh: 890 + jitter() * 10,
    voltage: 400 + jitter() * 5,
    current: 125 + jitter() * 3,
    powerFactor: 0.91 + jitter() * 0.03,
    timestamp: new Date().toISOString(),
    txNodes,
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
  const { config } = useSystem();

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
        const newGateway = generateMockGateway(t, config.nodes);
        setGateway(newGateway);
        debouncedLossCheck(newGateway);
        return t + 1;
      });
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [mounted, debouncedLossCheck, config.nodes]);

  if (!mounted || !gateway) return <div className="p-20 text-center">Loading CarbonX Dashboard...</div>;

  const lossResult = calculateEnergyLoss(gateway);
  const totalCo2 = kwhToCo2Kg(gateway.totalKwh);
  const trendData = [...historicalTrend, { time: 'Now', kwh: Math.round(gateway.totalKwh / 10), predicted: 285 }];
  const pieData = gateway.txNodes.map((n) => ({ name: n.nodeId, value: Math.round(n.kwh) }));

  return (
    <div className="space-y-6 pb-10 fade-in px-4 md:px-0">
      <NotificationOverlay />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 glass rounded-4xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-green-light/10 flex items-center justify-center border border-brand-green-light/20">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-green-dark">Industrial Dashboard</h1>
            <p className="text-brand-green-dark/60 text-sm font-medium">Gateway: {gateway.name}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Badge variant="outline" className="bg-brand-green-light/10 border-brand-green-light/20 text-brand-green-light px-4 py-1.5 rounded-full font-bold">
            <span className="w-2 h-2 rounded-full bg-brand-green-light animate-pulse mr-2" />
            LIVE
          </Badge>
          <Badge variant="outline" className="bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow px-4 py-1.5 rounded-full font-bold uppercase">
            AI Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card theme-mint shine-hover border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
                <Zap className="text-emerald-700" size={20} />
              </div>
              <ArrowUpRight className="text-emerald-700/40" size={18} />
            </div>
            <div className="text-xs font-black text-emerald-900/40 uppercase mb-1">RX Energy</div>
            <div className="text-3xl font-black text-emerald-900">{gateway.totalKwh.toFixed(0)} <span className="text-lg opacity-40">kWh</span></div>
            <div className="text-[10px] font-black text-emerald-700/50 mt-4 bg-white/30 px-2 py-1 rounded-full w-fit">Reading RX</div>
          </CardContent>
        </Card>

        <Card className="glass-card theme-peach shine-hover border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
                <Leaf className="text-orange-700" size={20} />
              </div>
              <Activity className="text-orange-700/40" size={18} />
            </div>
            <div className="text-xs font-black text-orange-900/40 uppercase mb-1">CO2 Footprint</div>
            <div className="text-3xl font-black text-orange-900">{totalCo2.toFixed(0)} <span className="text-lg opacity-40">kg</span></div>
            <div className="text-[10px] font-black text-orange-700/50 mt-4 bg-white/30 px-2 py-1 rounded-full w-fit">Live Tracking</div>
          </CardContent>
        </Card>

        <Card className="glass-card theme-blue shine-hover border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
                <Server className="text-blue-700" size={20} />
              </div>
              <Download className="text-blue-700/40" size={18} />
            </div>
            <div className="text-xs font-black text-blue-900/40 uppercase mb-1">Plant Stability</div>
            <div className="text-3xl font-black text-blue-900">92 <span className="text-lg opacity-40">/100</span></div>
            <Progress value={92} className="h-1.5 mt-5 bg-blue-900/10" />
          </CardContent>
        </Card>

        <Card className="glass-card theme-yellow shine-hover border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
                <AlertTriangle className="text-yellow-700" size={20} />
              </div>
              <ArrowDownRight className="text-yellow-700/40" size={18} />
            </div>
            <div className="text-xs font-black text-yellow-900/40 uppercase mb-1">Loss Status</div>
            <div className="text-3xl font-black text-yellow-900">{lossResult.lossPercent.toFixed(1)} <span className="text-lg opacity-40">%</span></div>
            <div className="text-[10px] font-black text-yellow-700 mt-4">Threshold: {config.lossThreshold}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-brand-green-dark text-lg font-bold">Power Consumption Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11, fontWeight: 'bold' }} axisLine={false} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11, fontWeight: 'bold' }} axisLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="kwh" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} />
                <Line type="monotone" dataKey="predicted" stroke="#facc15" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-brand-green-dark text-lg font-bold">Node Energy Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] flex items-center">
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                  {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-bold">
                  <span className="text-brand-green-dark opacity-60">{item.name}</span>
                  <span className="text-brand-green-dark">{item.value} kWh</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gateway.txNodes.map((node, idx) => {
          const health = calculateMachineHealth(node);
          const color = getStatusColor(health.status);
          const themes = ['theme-mint', 'theme-peach', 'theme-blue', 'theme-yellow'];
          return (
            <Card key={node.nodeId} className={cn("glass-card shine-hover", themes[idx % 4])}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-lg font-black text-brand-green-dark">{node.nodeId}</div>
                    <Badge variant="outline" className="text-[8px] h-4 bg-white/20 border-white/40 uppercase">
                      {node.phaseType} Phase
                    </Badge>
                  </div>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className="text-brand-green-dark/60">AI HEALTH</span>
                    <span style={{ color }}>{health.score}%</span>
                  </div>
                  <Progress value={health.score} className="h-1 bg-black/5" />
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-black">
                    <div className="bg-white/30 p-2 rounded-lg">
                      <div className="opacity-40">LOAD</div>
                      <div>{node.currentKw.toFixed(1)} kW</div>
                    </div>
                    <div className="bg-white/30 p-2 rounded-lg">
                      <div className="opacity-40">LIMIT</div>
                      <div>{node.targetKw} kW</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

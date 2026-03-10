"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Activity, Zap, Factory, Leaf, AlertTriangle, ArrowUpRight, ArrowDownRight, Download, Server } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// Mock Data
const energyTrendData = [
  { time: '00:00', kwh: 120, predicted: 125 },
  { time: '04:00', kwh: 110, predicted: 115 },
  { time: '08:00', kwh: 350, predicted: 340 },
  { time: '12:00', kwh: 480, predicted: 490 },
  { time: '16:00', kwh: 520, predicted: 510 },
  { time: '20:00', kwh: 310, predicted: 300 },
  { time: '24:00', kwh: 150, predicted: 160 },
];

const machineEnergyDistribution = [
  { name: 'TX-1 (CNC A)', value: 400 },
  { name: 'TX-2 (Lathe B)', value: 300 },
  { name: 'TX-3 (Compressor)', value: 600 },
  { name: 'TX-4 (HVAC)', value: 800 },
];
const COLORS = ['#48A111', '#25671E', '#F2B50B', '#2a9d8f'];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-20 fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 glass rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="CarbonX Logo" width={60} height={60} className="object-contain" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-white flex items-center gap-2">
              CarbonX PowerByte
            </h1>
            <p className="text-brand-white/70 mt-1">RX Gateway: Main Plant Meter • AI Health & Energy Platform</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <Badge variant="outline" className="bg-brand-green-dark/50 border-brand-green-light text-brand-green-light px-4 py-1 text-sm">
            <span className="w-2 h-2 rounded-full bg-brand-green-light animate-pulse mr-2 inline-block"></span>
            System Online
          </Badge>
          <Badge variant="outline" className="bg-brand-yellow/10 border-brand-yellow text-brand-yellow px-4 py-1 text-sm">
            AI Active
          </Badge>
        </div>
      </div>

      {/* Top Level RX Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Plant Energy */}
        <Card className="glass border-brand-green-light/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Zap size={80} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-brand-white/80 text-sm font-medium">RX Total Energy (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-brand-white">2,450 <span className="text-xl text-brand-white/50">kWh</span></div>
            <div className="flex items-center text-brand-green-light mt-2 text-sm font-medium">
              <ArrowDownRight size={16} className="mr-1" />
              -12.5% vs yesterday
            </div>
          </CardContent>
        </Card>

        {/* Total Carbon Emission */}
        <Card className="glass border-brand-green-light/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Leaf size={80} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-brand-white/80 text-sm font-medium">Total Carbon Emission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-brand-white">2,009 <span className="text-xl text-brand-white/50">kg CO₂</span></div>
            <div className="flex items-center text-brand-yellow mt-2 text-sm font-medium">
              <AlertTriangle size={16} className="mr-1" />
              +2.1% deviation detected
            </div>
          </CardContent>
        </Card>

        {/* Plant AI Health Score */}
        <Card className="glass border-brand-green-light/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity size={80} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-brand-white/80 text-sm font-medium">Avg Plant Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-brand-white">88<span className="text-xl text-brand-white/50">/100</span></div>
            <Progress value={88} className="h-2 mt-3 bg-brand-green-dark" />
            <div className="text-brand-green-light mt-2 text-sm">Status: Healthy</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Forecast Trend */}
        <Card className="glass border-brand-green-light/20">
          <CardHeader>
            <CardTitle className="text-brand-white flex items-center gap-2">
              <Activity className="text-brand-green-light" size={20} />
              AI Energy Forecast (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="time" stroke="#ffffff50" />
                  <YAxis stroke="#ffffff50" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#25671E', borderColor: '#48A111', color: '#F7F0F0' }}
                    itemStyle={{ color: '#F7F0F0' }}
                  />
                  <Line type="monotone" dataKey="kwh" stroke="#48A111" strokeWidth={3} dot={{ r: 4 }} name="Actual kWh" />
                  <Line type="monotone" dataKey="predicted" stroke="#F2B50B" strokeWidth={2} strokeDasharray="5 5" name="Predicted kWh" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Machine Distribution */}
        <Card className="glass border-brand-green-light/20">
          <CardHeader>
            <CardTitle className="text-brand-white flex items-center gap-2">
              <Server className="text-brand-green-light" size={20} />
              TX Node Energy Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={machineEnergyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {machineEnergyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#25671E', borderColor: '#48A111', color: '#F7F0F0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full flex-shrink-0 flex flex-col gap-3">
              {machineEnergyDistribution.map((machine, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx]}}></div>
                    <span className="text-brand-white/80">{machine.name}</span>
                  </div>
                  <span className="text-brand-white font-medium">{machine.value} kWh</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machine Health Panel Grid */}
      <h2 className="text-2xl font-semibold text-brand-white mt-8 mb-4">TX Node Health Monitory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: 'TX-1', name: 'CNC Machine A', power: '12.4 kW', health: 95, status: 'Healthy', color: 'bg-brand-green-light' },
          { id: 'TX-2', name: 'Lathe B', power: '8.2 kW', health: 88, status: 'Healthy', color: 'bg-brand-green-light' },
          { id: 'TX-3', name: 'Compressor Array', power: '45.1 kW', health: 62, status: 'Warning', color: 'bg-brand-yellow' },
          { id: 'TX-4', name: 'HVAC System', power: '64.8 kW', health: 35, status: 'Critical', color: 'bg-red-500' },
        ].map((machine) => (
          <Card key={machine.id} className="glass-light backdrop-blur-md border border-white/20 hover:scale-[1.02] transition-transform">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-brand-green-dark text-lg font-bold">{machine.id}</CardTitle>
                <p className="text-brand-green-dark/70 text-xs font-medium">{machine.name}</p>
              </div>
              <Activity className={`${machine.health < 40 ? 'text-red-500' : machine.health < 70 ? 'text-brand-yellow' : 'text-brand-green-light'}`} size={24} />
            </CardHeader>
            <CardContent>
               <div className="my-4">
                  <div className="flex justify-between text-sm mb-1 font-semibold text-brand-green-dark">
                    <span>Health Score</span>
                    <span>{machine.health}%</span>
                  </div>
                  <Progress value={machine.health} className={`h-2 [&>div]:${machine.color}`} />
               </div>
               <div className="flex justify-between items-end mt-4">
                  <div>
                    <div className="text-xs text-brand-green-dark/70 font-semibold mb-1">Current Power</div>
                    <div className="text-xl font-bold text-brand-green-dark">{machine.power}</div>
                  </div>
                  <Badge variant="outline" className={`${machine.health < 40 ? 'border-red-500 text-red-600' : machine.health < 70 ? 'border-brand-yellow text-yellow-700' : 'border-brand-green-light text-brand-green-dark'} bg-white/50 backdrop-blur-sm`}>
                    {machine.status}
                  </Badge>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

       {/* Download Center */}
       <div className="mt-8 glass p-6 rounded-2xl border border-brand-green-light/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-brand-white">Report & Dataset Generator</h3>
            <p className="text-brand-white/70 text-sm mt-1">Export AI-ready telemetry data or download machine health PDF metrics.</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <a href="/api/export?type=pdf" className="inline-block">
               <Button variant="outline" className="bg-brand-white text-brand-green-dark hover:bg-brand-white/90 border-transparent font-semibold shadow-xl cursor-pointer">
                 <Download size={16} className="mr-2" />
                 Machine Report (PDF)
               </Button>
             </a>
             <a href="/api/export?type=csv" className="inline-block">
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

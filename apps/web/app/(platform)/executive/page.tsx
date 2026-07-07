'use client';

import React, { useEffect, useState } from 'react';
import { useDemoStore } from '@/stores/demoStore';
import { DEMO_ANALYTICS, DEMO_CUSTOMERS } from '@/services/DEMO_DATA';
import {
  TrendingUp, Users, Target, Percent, Briefcase,
  AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight,
  RefreshCw, ArrowUpRight, Layers
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, BarChart, Bar, Cell
} from 'recharts';
import Link from 'next/link';

const formatINR = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const STAGE_COLORS = ['#16263A', '#F4A623', '#FF8A16', '#2F8467', '#FFD51F'];

export default function ExecutiveDashboard() {
  const { activeUser } = useDemoStore();
  const [loading, setLoading] = useState(true);

  // Use hardcoded demo data — enrich with live data if API available
  const data = DEMO_ANALYTICS.executive;
  const atRiskCustomers = DEMO_CUSTOMERS.filter(c => c.churn_risk >= 60)
    .sort((a, b) => b.churn_risk - a.churn_risk)
    .slice(0, 5);

  useEffect(() => {
    // Simulate brief loading for realism
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const kpiItems = [
    { title: 'Relationship Value', value: formatINR(data.kpis.relationship_value.value), trend: data.kpis.relationship_value.trend, icon: Briefcase, accent: 'border-l-yellow-500', positive: true },
    { title: 'Active Customers', value: data.kpis.active_customers.value.toLocaleString(), trend: data.kpis.active_customers.trend, icon: Users, accent: 'border-l-amber-500', positive: true },
    { title: 'Priority Opportunities', value: data.kpis.high_priority_opportunities.value, trend: data.kpis.high_priority_opportunities.trend, icon: Target, accent: 'border-l-orange-500', positive: true },
    { title: 'Conversion Rate', value: `${data.kpis.conversion_rate.value}%`, trend: data.kpis.conversion_rate.trend, icon: Percent, accent: 'border-l-emerald-600', positive: true },
    { title: 'Business Mobilized', value: formatINR(data.kpis.business_mobilized.value), trend: data.kpis.business_mobilized.trend, icon: TrendingUp, accent: 'border-l-blue-700', positive: true },
    { title: 'Customers at Risk', value: data.kpis.customers_at_risk.value, trend: data.kpis.customers_at_risk.trend, icon: ShieldAlert, accent: 'border-l-red-500', positive: false },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-72 bg-[#E8DAAE] rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl" />
          <div className="h-80 bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16263A] tracking-tight">
            {greeting()}, {activeUser?.name?.split(' ')[0] || 'Ananya'} 👋
          </h1>
          <p className="text-[#6B7076] text-sm mt-1">
            Executive Command Center · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/analytics" className="flex items-center gap-2 text-xs font-bold text-[#16263A] bg-[#FFD51F] hover:bg-[#F4A623] px-4 py-2 rounded-xl transition-all">
          <Layers className="w-3.5 h-3.5" /> Full Analytics
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiItems.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className={`bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-4 shadow-sm border-l-4 ${kpi.accent} hover:shadow-md transition-all`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-[#6B7076] uppercase tracking-wider leading-tight">{kpi.title}</p>
                <Icon className="w-4 h-4 text-[#6B7076] shrink-0" />
              </div>
              <p className="text-xl font-extrabold text-[#16263A]">{kpi.value}</p>
              <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${kpi.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                <ArrowUpRight className="w-3 h-3" /> {kpi.trend}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mobilization Trend */}
        <div className="lg:col-span-2 bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-extrabold text-[#16263A]">Business Mobilization Trend</h2>
              <p className="text-xs text-[#6B7076] mt-0.5">Actual vs Target (₹ Lakhs) — July 2026</p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-1 rounded-full">+18.5% vs Target</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.business_mobilization_trend}>
              <defs>
                <linearGradient id="mobilizedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16263A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16263A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD51F" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FFD51F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7076' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7076' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: any) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E8DAAE', fontSize: 12 }} />
              <Area type="monotone" dataKey="target" name="Target" stroke="#FFD51F" strokeWidth={2} fill="url(#targetGrad)" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="mobilized" name="Mobilized" stroke="#16263A" strokeWidth={2.5} fill="url(#mobilizedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Funnel */}
        <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6">
          <h2 className="font-extrabold text-[#16263A] mb-1">Lead Funnel</h2>
          <p className="text-xs text-[#6B7076] mb-5">Active pipeline by stage</p>
          <div className="space-y-3">
            {data.lead_funnel.map((item, i) => {
              const maxCount = Math.max(...data.lead_funnel.map(f => f.count));
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.stage}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#29313A]">{item.stage}</span>
                    <span className="text-[#6B7076]">{item.count} leads · {formatINR(item.value)}</span>
                  </div>
                  <div className="w-full h-2 bg-[#E8DAAE] rounded-full">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: STAGE_COLORS[i] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance */}
        <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6">
          <h2 className="font-extrabold text-[#16263A] mb-1">Regional Performance</h2>
          <p className="text-xs text-[#6B7076] mb-4">Branch rankings by mobilization value</p>
          <div className="space-y-3">
            {data.regional_performance.map((region) => (
              <div key={region.region} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${region.rank === 1 ? 'bg-[#FFD51F] text-[#16263A]' : region.rank === 2 ? 'bg-[#F4A623] text-white' : 'bg-[#E8DAAE] text-[#16263A]'}`}>
                  #{region.rank}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-[#16263A]">{region.region}</span>
                    <span className="text-xs font-extrabold text-[#16263A]">{formatINR(region.value)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E8DAAE] rounded-full">
                    <div
                      className="h-1.5 rounded-full bg-[#16263A]"
                      style={{ width: `${(region.value / data.regional_performance[0].value) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#6B7076] mt-0.5">{region.customers} customers · {region.leads} leads</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Risk Watchlist */}
        <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-extrabold text-[#16263A]">Churn Risk Watchlist</h2>
              <p className="text-xs text-[#6B7076] mt-0.5">Customers requiring immediate attention</p>
            </div>
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {atRiskCustomers.map((c) => (
              <Link key={c.id} href={`/customers/${c.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-[#E8DAAE] hover:border-red-200 hover:bg-red-50/30 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-extrabold text-sm shrink-0">
                  {c.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-[#16263A] truncate">{c.full_name}</p>
                  <p className="text-[10px] text-[#6B7076]">{c.segment} · {formatINR(c.relationship_value)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-red-600">{c.churn_risk}%</p>
                    <p className="text-[10px] text-[#6B7076]">Churn Risk</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#6B7076] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
          <Link href="/customers" className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-[#16263A] hover:text-[#FF8A16] transition-colors">
            View All Customers <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

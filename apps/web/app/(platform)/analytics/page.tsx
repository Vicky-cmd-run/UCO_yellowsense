'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api';
import { useDemoStore } from '../../../stores/demoStore';
import {
  TrendingUp, Users, Target, Percent, Briefcase, BarChart3,
  RefreshCw, MapPin, ArrowUpRight, ArrowDownRight, CheckCircle2,
  Calendar, Layers, Sparkles, Filter, FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid
} from 'recharts';

// INR Formatting Helper
const formatINR = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

export default function AnalyticsPage() {
  const { activeUser } = useDemoStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'mobilization' | 'conversion'>('mobilization');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!activeUser) return;
    async function loadAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.fetchAnalytics(activeUser?.role || 'HEAD_OFFICE');
        setData(res);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch analytics MIS datasets.');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [activeUser, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-border-warm rounded-lg"></div>
            <div className="h-4 w-96 bg-border-warm rounded-lg"></div>
          </div>
          <div className="h-10 w-28 bg-border-warm rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface border border-border-warm rounded-2xl p-6"></div>
          ))}
        </div>
        <div className="h-96 bg-surface border border-border-warm rounded-2xl"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="premium-card max-w-xl mx-auto my-12 text-center p-8 space-y-4">
        <BarChart3 className="w-12 h-12 text-danger-acc mx-auto" />
        <h3 className="text-lg font-bold text-navy">Error Loading Analytics</h3>
        <p className="text-text-sub text-sm">{error || 'Unable to retrieve dashboard metrics.'}</p>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-4 py-2 bg-yellow-acc hover:bg-yellow-acc/90 text-navy font-bold rounded-xl transition inline-flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const kpis = data.kpis || {};
  const mobilizationTrend = data.business_mobilization_trend || [];
  const leadFunnel = data.lead_funnel || [];
  const regionalPerformance = data.regional_performance || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Analytics & MIS Dashboard</h1>
          <p className="text-text-sub text-sm mt-1">
            Audit portfolio performance, track business mobilization trends, and evaluate funnel conversion timelines.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="p-2 border border-border-warm hover:bg-surface text-navy rounded-xl transition bg-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-text-sub" />
          </button>
          <button
            onClick={() => alert('Exporting PDF/CSV...')}
            className="px-4 py-2 border border-border-warm hover:bg-surface text-navy font-bold rounded-xl transition flex items-center gap-2 bg-white text-xs shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-text-sub" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-card bg-surface border-l-4 border-l-yellow-acc">
          <div className="flex justify-between items-start text-text-sub">
            <span className="text-xs font-bold uppercase tracking-wider">Total Value Managed</span>
            <Briefcase className="w-4 h-4 text-navy" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-navy tracking-tight">
              {formatINR(kpis.relationship_value?.value || 0)}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-text-sub font-semibold">
            Active portfolio valuation
          </div>
        </div>

        <div className="premium-card bg-surface border-l-4 border-l-gold">
          <div className="flex justify-between items-start text-text-sub">
            <span className="text-xs font-bold uppercase tracking-wider">Business Mobilized</span>
            <TrendingUp className="w-4 h-4 text-gold" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-navy tracking-tight">
              {formatINR(kpis.business_mobilized?.value || 0)}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-text-sub font-semibold">
            Acquisitions this quarter
          </div>
        </div>

        <div className="premium-card bg-surface border-l-4 border-l-orange-acc">
          <div className="flex justify-between items-start text-text-sub">
            <span className="text-xs font-bold uppercase tracking-wider">Funnel Conversion</span>
            <Percent className="w-4 h-4 text-orange-acc" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-navy tracking-tight">
              {kpis.conversion_rate?.value || 0}%
            </span>
          </div>
          <div className="mt-2 text-[10px] text-text-sub font-semibold">
            Average conversion lead-time
          </div>
        </div>

        <div className="premium-card bg-surface border-l-4 border-l-success-acc">
          <div className="flex justify-between items-start text-text-sub">
            <span className="text-xs font-bold uppercase tracking-wider">Active Customers</span>
            <Users className="w-4 h-4 text-success-acc" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-navy tracking-tight">
              {(kpis.active_customers?.value || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-text-sub font-semibold">
            Client accounts in system
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border-warm gap-4">
        <button
          onClick={() => setActiveTab('mobilization')}
          className={`pb-3 px-2 text-sm font-extrabold transition relative ${
            activeTab === 'mobilization' ? 'text-orange-acc' : 'text-text-sub hover:text-navy'
          }`}
        >
          <span>Business Mobilization Analysis</span>
          {activeTab === 'mobilization' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-acc rounded-full"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('conversion')}
          className={`pb-3 px-2 text-sm font-extrabold transition relative ${
            activeTab === 'conversion' ? 'text-orange-acc' : 'text-text-sub hover:text-navy'
          }`}
        >
          <span>Lead Conversion & Funnel</span>
          {activeTab === 'conversion' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-acc rounded-full"></div>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'mobilization' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart area */}
          <div className="premium-card lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border-warm">
              <div>
                <h3 className="font-extrabold text-navy text-sm">Asset Accumulation Trend</h3>
                <p className="text-[10px] text-text-sub mt-0.5">Asset acquisition trend in INR compared against targets</p>
              </div>
              <div className="flex gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-acc"></div>Actual</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-acc"></div>Target</span>
              </div>
            </div>

            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mobilizationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMobilized" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8A16" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#FF8A16" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD51F" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#FFD51F" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#6B7076" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#6B7076"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatINR(val), '']}
                    contentStyle={{
                      backgroundColor: '#FFFDF7',
                      borderRadius: '12px',
                      border: '1px solid #E8DAAE',
                      color: '#16263A',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Area type="monotone" dataKey="mobilized" stroke="#FF8A16" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMobilized)" />
                  <Area type="monotone" dataKey="target" stroke="#FFD51F" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorTarget)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regional Table */}
          <div className="premium-card flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-border-warm">
                <h3 className="font-extrabold text-navy text-sm">Regional Division Rankings</h3>
                <p className="text-[10px] text-text-sub mt-0.5">Asset acquisition benchmarks across regions</p>
              </div>

              <div className="mt-4 divide-y divide-border-warm">
                {regionalPerformance.map((region: any) => (
                  <div key={region.region} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-bg-warm text-navy border border-border-warm flex items-center justify-center font-bold text-xs">
                        {region.rank}
                      </div>
                      <span className="font-bold text-navy text-xs">{region.region}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-navy text-xs">{formatINR(region.value)}</span>
                      <span className="text-[9px] text-success-acc font-bold block mt-0.5 flex items-center justify-end gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        Growth
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-bg-warm/50 border border-border-warm rounded-xl p-3 text-[10px] text-text-sub mt-4 flex gap-1.5 items-start">
              <Sparkles className="w-4 h-4 text-orange-acc shrink-0" />
              <p className="font-semibold">
                Chennai Central leads other regions with an aggregate 40% growth index.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel distribution chart */}
          <div className="premium-card lg:col-span-2 space-y-4">
            <div className="pb-3 border-b border-border-warm">
              <h3 className="font-extrabold text-navy text-sm">Lead Conversion Funnel Flow</h3>
              <p className="text-[10px] text-text-sub mt-0.5">Aggregated pipeline volume distribution across stages</p>
            </div>

            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadFunnel} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DAAE" opacity={0.3} />
                  <XAxis dataKey="stage" stroke="#6B7076" fontSize={10} tickLine={false} />
                  <YAxis stroke="#6B7076" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFDF7',
                      borderRadius: '12px',
                      border: '1px solid #E8DAAE',
                      color: '#16263A',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="count" fill="#FF8A16" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Funnel health parameters */}
          <div className="premium-card flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-border-warm">
                <h3 className="font-extrabold text-navy text-sm">Conversion Health Telemetry</h3>
                <p className="text-[10px] text-text-sub mt-0.5">Average pipeline velocity and dropoff factors</p>
              </div>

              <div className="mt-4 space-y-4">
                <div className="p-3 bg-bg-warm/40 border border-border-warm rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-text-sub font-bold block uppercase tracking-wider">Average Onboarding Duration</span>
                    <span className="text-sm font-extrabold text-navy mt-0.5 block">14.2 Days</span>
                  </div>
                  <Calendar className="w-5 h-5 text-text-sub" />
                </div>

                <div className="p-3 bg-bg-warm/40 border border-border-warm rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-text-sub font-bold block uppercase tracking-wider">Lead Drop-Off Ratio</span>
                    <span className="text-sm font-extrabold text-navy mt-0.5 block">18.5%</span>
                  </div>
                  <Target className="w-5 h-5 text-danger-acc" />
                </div>

                <div className="p-3 bg-bg-warm/40 border border-border-warm rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-text-sub font-bold block uppercase tracking-wider">Referral Channel Share</span>
                    <span className="text-sm font-extrabold text-navy mt-0.5 block">62.8%</span>
                  </div>
                  <Users className="w-5 h-5 text-success-acc" />
                </div>
              </div>
            </div>

            <div className="bg-bg-warm/50 border border-border-warm rounded-xl p-3 text-[10px] text-text-sub mt-4 flex gap-1.5 items-start">
              <CheckCircle2 className="w-4 h-4 text-success-acc shrink-0" />
              <p className="font-semibold">
                Drop-off rates remained below 20% limit guidelines, satisfying board standards.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

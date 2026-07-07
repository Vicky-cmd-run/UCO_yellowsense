'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api';
import { useDemoStore } from '../../../stores/demoStore';
import {
  TrendingUp, Users, Target, Percent, Briefcase,
  AlertTriangle, MapPin, ArrowUpRight, ArrowDownRight,
  RefreshCw, Layers, ShieldAlert, CheckCircle2, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip
} from 'recharts';
import Link from 'next/link';

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

export default function ExecutiveDashboard() {
  const { activeUser } = useDemoStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [atRiskCustomers, setAtRiskCustomers] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!activeUser) return;

    async function loadDashboardData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch executive analytics
        const analytics = await apiService.fetchAnalytics(activeUser?.role || 'HEAD_OFFICE');
        setData(analytics);

        // Fetch customer list to sort by churn risk for the risk watchlist
        const customers = await apiService.fetchCustomers();
        if (Array.isArray(customers)) {
          const highRisk = customers
            .filter((c: any) => c.churn_risk > 50)
            .sort((a: any, b: any) => b.churn_risk - a.churn_risk)
            .slice(0, 5);
          setAtRiskCustomers(highRisk);
        }
      } catch (err: any) {
        console.error('Failed to load executive data', err);
        setError(err.message || 'Something went wrong while fetching executive data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [activeUser, refreshTrigger]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-acc" />
          <p className="text-text-sub font-semibold">Initializing dashboard environment...</p>
        </div>
      </div>
    );
  }

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-surface border border-border-warm rounded-2xl p-6"></div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-surface border border-border-warm rounded-2xl p-6"></div>
          <div className="h-96 bg-surface border border-border-warm rounded-2xl p-6"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="premium-card max-w-xl mx-auto my-12 text-center p-8 flex flex-col items-center gap-4">
        <AlertTriangle className="w-12 h-12 text-danger-acc" />
        <h3 className="text-lg font-bold text-navy">Error Loading Dashboard</h3>
        <p className="text-text-sub text-sm">{error || 'Could not fetch data from the server.'}</p>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-4 py-2 bg-yellow-acc hover:bg-yellow-acc/90 text-navy font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const kpis = data.kpis || {};
  const mobilizationTrend = data.business_mobilization_trend || [];
  const leadFunnel = data.lead_funnel || [];
  const regionalPerformance = data.regional_performance || [];

  // KPI card helper lists
  const kpiItems = [
    {
      title: 'Relationship Value',
      value: formatINR(kpis.relationship_value?.value || 0),
      trend: kpis.relationship_value?.trend,
      comparison: kpis.relationship_value?.comparison,
      icon: Briefcase,
      color: 'border-l-4 border-l-yellow-acc',
      isPositive: true
    },
    {
      title: 'Active Customers',
      value: (kpis.active_customers?.value || 0).toLocaleString(),
      trend: kpis.active_customers?.trend,
      comparison: kpis.active_customers?.comparison,
      icon: Users,
      color: 'border-l-4 border-l-gold',
      isPositive: true
    },
    {
      title: 'High-Priority Opportunities',
      value: kpis.high_priority_opportunities?.value || 0,
      trend: kpis.high_priority_opportunities?.trend,
      comparison: kpis.high_priority_opportunities?.comparison,
      icon: Target,
      color: 'border-l-4 border-l-orange-acc',
      isPositive: true
    },
    {
      title: 'Conversion Rate',
      value: `${kpis.conversion_rate?.value || 0}%`,
      trend: kpis.conversion_rate?.trend,
      comparison: kpis.conversion_rate?.comparison,
      icon: Percent,
      color: 'border-l-4 border-l-success-acc',
      isPositive: true
    },
    {
      title: 'Business Mobilized',
      value: formatINR(kpis.business_mobilized?.value || 0),
      trend: kpis.business_mobilized?.trend,
      comparison: kpis.business_mobilized?.comparison,
      icon: TrendingUp,
      color: 'border-l-4 border-l-navy',
      isPositive: true
    },
    {
      title: 'Customers at Risk',
      value: kpis.customers_at_risk?.value || 0,
      trend: kpis.customers_at_risk?.trend,
      comparison: kpis.customers_at_risk?.comparison,
      icon: ShieldAlert,
      color: 'border-l-4 border-l-danger-acc',
      isPositive: false // decrease is good, increase is bad
    }
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Executive Command Center</h1>
          <p className="text-text-sub text-sm mt-1">
            Real-time tracking of mobilized assets, customer lifecycles, and regional branch operations.
          </p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-4 py-2 border border-border-warm hover:bg-surface text-navy font-bold rounded-xl transition flex items-center gap-2 shadow-sm bg-white"
        >
          <RefreshCw className="w-4 h-4 text-text-sub" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiItems.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isDangerKpi = kpi.title === 'Customers at Risk';
          return (
            <div key={idx} className={`premium-card relative overflow-hidden bg-surface transition ${kpi.color}`}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-text-sub uppercase tracking-wider">{kpi.title}</span>
                <Icon className="w-4 h-4 text-text-sub shrink-0" />
              </div>
              <div className="mt-3">
                <span className="text-xl font-extrabold text-navy tracking-tight">{kpi.value}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className={`font-bold flex items-center ${
                  isDangerKpi 
                    ? (kpi.trend?.startsWith('-') ? 'text-success-acc' : 'text-danger-acc') 
                    : (kpi.trend?.startsWith('+') ? 'text-success-acc' : 'text-danger-acc')
                }`}>
                  {kpi.trend?.startsWith('+') ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {kpi.trend}
                </span>
                <span className="text-text-sub font-medium">{kpi.comparison}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Graphs & Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Mobilization Trend AreaChart */}
        <div className="premium-card lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-4 border-b border-border-warm">
            <div>
              <h3 className="font-bold text-navy text-base">Business Mobilization Trend</h3>
              <p className="text-xs text-text-sub mt-0.5">Asset acquisition trend in INR compared against targets</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-acc"></div>
                <span className="text-text-main">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-acc"></div>
                <span className="text-text-main">Target</span>
              </div>
            </div>
          </div>

          <div className="h-80 w-full mt-6">
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
                <XAxis dataKey="date" stroke="#6B7076" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#6B7076"
                  fontSize={11}
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
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Area type="monotone" dataKey="mobilized" stroke="#FF8A16" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMobilized)" />
                <Area type="monotone" dataKey="target" stroke="#FFD51F" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorTarget)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Conversion Funnel */}
        <div className="premium-card flex flex-col justify-between">
          <div className="pb-4 border-b border-border-warm">
            <h3 className="font-bold text-navy text-base">Lead Funnel Distribution</h3>
            <p className="text-xs text-text-sub mt-0.5">Quantity of prospects at each onboarding lifecycle stage</p>
          </div>

          <div className="space-y-4 my-6 grow flex flex-col justify-center">
            {leadFunnel.map((item: any, idx: number) => {
              const maxCount = Math.max(...leadFunnel.map((f: any) => f.count));
              const percentWidth = (item.count / maxCount) * 100;
              // Choose gradient/shade based on funnel depth
              const bgColors = [
                'bg-navy',
                'bg-gold',
                'bg-orange-acc',
                'bg-yellow-acc',
                'bg-success-acc'
              ];
              const colorClass = bgColors[idx % bgColors.length];

              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-text-main">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-text-sub" />
                      {item.stage}
                    </span>
                    <span>{item.count} leads</span>
                  </div>
                  <div className="w-full bg-bg-warm rounded-full h-3.5 overflow-hidden border border-border-warm/40">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                      style={{ width: `${percentWidth}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-bg-warm/60 border border-border-warm rounded-xl p-3 text-xs flex gap-2 items-start">
            <CheckCircle2 className="w-4 h-4 text-success-acc shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-navy">Pipeline Health Check</p>
              <p className="text-text-sub mt-0.5">High conversion rate (64%) indicates strong lead match quality.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Performance & Churn Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Performance Rankings */}
        <div className="premium-card lg:col-span-2">
          <div className="pb-4 border-b border-border-warm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-navy text-base">Regional Branch Rankings</h3>
              <p className="text-xs text-text-sub mt-0.5">Top-performing branch segments based on Relationship Value</p>
            </div>
            <span className="px-2.5 py-1 bg-yellow-acc/10 border border-yellow-acc/30 text-orange-acc rounded-lg text-xs font-bold uppercase">
              4 Regions Active
            </span>
          </div>

          <div className="mt-4 divide-y divide-border-warm">
            {regionalPerformance.map((region: any) => (
              <div key={region.region} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                    region.rank === 1 
                      ? 'bg-yellow-acc text-navy shadow-sm' 
                      : region.rank === 2
                      ? 'bg-gold/20 text-orange-acc'
                      : 'bg-bg-warm text-text-sub border border-border-warm'
                  }`}>
                    {region.rank}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-sm">{region.region}</h4>
                    <p className="text-[10px] text-text-sub font-semibold tracking-wide uppercase mt-0.5">Regional Office</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-navy text-sm">{formatINR(region.value)}</span>
                  <div className="text-[10px] text-success-acc font-semibold flex items-center justify-end gap-0.5 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Active Growth</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Risk Watchlist */}
        <div className="premium-card flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-border-warm flex justify-between items-center">
              <div>
                <h3 className="font-bold text-navy text-base">Churn Risk Watchlist</h3>
                <p className="text-xs text-text-sub mt-0.5">High-priority customer accounts showing churn signals</p>
              </div>
              <ShieldAlert className="w-5 h-5 text-danger-acc shrink-0" />
            </div>

            {atRiskCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-success-acc" />
                <p className="font-bold text-navy">No Customers at Risk</p>
                <p className="text-text-sub max-w-[200px]">All portfolio accounts are showing healthy retention metrics.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {atRiskCustomers.map((cust) => (
                  <Link
                    key={cust.id}
                    href={`/customers/${cust.id}`}
                    className="p-3 bg-bg-warm/50 border border-border-warm rounded-xl hover:border-yellow-acc hover:bg-white transition flex justify-between items-center cursor-pointer group"
                  >
                    <div>
                      <h4 className="font-bold text-navy text-xs group-hover:text-orange-acc transition">{cust.full_name}</h4>
                      <p className="text-[10px] text-text-sub mt-0.5">{cust.customer_number} • {cust.city}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-text-sub block">Risk Score</span>
                        <span className={`text-xs font-black ${
                          cust.churn_risk >= 80 
                            ? 'text-danger-acc' 
                            : cust.churn_risk >= 60 
                            ? 'text-warning-acc' 
                            : 'text-gold'
                        }`}>
                          {cust.churn_risk}%
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-text-sub group-hover:translate-x-0.5 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border-warm">
            <Link
              href="/customers"
              className="w-full py-2 bg-navy hover:bg-navy/95 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <span>View Full Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

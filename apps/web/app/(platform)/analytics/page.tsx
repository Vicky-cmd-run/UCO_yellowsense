'use client';

import React, { useState } from 'react';
import { DEMO_ANALYTICS, DEMO_LEADS, DEMO_VISITS, DEMO_CUSTOMERS } from '@/services/DEMO_DATA';
import {
  TrendingUp, Target, Users, BarChart2, CheckCircle,
  Calendar, Award, ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie, Legend, Sector
} from 'recharts';

const formatINR = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const SEGMENT_DATA = [
  { name: 'MSME', value: 42, color: '#16263A' },
  { name: 'HNI', value: 28, color: '#F4A623' },
  { name: 'SME', value: 18, color: '#FF8A16' },
  { name: 'MICRO', value: 12, color: '#E8DAAE' },
];

const MONTHLY_TREND = [
  { month: 'Jan', visits: 18, leads: 8, converted: 5 },
  { month: 'Feb', visits: 22, leads: 11, converted: 7 },
  { month: 'Mar', visits: 28, leads: 14, converted: 9 },
  { month: 'Apr', visits: 25, leads: 12, converted: 8 },
  { month: 'May', visits: 32, leads: 18, converted: 12 },
  { month: 'Jun', visits: 38, leads: 22, converted: 15 },
  { month: 'Jul', visits: 41, leads: 26, converted: 17 },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'executive' | 'sales' | 'digital'>('executive');
  const data = DEMO_ANALYTICS.executive;
  const totalPipelineValue = DEMO_LEADS.filter(l => l.stage !== 'Lost').reduce((s, l) => s + l.potential_value, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16263A] tracking-tight">Analytics & Insights</h1>
          <p className="text-[#6B7076] text-sm mt-1">Portfolio performance metrics · Branch intelligence · July 2026</p>
        </div>
        <button
          onClick={() => {
            const rows = data.regional_performance;
            const headers = Object.keys(rows[0]);
            const csv = [headers.join(','), ...rows.map((r: any) => headers.map(h => r[h]).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mis_regional_report.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 bg-[#16263A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#16263A]/90 transition-all shrink-0"
        >
          Download MIS Report
        </button>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2">
        {(['executive', 'sales', 'digital'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${activeTab === t ? 'bg-[#16263A] text-white border-[#16263A]' : 'border-[#E8DAAE] text-[#6B7076] hover:border-[#16263A]'}`}
          >
            {t === 'executive' ? '🏛 Executive' : t === 'sales' ? '📈 Sales' : '📱 Digital'}
          </button>
        ))}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Portfolio Value', value: formatINR(data.kpis.relationship_value.value), trend: data.kpis.relationship_value.trend, positive: true },
          { label: 'Active Customers', value: data.kpis.active_customers.value, trend: data.kpis.active_customers.trend, positive: true },
          { label: 'Business Mobilized', value: formatINR(data.kpis.business_mobilized.value), trend: data.kpis.business_mobilized.trend, positive: true },
          { label: 'Conversion Rate', value: `${data.kpis.conversion_rate.value}%`, trend: data.kpis.conversion_rate.trend, positive: true },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-4">
            <p className="text-[10px] font-bold text-[#6B7076] uppercase tracking-wider mb-2">{kpi.label}</p>
            <p className="text-xl font-extrabold text-[#16263A]">{kpi.value}</p>
            <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${kpi.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              <ArrowUpRight className="w-3 h-3" /> {kpi.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mobilization Trend */}
        <div className="lg:col-span-2 bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6">
          <h2 className="font-extrabold text-[#16263A] mb-1">Business Mobilization</h2>
          <p className="text-xs text-[#6B7076] mb-4">Actual vs Target · 7 months · ₹ values</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.business_mobilization_trend}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16263A" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#16263A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7076' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7076' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 10000000).toFixed(1)}Cr`} />
              <Tooltip formatter={(v: any) => formatINR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E8DAAE', fontSize: 11 }} />
              <Area type="monotone" dataKey="target" name="Target" stroke="#FFD51F" strokeDasharray="5 5" strokeWidth={1.5} fill="none" />
              <Area type="monotone" dataKey="mobilized" name="Mobilized" stroke="#16263A" strokeWidth={2.5} fill="url(#aGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Segment Distribution */}
        <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6">
          <h2 className="font-extrabold text-[#16263A] mb-1">Portfolio by Segment</h2>
          <p className="text-xs text-[#6B7076] mb-4">Distribution of {DEMO_CUSTOMERS.length} customers</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={SEGMENT_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {SEGMENT_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ borderRadius: 12, border: '1px solid #E8DAAE', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {SEGMENT_DATA.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-[#6B7076]">{s.name}</span>
                <span className="font-bold text-[#16263A] ml-auto">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Trend */}
        <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6">
          <h2 className="font-extrabold text-[#16263A] mb-1">Monthly Activity</h2>
          <p className="text-xs text-[#6B7076] mb-4">Visits, leads generated, leads converted</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_TREND} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7076' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7076' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8DAAE', fontSize: 11 }} />
              <Bar dataKey="visits" name="Visits" fill="#E8DAAE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leads" name="Leads" fill="#F4A623" radius={[4, 4, 0, 0]} />
              <Bar dataKey="converted" name="Converted" fill="#16263A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Funnel */}
        <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6">
          <h2 className="font-extrabold text-[#16263A] mb-1">Lead Pipeline Funnel</h2>
          <p className="text-xs text-[#6B7076] mb-4">Total pipeline value: {formatINR(totalPipelineValue)}</p>
          <div className="space-y-3">
            {data.lead_funnel.map((item, i) => {
              const maxCount = Math.max(...data.lead_funnel.map(f => f.count));
              const pct = Math.round((item.count / maxCount) * 100);
              const colors = ['#16263A', '#F4A623', '#FF8A16', '#2F8467', '#FFD51F'];
              return (
                <div key={item.stage}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#29313A]">{item.stage}</span>
                    <span className="text-[#6B7076]">{item.count} leads · {formatINR(item.value)}</span>
                  </div>
                  <div className="w-full h-3 bg-[#E8DAAE] rounded-full">
                    <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: colors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Regional Leaderboard */}
      <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6">
        <h2 className="font-extrabold text-[#16263A] mb-1">Regional Leaderboard</h2>
        <p className="text-xs text-[#6B7076] mb-5">Branch performance ranked by mobilization value</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {data.regional_performance.map(r => (
            <div key={r.region} className={`p-4 rounded-2xl border ${r.rank === 1 ? 'bg-[#FFD51F]/10 border-[#FFD51F]' : 'border-[#E8DAAE]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${r.rank === 1 ? 'bg-[#FFD51F] text-[#16263A]' : r.rank === 2 ? 'bg-[#F4A623] text-white' : r.rank === 3 ? 'bg-[#E8DAAE] text-[#16263A]' : 'bg-slate-100 text-slate-600'}`}>
                  #{r.rank}
                </span>
                <Award className={`w-4 h-4 ${r.rank === 1 ? 'text-[#F4A623]' : 'text-[#E8DAAE]'}`} />
              </div>
              <p className="text-xs font-extrabold text-[#16263A] mb-0.5">{r.region}</p>
              <p className="text-base font-extrabold text-[#16263A]">{formatINR(r.value)}</p>
              <p className="text-[10px] text-[#6B7076] mt-1">{r.customers} customers · {r.leads} leads</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

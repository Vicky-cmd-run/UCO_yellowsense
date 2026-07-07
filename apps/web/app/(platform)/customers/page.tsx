'use client';

import React, { useState, useMemo } from 'react';
import { DEMO_CUSTOMERS } from '@/services/DEMO_DATA';
import {
  Search, Users, TrendingUp, ShieldAlert, ArrowUpDown,
  ChevronRight, Filter, Award, Wifi, WifiOff
} from 'lucide-react';
import Link from 'next/link';

const formatINR = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const SEGMENT_COLORS: Record<string, string> = {
  HNI: 'bg-purple-100 text-purple-700',
  MSME: 'bg-blue-100 text-blue-700',
  SME: 'bg-indigo-100 text-indigo-700',
  MICRO: 'bg-emerald-100 text-emerald-700',
  CORPORATE: 'bg-orange-100 text-orange-700',
};

const STAGE_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  AT_RISK: 'bg-red-100 text-red-700',
  DORMANT: 'bg-amber-100 text-amber-700',
  ONBOARDING: 'bg-sky-100 text-sky-700',
};

const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: 'text-emerald-600',
  NEUTRAL: 'text-amber-600',
  NEGATIVE: 'text-red-600',
};

export default function CustomersDirectory() {
  const [q, setQ] = useState('');
  const [segment, setSegment] = useState('');
  const [stage, setStage] = useState('');
  const [sortBy, setSortBy] = useState<'relationship_value' | 'churn_risk'>('relationship_value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let list = [...DEMO_CUSTOMERS];
    if (q.trim()) {
      const lq = q.toLowerCase();
      list = list.filter(c =>
        c.full_name.toLowerCase().includes(lq) ||
        c.customer_number.toLowerCase().includes(lq) ||
        c.mobile.includes(lq) ||
        c.email.toLowerCase().includes(lq) ||
        c.city.toLowerCase().includes(lq)
      );
    }
    if (segment) list = list.filter(c => c.segment === segment);
    if (stage) list = list.filter(c => c.lifecycle_stage === stage);
    list.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] as number;
      const bVal = b[sortBy as keyof typeof b] as number;
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
    return list;
  }, [q, segment, stage, sortBy, sortOrder]);

  const stats = useMemo(() => ({
    total: DEMO_CUSTOMERS.length,
    active: DEMO_CUSTOMERS.filter(c => c.lifecycle_stage === 'ACTIVE').length,
    atRisk: DEMO_CUSTOMERS.filter(c => c.churn_risk >= 60).length,
    totalValue: DEMO_CUSTOMERS.reduce((s, c) => s + c.relationship_value, 0),
  }), []);

  const toggleSort = (field: 'relationship_value' | 'churn_risk') => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#16263A] tracking-tight">Customer Directory</h1>
        <p className="text-[#6B7076] text-sm mt-1">Search, filter and navigate to any customer's 360° profile</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: stats.total, icon: Users, color: 'text-[#16263A]' },
          { label: 'Active Relationships', value: stats.active, icon: Award, color: 'text-emerald-600' },
          { label: 'At Risk (Churn ≥60%)', value: stats.atRisk, icon: ShieldAlert, color: 'text-red-600' },
          { label: 'Total Portfolio Value', value: formatINR(stats.totalValue), icon: TrendingUp, color: 'text-[#F4A623]' },
        ].map((s) => (
          <div key={s.label} className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-[10px] font-bold text-[#6B7076] uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7076]" />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name, customer ID, mobile, email, city..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] focus:outline-none focus:ring-2 focus:ring-[#FFD51F] font-medium text-[#16263A] placeholder:text-[#6B7076]"
          />
        </div>
        <select
          value={segment}
          onChange={e => setSegment(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-semibold text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]"
        >
          <option value="">All Segments</option>
          <option value="HNI">HNI</option>
          <option value="MSME">MSME</option>
          <option value="SME">SME</option>
          <option value="MICRO">MICRO</option>
        </select>
        <select
          value={stage}
          onChange={e => setStage(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-semibold text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]"
        >
          <option value="">All Stages</option>
          <option value="ACTIVE">Active</option>
          <option value="AT_RISK">At Risk</option>
          <option value="DORMANT">Dormant</option>
        </select>
        {(q || segment || stage) && (
          <button onClick={() => { setQ(''); setSegment(''); setStage(''); }} className="px-3 py-2 text-sm rounded-xl border border-[#E8DAAE] text-[#6B7076] hover:bg-[#FFF9ED] font-semibold transition-all">
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#6B7076]">
          Showing <span className="text-[#16263A] font-extrabold">{filtered.length}</span> of {DEMO_CUSTOMERS.length} customers
        </p>
        <div className="flex gap-2">
          <button onClick={() => toggleSort('relationship_value')} className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${sortBy === 'relationship_value' ? 'bg-[#16263A] text-white border-[#16263A]' : 'border-[#E8DAAE] text-[#6B7076] hover:border-[#16263A]'}`}>
            <ArrowUpDown className="w-3 h-3" /> Relationship Value
          </button>
          <button onClick={() => toggleSort('churn_risk')} className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${sortBy === 'churn_risk' ? 'bg-red-600 text-white border-red-600' : 'border-[#E8DAAE] text-[#6B7076] hover:border-red-400'}`}>
            <ShieldAlert className="w-3 h-3" /> Churn Risk
          </button>
        </div>
      </div>

      {/* Customer Cards */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#6B7076]">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-bold">No customers match your search</p>
            <p className="text-xs mt-1">Try a different name, ID, or clear the filters</p>
          </div>
        ) : (
          filtered.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="flex items-center gap-4 p-4 bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl hover:border-[#F4A623] hover:shadow-md transition-all group"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-xl bg-[#16263A] text-white flex items-center justify-center font-extrabold text-base shrink-0">
                {c.full_name.charAt(0)}
              </div>

              {/* Core Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="font-extrabold text-[#16263A] text-sm">{c.full_name}</p>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${SEGMENT_COLORS[c.segment] || 'bg-gray-100 text-gray-600'}`}>{c.segment}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${STAGE_COLORS[c.lifecycle_stage] || 'bg-gray-100 text-gray-600'}`}>{c.lifecycle_stage.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-[#6B7076]">
                  {c.customer_number} · {c.city}, {c.state} · {c.mobile}
                </p>
              </div>

              {/* Metrics */}
              <div className="hidden md:flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <p className="text-xs text-[#6B7076] font-semibold">Relationship Value</p>
                  <p className="font-extrabold text-[#16263A] text-sm">{formatINR(c.relationship_value)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6B7076] font-semibold">Churn Risk</p>
                  <p className={`font-extrabold text-sm ${c.churn_risk >= 70 ? 'text-red-600' : c.churn_risk >= 40 ? 'text-amber-600' : 'text-emerald-600'}`}>{c.churn_risk}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6B7076] font-semibold">Digital Score</p>
                  <p className="font-extrabold text-[#16263A] text-sm">{c.digital_engagement_score}/100</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6B7076] font-semibold">Sentiment</p>
                  <p className={`font-extrabold text-sm ${SENTIMENT_COLORS[c.sentiment] || 'text-gray-600'}`}>{c.sentiment}</p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-[#6B7076] group-hover:text-[#F4A623] group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

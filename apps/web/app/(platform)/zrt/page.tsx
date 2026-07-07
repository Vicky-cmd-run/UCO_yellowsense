'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/stores/demoStore';
import { DEMO_VISITS, DEMO_CUSTOMERS } from '@/services/DEMO_DATA';
import {
  MapPin, Calendar, Clock, Navigation, CheckCircle, DollarSign,
  Search, Plus, ChevronRight, Map, Loader2, Sparkles, Target, Wifi, WifiOff
} from 'lucide-react';
import Link from 'next/link';

const formatINR = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
};

// SVG Route Map — simulated abstract route visualization
function RouteMap({ visits }: { visits: any[] }) {
  // Generate simple abstract waypoints
  const points = [
    { x: 80, y: 200, label: 'Start (Branch)', base: true },
    { x: 200, y: 130, label: visits[0]?.customer?.full_name || 'Visit 1' },
    { x: 340, y: 160, label: visits[1]?.customer?.full_name || 'Visit 2' },
    { x: 290, y: 260, label: visits[2]?.customer?.full_name || 'Visit 3' },
    { x: 170, y: 290, label: visits[3]?.customer?.full_name || 'Visit 4' },
  ];

  const lines = [];
  for (let i = 0; i < points.length - 1; i++) {
    lines.push({ x1: points[i].x, y1: points[i].y, x2: points[i + 1].x, y2: points[i + 1].y });
  }

  return (
    <div className="bg-[#16263A]/5 rounded-2xl p-4 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <Map className="w-3.5 h-3.5 text-[#16263A]" />
        <span className="text-xs font-extrabold text-[#16263A] uppercase tracking-wider">Route Overview — Chennai Zone</span>
        <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Optimized Route</span>
      </div>
      <svg width="100%" viewBox="0 0 420 380" className="w-full" style={{ height: 220 }}>
        {/* Grid lines */}
        {[80, 160, 240, 320].map(x => <line key={`vg${x}`} x1={x} y1={40} x2={x} y2={360} stroke="#E8DAAE" strokeWidth={0.5} />)}
        {[80, 160, 240, 320].map(y => <line key={`hg${y}`} x1={40} y1={y} x2={400} y2={y} stroke="#E8DAAE" strokeWidth={0.5} />)}

        {/* Route lines */}
        {lines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#F4A623" strokeWidth={2} strokeDasharray="6 3" />
        ))}

        {/* Waypoints */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={p.base ? 10 : 8} fill={p.base ? '#16263A' : i <= (visits.filter(v => v.status === 'COMPLETED').length) ? '#2F8467' : '#F4A623'} />
            <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={9} fontWeight="bold">{i === 0 ? '⭐' : i}</text>
            <text x={p.x} y={p.y + 20} textAnchor="middle" fill="#29313A" fontSize={8} fontWeight="600">{p.label?.split(' ').slice(0, 2).join(' ')}</text>
          </g>
        ))}
      </svg>
      <p className="text-[10px] text-[#6B7076] text-center mt-1">Total route: ~{visits.reduce((s: number, v: any) => s + (v.distance_km || 0), 0).toFixed(1)} km · ~{visits.reduce((s: number, v: any) => s + (v.travel_mins || 0), 0)} min travel time</p>
    </div>
  );
}

export default function ZRTCommandCenter() {
  const router = useRouter();
  const { networkStatus, activeUser } = useDemoStore();
  const [visits, setVisits] = useState(DEMO_VISITS);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState(DEMO_CUSTOMERS[0].id);
  const [newPurpose, setNewPurpose] = useState('');
  const [newDate, setNewDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = visits.filter(v => {
    const matchFilter = filter === 'ALL' || v.status === filter;
    const matchSearch = !search || v.customer?.full_name?.toLowerCase().includes(search.toLowerCase()) || v.purpose.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const todayVisits = visits.filter(v => v.status !== 'COMPLETED');
  const completedToday = visits.filter(v => v.status === 'COMPLETED').length;

  const handleSchedule = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    const cust = DEMO_CUSTOMERS.find(c => c.id === newCustomerId)!;
    const newVisit = {
      id: `v${Date.now()}`,
      customer_id: newCustomerId,
      zrt_officer_id: activeUser?.id || 'u001',
      purpose: newPurpose,
      scheduled_at: new Date(newDate).toISOString(),
      status: 'SCHEDULED',
      geo_verified: false,
      priority_score: Math.floor(60 + Math.random() * 35),
      distance_km: parseFloat((2 + Math.random() * 8).toFixed(1)),
      travel_mins: Math.floor(10 + Math.random() * 25),
      opportunity_value: cust.relationship_value,
      customer: cust,
      coordinates: { lat: 13.08, lng: 80.27 },
      address: `${cust.city}, ${cust.state}`,
    };
    setVisits(prev => [...prev, newVisit]);
    setSubmitting(false);
    setShowSchedule(false);
    setNewPurpose('');
    setNewDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16263A] tracking-tight">ZRT Command Center</h1>
          <p className="text-[#6B7076] text-sm mt-1">
            {todayVisits.length} visits scheduled · {completedToday} completed today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${networkStatus === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {networkStatus === 'Online' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {networkStatus}
          </div>
          <button
            onClick={() => setShowSchedule(true)}
            className="flex items-center gap-2 bg-[#16263A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#16263A]/90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Schedule Visit
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Scheduled', value: visits.filter(v => v.status === 'SCHEDULED').length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: completedToday, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Opportunity Value', value: formatINR(todayVisits.reduce((s: number, v: any) => s + (v.opportunity_value || 0), 0)), color: 'text-[#F4A623]', bg: 'bg-amber-50' },
          { label: 'Avg Priority Score', value: Math.round(todayVisits.reduce((s: number, v: any) => s + (v.priority_score || 0), 0) / Math.max(todayVisits.length, 1)), color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-2xl p-4`}>
            <p className="text-[10px] font-bold text-[#6B7076] uppercase mb-1">{k.label}</p>
            <p className={`text-xl font-extrabold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Route Map */}
      <RouteMap visits={todayVisits.slice(0, 4)} />

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7076]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search visits by customer or purpose..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-medium text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]"
          />
        </div>
        {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${filter === f ? 'bg-[#16263A] text-white border-[#16263A]' : 'border-[#E8DAAE] text-[#6B7076] hover:border-[#16263A]'}`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Visit Cards */}
      <div className="space-y-3">
        {filtered.map((visit, idx) => (
          <div key={visit.id} className={`bg-[#FFFDF7] border rounded-2xl p-5 ${visit.status === 'COMPLETED' ? 'border-emerald-200 opacity-80' : 'border-[#E8DAAE] hover:border-[#F4A623] hover:shadow-md'} transition-all`}>
            <div className="flex items-start gap-4">
              {/* Priority Badge */}
              <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${visit.priority_score >= 85 ? 'bg-red-100 text-red-600' : visit.priority_score >= 70 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                <span className="text-lg font-extrabold leading-none">{idx + 1}</span>
                <span className="text-[9px] font-bold">P{visit.priority_score}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <p className="font-extrabold text-[#16263A]">{visit.customer?.full_name}</p>
                    <p className="text-xs text-[#6B7076]">{visit.customer?.segment} · {visit.address}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${STATUS_STYLES[visit.status]}`}>{visit.status.replace('_', ' ')}</span>
                </div>

                <p className="text-xs text-[#29313A] font-semibold mb-3">📋 {visit.purpose}</p>

                <div className="flex flex-wrap gap-4 text-xs text-[#6B7076]">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(visit.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {visit.distance_km} km · {visit.travel_mins} min</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {formatINR(visit.opportunity_value)} opportunity</span>
                  {visit.geo_verified && <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle className="w-3 h-3" /> Geo-verified</span>}
                </div>

                {visit.notes && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <p className="text-[10px] font-extrabold text-emerald-700 mb-1">VISIT NOTES</p>
                    <p className="text-xs text-emerald-800">{visit.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {visit.status !== 'COMPLETED' && (
                <Link
                  href={`/zrt/visits/${visit.id}`}
                  className="flex items-center gap-1.5 bg-[#FFD51F] hover:bg-[#F4A623] text-[#16263A] text-xs font-extrabold px-3 py-2 rounded-xl shrink-0 transition-all"
                >
                  Start <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-extrabold text-[#16263A] mb-4">Schedule Field Visit</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#6B7076] block mb-1">Customer</label>
                <select value={newCustomerId} onChange={e => setNewCustomerId(e.target.value)} className="w-full p-2.5 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-semibold text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]">
                  {DEMO_CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B7076] block mb-1">Purpose</label>
                <input value={newPurpose} onChange={e => setNewPurpose(e.target.value)} placeholder="e.g. Monthly account review" className="w-full p-2.5 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-medium text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B7076] block mb-1">Date & Time</label>
                <input type="datetime-local" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full p-2.5 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-medium text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowSchedule(false)} className="flex-1 py-2.5 rounded-xl border border-[#E8DAAE] text-xs font-bold text-[#6B7076] hover:bg-[#E8DAAE]/30 transition-all">Cancel</button>
                <button onClick={handleSchedule} disabled={!newPurpose || !newDate || submitting} className="flex-1 py-2.5 rounded-xl bg-[#16263A] text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scheduling...</> : 'Schedule Visit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

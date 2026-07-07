'use client';

import React, { useState } from 'react';
import { DEMO_COMPLAINTS, DEMO_CUSTOMERS } from '@/services/DEMO_DATA';
import {
  AlertTriangle, CheckCircle, Clock, ChevronRight,
  ArrowUpCircle, Filter, Search
} from 'lucide-react';

const SEV_STYLES: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  LOW: 'bg-slate-100 text-slate-600 border-slate-200',
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-orange-100 text-orange-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>(DEMO_COMPLAINTS);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState<any>(DEMO_COMPLAINTS[0]);
  const [escalating, setEscalating] = useState(false);
  const [resolving, setResolving] = useState(false);

  const filtered = filter === 'ALL' ? complaints : complaints.filter(c => c.status === filter || c.severity === filter);

  const escalate = async (id: string) => {
    setEscalating(true);
    await new Promise(r => setTimeout(r, 800));
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, escalation_level: c.escalation_level + 1, status: 'IN_PROGRESS' } : c));
    setSelected((prev: any) => ({ ...prev, escalation_level: prev.escalation_level + 1, status: 'IN_PROGRESS' }));
    setEscalating(false);
  };

  const resolve = async (id: string) => {
    setResolving(true);
    await new Promise(r => setTimeout(r, 800));
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'RESOLVED', resolution: 'Issue resolved by support team. Customer notified.' } : c));
    setSelected((prev: any) => ({ ...prev, status: 'RESOLVED', resolution: 'Issue resolved by support team. Customer notified.' }));
    setResolving(false);
  };

  const getSLAStatus = (comp: any) => {
    if (comp.status === 'RESOLVED') return { label: 'Resolved', color: 'text-emerald-600' };
    const breach = new Date(comp.sla_breach_at);
    const now = new Date();
    const hours = Math.round((breach.getTime() - now.getTime()) / 3600000);
    if (hours < 0) return { label: `SLA Breached ${Math.abs(hours)}h ago`, color: 'text-red-600' };
    if (hours < 24) return { label: `${hours}h remaining`, color: 'text-amber-600' };
    return { label: `${Math.round(hours / 24)}d remaining`, color: 'text-emerald-600' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#16263A] tracking-tight">Service Complaints</h1>
        <p className="text-[#6B7076] text-sm mt-1">{complaints.filter(c => c.status !== 'RESOLVED').length} open · {complaints.filter(c => c.severity === 'HIGH' && c.status !== 'RESOLVED').length} high severity</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'HIGH'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filter === f ? 'bg-[#16263A] text-white border-[#16263A]' : 'border-[#E8DAAE] text-[#6B7076] hover:border-[#16263A]'}`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="space-y-2">
          {filtered.map(comp => {
            const sla = getSLAStatus(comp);
            return (
              <button
                key={comp.id}
                onClick={() => setSelected(comp)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${selected.id === comp.id ? 'border-[#16263A] bg-[#16263A]/5' : `border-[#E8DAAE] hover:border-[#F4A623] ${comp.severity === 'HIGH' && comp.status !== 'RESOLVED' ? 'bg-red-50/30' : 'bg-[#FFFDF7]'}`}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-extrabold text-[#16263A] line-clamp-1">{comp.category}</p>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${SEV_STYLES[comp.severity]}`}>{comp.severity}</span>
                </div>
                <p className="text-[10px] font-bold text-[#6B7076]">{comp.customer_name}</p>
                <p className="text-[10px] text-[#6B7076] mt-0.5">{comp.ticket_id}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[comp.status]}`}>{comp.status.replace('_', ' ')}</span>
                  <span className={`text-[10px] font-bold ${sla.color}`}>{sla.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${SEV_STYLES[selected.severity]}`}>{selected.severity}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${STATUS_STYLES[selected.status]}`}>{selected.status.replace('_', ' ')}</span>
                <span className="text-[10px] font-bold text-[#6B7076]">Escalation Level {selected.escalation_level}</span>
              </div>
              <h2 className="text-base font-extrabold text-[#16263A]">{selected.category}</h2>
              <p className="text-xs text-[#6B7076]">{selected.ticket_id} · {selected.customer_name} · Raised {new Date(selected.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-extrabold text-[#6B7076] uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-[#29313A] leading-relaxed bg-[#FFF9ED] border border-[#E8DAAE] rounded-xl p-4">{selected.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[#6B7076] font-semibold">Assigned Team</p>
              <p className="font-extrabold text-[#16263A] mt-0.5">{selected.assigned_team}</p>
            </div>
            <div>
              <p className="text-[#6B7076] font-semibold">SLA Status</p>
              <p className={`font-extrabold mt-0.5 ${getSLAStatus(selected).color}`}>{getSLAStatus(selected).label}</p>
            </div>
          </div>

          {selected.status === 'RESOLVED' && selected.resolution && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider mb-1">Resolution</p>
              <p className="text-sm text-emerald-800">{selected.resolution}</p>
            </div>
          )}

          {selected.status !== 'RESOLVED' && (
            <div className="flex gap-3">
              <button
                onClick={() => escalate(selected.id)}
                disabled={escalating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300 text-amber-700 text-xs font-bold hover:bg-amber-50 transition-all disabled:opacity-60"
              >
                <ArrowUpCircle className="w-4 h-4" />
                {escalating ? 'Escalating...' : 'Escalate'}
              </button>
              <button
                onClick={() => resolve(selected.id)}
                disabled={resolving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-60"
              >
                <CheckCircle className="w-4 h-4" />
                {resolving ? 'Resolving...' : 'Mark Resolved'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

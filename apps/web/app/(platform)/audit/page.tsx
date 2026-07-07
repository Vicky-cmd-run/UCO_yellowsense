'use client';

import React, { useState } from 'react';
import { DEMO_AUDIT_EVENTS } from '@/services/DEMO_DATA';
import { Shield, Filter, Search, User, ArrowRight } from 'lucide-react';

const ACTION_STYLES: Record<string, string> = {
  LEAD_CREATED: 'bg-blue-100 text-blue-700',
  LEAD_STAGE_CHANGED: 'bg-amber-100 text-amber-700',
  VISIT_CHECKED_IN: 'bg-emerald-100 text-emerald-700',
  VISIT_COMPLETED: 'bg-emerald-100 text-emerald-700',
  MEETING_CREATED: 'bg-purple-100 text-purple-700',
  NBA_ACCEPTED: 'bg-indigo-100 text-indigo-700',
  COMPLAINT_ESCALATED: 'bg-red-100 text-red-700',
  CUSTOMER_PROFILE_VIEWED: 'bg-slate-100 text-slate-700',
};

export default function AuditPage() {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = DEMO_AUDIT_EVENTS.filter(ev => {
    const matchFilter = !filter || ev.action.includes(filter) || ev.entity_type === filter;
    const matchSearch = !search || ev.description.toLowerCase().includes(search.toLowerCase()) || ev.actor_name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#16263A] tracking-tight">Audit Trail</h1>
        <p className="text-[#6B7076] text-sm mt-1">Immutable log of all platform actions with before/after state captures</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7076]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by actor, description..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-medium text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F] placeholder:text-[#6B7076]"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-semibold text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]"
        >
          <option value="">All Actions</option>
          <option value="LEAD">Leads</option>
          <option value="VISIT">Visits</option>
          <option value="MEETING">Meetings</option>
          <option value="COMPLAINT">Complaints</option>
          <option value="Customer">Customers</option>
        </select>
      </div>

      <p className="text-xs font-semibold text-[#6B7076]">
        Showing <span className="font-extrabold text-[#16263A]">{filtered.length}</span> events
      </p>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-[#E8DAAE]" />
        <div className="space-y-4">
          {filtered.map((ev, i) => (
            <div key={ev.id} className="flex gap-5 items-start">
              {/* Timeline dot */}
              <div className="w-10 h-10 rounded-xl bg-[#FFFDF7] border border-[#E8DAAE] flex items-center justify-center shrink-0 z-10 shadow-sm">
                <Shield className="w-4 h-4 text-[#16263A]" />
              </div>

              <div className="flex-1 pb-4">
                <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${ACTION_STYLES[ev.action] || 'bg-gray-100 text-gray-700'}`}>
                      {ev.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] bg-[#E8DAAE] text-[#16263A] px-2 py-0.5 rounded-md font-bold">{ev.entity_type}</span>
                    <span className="text-[10px] text-[#6B7076] font-semibold ml-auto">{new Date(ev.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#16263A]">{ev.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <User className="w-3 h-3 text-[#6B7076]" />
                    <span className="text-xs text-[#6B7076] font-bold">{ev.actor_name}</span>
                    <span className="text-[10px] text-[#6B7076]">({ev.actor_id})</span>
                  </div>

                  {/* Before/After State */}
                  {(ev.before || ev.after) && (
                    <div className="mt-3 flex items-start gap-3 text-[10px]">
                      {ev.before && (
                        <div className="flex-1 bg-red-50 border border-red-100 rounded-lg p-2">
                          <p className="font-extrabold text-red-600 mb-1">BEFORE</p>
                          <pre className="text-red-700 whitespace-pre-wrap font-mono">{JSON.stringify(ev.before, null, 2)}</pre>
                        </div>
                      )}
                      {ev.before && ev.after && <ArrowRight className="w-4 h-4 text-[#6B7076] shrink-0 mt-4" />}
                      {ev.after && (
                        <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                          <p className="font-extrabold text-emerald-700 mb-1">AFTER</p>
                          <pre className="text-emerald-800 whitespace-pre-wrap font-mono">{JSON.stringify(ev.after, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

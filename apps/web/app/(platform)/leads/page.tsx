'use client';

import React, { useState, useEffect } from 'react';
import { DEMO_LEADS, DEMO_CUSTOMERS } from '@/services/DEMO_DATA';
import {
  Plus, Filter, LayoutGrid, List, ChevronRight, User,
  TrendingUp, Clock, ArrowRight, CheckCircle, XCircle, Target
} from 'lucide-react';

const STAGES = ['New', 'Contacted', 'In Progress', 'Proposal', 'Converted', 'Lost'];

const STAGE_STYLES: Record<string, { bg: string; border: string; header: string; dot: string }> = {
  'New': { bg: 'bg-slate-50', border: 'border-slate-200', header: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  'Contacted': { bg: 'bg-sky-50', border: 'border-sky-200', header: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
  'In Progress': { bg: 'bg-amber-50', border: 'border-amber-200', header: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  'Proposal': { bg: 'bg-purple-50', border: 'border-purple-200', header: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  'Converted': { bg: 'bg-emerald-50', border: 'border-emerald-200', header: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  'Lost': { bg: 'bg-red-50', border: 'border-red-200', header: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
};

const formatINR = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState(DEMO_LEADS);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [showCreate, setShowCreate] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState(DEMO_CUSTOMERS[0].id);
  const [newProduct, setNewProduct] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newSource, setNewSource] = useState('RM');
  const [movingLead, setMovingLead] = useState<string | null>(null);
  const [crossSellOnly, setCrossSellOnly] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('demo_zrt_created_leads') || '[]');
      if (stored.length > 0) {
        setLeads(prev => {
          const existingIds = new Set(prev.map(l => l.id));
          const newOnes = stored.filter((l: any) => !existingIds.has(l.id));
          return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
        });
      }
    } catch (e) {
      console.error('Could not load ZRT-created leads', e);
    }
  }, []);
  const customerById = React.useMemo(
    () => Object.fromEntries(DEMO_CUSTOMERS.map(c => [c.id, c])),
    []
  );
  const isCrossSell = (lead: typeof leads[number]) => {
    const cust = customerById[lead.customer_id];
    return !!(cust && cust.holdings && cust.holdings.length > 0);
  };
  const visibleLeads = crossSellOnly ? leads.filter(isCrossSell) : leads;

  const stageLeads = (stage: string) => visibleLeads.filter(l => l.stage === stage);
  const stageTotal = (stage: string) => stageLeads(stage).reduce((s, l) => s + l.potential_value, 0);

  const moveStage = (leadId: string, newStage: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    setMovingLead(null);
  };

  const handleCreate = () => {
    const cust = DEMO_CUSTOMERS.find(c => c.id === newCustomerId)!;
    const newLead = {
      id: `l${Date.now()}`,
      customer_id: newCustomerId,
      customer_name: cust.full_name,
      source: newSource,
      product: newProduct,
      potential_value: parseFloat(newValue) * 100000 || 1000000,
      stage: 'New',
      priority: 'MEDIUM',
      conversion_probability: 60,
      owner_id: 'u002',
      owner_name: 'Priya Nair',
      created_at: new Date().toISOString(),
      segment: cust.segment,
    };
    setLeads(prev => [newLead, ...prev]);
    setShowCreate(false);
    setNewProduct('');
    setNewValue('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16263A] tracking-tight">Lead Pipeline</h1>
          <p className="text-[#6B7076] text-sm mt-1">{visibleLeads.length} leads{crossSellOnly ? ' (cross-sell only)' : ''} · {formatINR(visibleLeads.filter(l => l.stage !== 'Lost').reduce((s, l) => s + l.potential_value, 0))} total potential value</p>        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('kanban')} className={`p-2 rounded-xl border text-xs font-bold transition-all ${view === 'kanban' ? 'bg-[#16263A] text-white border-[#16263A]' : 'border-[#E8DAAE] text-[#6B7076]'}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView('table')} className={`p-2 rounded-xl border text-xs font-bold transition-all ${view === 'table' ? 'bg-[#16263A] text-white border-[#16263A]' : 'border-[#E8DAAE] text-[#6B7076]'}`}>
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCrossSellOnly(v => !v)}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${crossSellOnly ? 'bg-[#F4A623] text-white border-[#F4A623]' : 'border-[#E8DAAE] text-[#6B7076]'}`}
          >
            <Target className="w-3.5 h-3.5" /> Cross-Sell Pipeline
          </button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-[#16263A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#16263A]/90 transition-all">
            <Plus className="w-3.5 h-3.5" /> Add Lead
          </button>

        </div>
      </div>

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const style = STAGE_STYLES[stage];
            const stageLds = stageLeads(stage);
            return (
              <div key={stage} className={`shrink-0 w-72 rounded-2xl border ${style.border} overflow-hidden`}>
                {/* Column Header */}
                <div className={`p-3 ${style.header} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <span className="text-xs font-extrabold uppercase tracking-wider">{stage}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold">{stageLds.length} leads</span>
                    {stageLds.length > 0 && <p className="text-[10px]">{formatINR(stageTotal(stage))}</p>}
                  </div>
                </div>

                {/* Cards */}
                <div className={`p-2 space-y-2 min-h-[100px] ${style.bg}`}>
                  {stageLds.length === 0 ? (
                    <div className="text-center py-6 text-[10px] text-[#6B7076] font-semibold">No leads in this stage</div>
                  ) : stageLds.map(lead => (
                    <div key={lead.id} className="bg-white border border-[#E8DAAE] rounded-xl p-3 shadow-sm hover:shadow-md transition-all">
                      <p className="text-xs font-extrabold text-[#16263A] line-clamp-1">{lead.customer_name}</p>
                      <p className="text-[10px] text-[#6B7076] mb-1 line-clamp-1">{lead.product}</p>
                      <p className="text-sm font-extrabold text-[#F4A623]">{formatINR(lead.potential_value)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${lead.priority === 'HIGH' ? 'bg-red-100 text-red-600' : lead.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                          {lead.priority}
                        </span>
                        <span className="text-[10px] text-[#6B7076] font-semibold">{lead.conversion_probability}% conv.</span>
                      </div>
                      {/* Stage Mover */}
                      {stage !== 'Converted' && stage !== 'Lost' && (
                        <div className="mt-2 pt-2 border-t border-[#E8DAAE] flex gap-1">
                          {STAGES.filter(s => s !== stage && s !== 'Lost').slice(0, 2).map(nextStage => (
                            <button
                              key={nextStage}
                              onClick={() => moveStage(lead.id, nextStage)}
                              className="flex-1 text-[9px] font-bold bg-[#FFF9ED] border border-[#E8DAAE] text-[#16263A] hover:bg-[#E8DAAE] px-1.5 py-1 rounded-lg transition-all truncate"
                            >
                              → {nextStage}
                            </button>
                          ))}
                          <button onClick={() => moveStage(lead.id, 'Lost')} className="text-[9px] font-bold text-red-500 hover:bg-red-50 px-1.5 py-1 rounded-lg transition-all border border-transparent hover:border-red-200">✕</button>
                        </div>
                      )}
                      <p className="text-[10px] text-[#6B7076] mt-1.5">{lead.owner_name} · {lead.source}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {view === 'table' && (
        <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8DAAE] bg-[#FFF9ED]">
                {['Customer', 'Product', 'Value', 'Stage', 'Priority', 'Probability', 'Owner', 'Source'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-[#6B7076] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DAAE]">
              {visibleLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-[#FFF9ED] transition-colors">
                  <td className="px-4 py-3 font-bold text-[#16263A] text-xs">{lead.customer_name}</td>
                  <td className="px-4 py-3 text-xs text-[#29313A]">{lead.product}</td>
                  <td className="px-4 py-3 font-extrabold text-[#F4A623] text-xs">{formatINR(lead.potential_value)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${STAGE_STYLES[lead.stage]?.header || 'bg-gray-100 text-gray-600'}`}>{lead.stage}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${lead.priority === 'HIGH' ? 'bg-red-100 text-red-600' : lead.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>{lead.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-[#16263A]">{lead.conversion_probability}%</td>
                  <td className="px-4 py-3 text-xs text-[#6B7076]">{lead.owner_name}</td>
                  <td className="px-4 py-3 text-xs text-[#6B7076]">{lead.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-extrabold text-[#16263A] mb-4">Add New Lead</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#6B7076] block mb-1">Customer</label>
                <select value={newCustomerId} onChange={e => setNewCustomerId(e.target.value)} className="w-full p-2.5 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-semibold text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]">
                  {DEMO_CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B7076] block mb-1">Product</label>
                <input value={newProduct} onChange={e => setNewProduct(e.target.value)} placeholder="e.g. MSME Expansion Loan" className="w-full p-2.5 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-medium text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B7076] block mb-1">Potential Value (₹ Lakhs)</label>
                <input type="number" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="e.g. 25" className="w-full p-2.5 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-medium text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B7076] block mb-1">Source</label>
                <select value={newSource} onChange={e => setNewSource(e.target.value)} className="w-full p-2.5 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-semibold text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]">
                  {['RM', 'ZRT', 'VRM', 'Campaign', 'Referral', 'Branch Walk-in'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-[#E8DAAE] text-xs font-bold text-[#6B7076] hover:bg-[#E8DAAE]/30 transition-all">Cancel</button>
                <button onClick={handleCreate} disabled={!newProduct || !newValue} className="flex-1 py-2.5 rounded-xl bg-[#16263A] text-white text-xs font-bold disabled:opacity-50 transition-all">Add Lead</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

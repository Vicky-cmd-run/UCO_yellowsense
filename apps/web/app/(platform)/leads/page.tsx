'use client';

import React, { useEffect, useState } from 'react';
import { useDemoStore } from '../../../stores/demoStore';
import { apiService } from '../../../services/api';
import {
  Briefcase, Plus, Search, Filter, RefreshCw, X, UserCheck,
  Calendar, CheckCircle, AlertTriangle, Play, CheckCircle2,
  DollarSign, ArrowRight, Kanban, ListFilter, ArrowLeftRight,
  TrendingUp, Clock, HelpCircle, Loader2
} from 'lucide-react';

interface LeadData {
  id: string;
  customer_id: string;
  source: string;
  product: string;
  potential_value: number;
  stage: string;
  owner_id: string | null;
  conversion_probability: number;
  priority: string;
  next_action: string | null;
  next_action_due_at: string | null;
  created_at: string;
  customer_name?: string;
}

interface UserListItem {
  id: string;
  employee_id: string;
  name: string;
  role: string;
}

interface CustomerListItem {
  id: string;
  full_name: string;
  segment: string;
  city: string;
}

export default function LeadPipelinePage() {
  const { networkStatus } = useDemoStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);

  // View state
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('ALL');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Create Lead Form state
  const [newCustomerId, setNewCustomerId] = useState('');
  const [newSource, setNewSource] = useState('FIELD_VISIT');
  const [newProduct, setNewProduct] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newOwnerId, setNewOwnerId] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);

  // Follow-up Form state
  const [followUpText, setFollowUpText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  // Pipeline Stages
  const stages = ['New', 'Contacted', 'In-Progress', 'Proposal', 'Converted', 'Lost'];

  // Load all workspace parameters
  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      const [leadsData, usersData, customersData] = await Promise.all([
        apiService.fetchLeads(),
        apiService.fetchUsers(),
        apiService.fetchCustomers()
      ]);
      setLeads(leadsData);
      setUsers(usersData);
      setCustomers(customersData);
    } catch (err) {
      console.error('Failed to load lead desk data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadWorkspaceData();
  }, [networkStatus]);

  // Handle stage change
  const handleStageChange = async (leadId: string, targetStage: string) => {
    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: targetStage } : l));
    try {
      await apiService.updateLeadStage(leadId, targetStage);
    } catch (err: any) {
      console.error(err);
      alert('Failed to update stage on server, rolling back...');
      loadWorkspaceData();
    }
  };

  // Handle owner assignment
  const handleOwnerChange = async (leadId: string, targetOwnerId: string) => {
    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, owner_id: targetOwnerId || null } : l));
    try {
      await apiService.assignLeadOwner(leadId, targetOwnerId);
      alert('Lead successfully re-routed!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to re-route owner: ' + err.message);
      loadWorkspaceData();
    }
  };

  // Handle schedule follow-up
  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !followUpText || !followUpDate) return;
    setSubmittingFollowUp(true);

    try {
      // Mock follow-up patch on frontend client
      setLeads(prev => prev.map(l => {
        if (l.id === selectedLeadId) {
          return {
            ...l,
            next_action: followUpText,
            next_action_due_at: new Date(followUpDate).toISOString()
          };
        }
        return l;
      }));

      // Simulate API lag
      await new Promise(r => setTimeout(r, 600));

      setShowFollowUpModal(false);
      setSelectedLeadId(null);
      setFollowUpText('');
      setFollowUpDate('');
      alert('Follow-up activity successfully registered!');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  // Create lead submission
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerId || !newProduct || !newValue) {
      alert('Please fill out required fields');
      return;
    }

    setSubmittingLead(true);
    try {
      const val = parseFloat(newValue);
      const owner = newOwnerId || null;
      await apiService.createLead(newCustomerId, newSource, newProduct, isNaN(val) ? 50000 : val, owner);
      
      setShowCreateModal(false);
      setNewCustomerId('');
      setNewProduct('');
      setNewValue('');
      setNewOwnerId('');
      
      // Reload leads
      loadWorkspaceData();
    } catch (err: any) {
      console.error(err);
      alert('Failed to ingest lead: ' + err.message);
    } finally {
      setSubmittingLead(false);
    }
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const custName = lead.customer_name?.toLowerCase() || '';
    const prodName = lead.product?.toLowerCase() || '';
    const matchesSearch = custName.includes(searchQuery.toLowerCase()) || prodName.includes(searchQuery.toLowerCase());
    
    if (ownerFilter === 'ALL') return matchesSearch;
    if (ownerFilter === 'UNASSIGNED') return !lead.owner_id && matchesSearch;
    return lead.owner_id === ownerFilter && matchesSearch;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Opportunity Lead Pipeline</h1>
          <p className="text-text-sub text-sm">
            Nurture pre-approved limits, manage drag-routing assignments, and track follow-up activities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex bg-surface border border-border-warm rounded-xl p-1">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'KANBAN' ? 'bg-yellow-acc/15 text-orange-acc' : 'text-text-sub hover:text-text-main'
              }`}
              title="Kanban Board view"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'TABLE' ? 'bg-yellow-acc/15 text-orange-acc' : 'text-text-sub hover:text-text-main'
              }`}
              title="Table view"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={loadWorkspaceData}
            className="p-2.5 border border-border-warm bg-surface hover:bg-bg-warm text-text-main rounded-xl transition duration-150 flex items-center gap-2 text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4 text-text-sub" />
            <span>Sync Board</span>
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-navy hover:bg-navy/90 text-white font-bold rounded-xl transition duration-150 flex items-center gap-2 text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ingest Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Options Desk */}
      <div className="premium-card bg-surface flex flex-wrap gap-4 items-center justify-between py-3.5">
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" />
            <input
              type="text"
              placeholder="Search customer or product..."
              className="pl-8 pr-3 py-1.5 bg-bg-warm border border-border-warm rounded-xl text-xs focus:outline-none w-full text-text-main font-semibold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="bg-bg-warm border border-border-warm rounded-xl px-2.5 py-1.5 text-xs text-text-main font-semibold focus:outline-none"
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
          >
            <option value="ALL">All Owners</option>
            <option value="UNASSIGNED">Unassigned</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-text-sub font-semibold">
          Showing <span className="font-bold text-navy">{filteredLeads.length}</span> active pipelines
        </div>
      </div>

      {/* VIEW PANEL */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-sub gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-orange-acc" />
          <span className="text-xs font-semibold">Loading pipeline desks...</span>
        </div>
      ) : viewMode === 'KANBAN' ? (
        /* KANBAN BOARD */
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage);
            
            return (
              <div key={stage} className="w-72 shrink-0 flex flex-col bg-bg-warm/40 border border-border-warm rounded-2xl p-3 h-[600px]">
                {/* Stage header */}
                <div className="flex justify-between items-center pb-2 mb-3 border-b border-border-warm">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-navy text-xs uppercase tracking-wide">{stage}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-navy/5 text-navy text-[10px] font-bold">
                      {stageLeads.length}
                    </span>
                  </div>
                  
                  <span className="text-[10px] font-bold text-success-acc">
                    {formatCurrency(stageLeads.reduce((acc, l) => acc + l.potential_value, 0))}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="h-28 border border-dashed border-border-warm rounded-2xl flex items-center justify-center text-[10px] text-text-sub italic">
                      No leads in {stage}
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const owner = users.find(u => u.id === lead.owner_id);
                      
                      return (
                        <div key={lead.id} className="bg-surface border border-border-warm rounded-2xl p-3.5 space-y-3 shadow-xs hover:shadow-md transition">
                          <div>
                            <div className="font-extrabold text-navy text-xs truncate">
                              {lead.customer_name || 'Prospect'}
                            </div>
                            <div className="text-[10px] text-text-sub font-semibold mt-0.5">
                              Product: <span className="text-navy">{lead.product}</span>
                            </div>
                          </div>

                          {/* Value & probability info */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-extrabold text-success-acc">
                              {formatCurrency(lead.potential_value)}
                            </span>
                            <span className="font-semibold text-navy">
                              {Math.round(lead.conversion_probability)}% probability
                            </span>
                          </div>

                          {/* Next follow up info */}
                          <div className="bg-bg-warm/60 border border-border-warm rounded-xl p-2 text-[10px] flex justify-between items-center">
                            <div className="min-w-0 pr-1.5">
                              <div className="text-text-sub font-semibold">Next Follow-Up</div>
                              <div className="text-navy font-bold truncate mt-0.5">
                                {lead.next_action || 'Not scheduled'}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedLeadId(lead.id);
                                setShowFollowUpModal(true);
                              }}
                              className="p-1 hover:bg-yellow-acc/10 text-orange-acc rounded transition shrink-0"
                              title="Schedule Action"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Owner Router dropdown */}
                          <div className="space-y-1">
                            <div className="text-[8px] text-text-sub uppercase font-bold tracking-wider">Owner / Re-Route</div>
                            <select
                              className="w-full bg-bg-warm border border-border-warm rounded-lg px-2 py-1 text-[10px] text-text-main font-semibold focus:outline-none"
                              value={lead.owner_id || ''}
                              onChange={(e) => handleOwnerChange(lead.id, e.target.value)}
                            >
                              <option value="">Unassigned</option>
                              {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Stage routing buttons */}
                          <div className="flex justify-between items-center pt-2 border-t border-border-warm/40">
                            <div className="text-[8px] text-text-sub uppercase font-bold tracking-wider">Update Stage</div>
                            <div className="flex gap-1">
                              {stages.map((stg) => {
                                if (stg === lead.stage) return null;
                                return (
                                  <button
                                    key={stg}
                                    onClick={() => handleStageChange(lead.id, stg)}
                                    className="px-1.5 py-0.5 bg-bg-warm hover:bg-yellow-acc/10 border border-border-warm hover:border-yellow-acc text-[8px] font-extrabold rounded text-navy transition"
                                    title={`Move to ${stg}`}
                                  >
                                    {stg[0]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW GRID */
        <div className="premium-card bg-surface overflow-x-auto p-0">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-bg-warm border-b border-border-warm text-navy font-bold">
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Product opportunity</th>
                <th className="p-3.5">Source Channel</th>
                <th className="p-3.5">Potential Value</th>
                <th className="p-3.5">Probability</th>
                <th className="p-3.5">Pipeline Stage</th>
                <th className="p-3.5">Owner RM</th>
                <th className="p-3.5">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-warm">
              {filteredLeads.map((lead) => {
                const owner = users.find(u => u.id === lead.owner_id);
                return (
                  <tr key={lead.id} className="hover:bg-bg-warm/30 transition text-text-main font-medium">
                    <td className="p-3.5 font-bold text-navy">{lead.customer_name || 'Prospect'}</td>
                    <td className="p-3.5">{lead.product}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-bg-warm border border-border-warm text-[10px] font-bold text-text-sub uppercase">
                        {lead.source.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-extrabold text-success-acc">{formatCurrency(lead.potential_value)}</td>
                    <td className="p-3.5">{Math.round(lead.conversion_probability)}%</td>
                    <td className="p-3.5">
                      <select
                        className="bg-bg-warm border border-border-warm rounded-xl px-2 py-1 text-xs text-text-main font-semibold focus:outline-none"
                        value={lead.stage}
                        onChange={(e) => handleStageChange(lead.id, e.target.value)}
                      >
                        {stages.map(stg => (
                          <option key={stg} value={stg}>{stg}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5">
                      <select
                        className="bg-bg-warm border border-border-warm rounded-xl px-2 py-1 text-xs text-text-main font-semibold focus:outline-none"
                        value={lead.owner_id || ''}
                        onChange={(e) => handleOwnerChange(lead.id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[120px] font-bold">{lead.next_action || 'None scheduled'}</span>
                        <button
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setShowFollowUpModal(true);
                          }}
                          className="text-orange-acc hover:underline font-bold"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Ingest Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border-warm rounded-2xl p-6 max-w-md w-full shadow-xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-bg-warm text-text-sub hover:text-text-main transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-navy mb-4">Ingest Opportunity Lead</h3>
            
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">Select Customer</label>
                <select
                  required
                  className="w-full px-3 py-2 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none text-text-main font-semibold"
                  value={newCustomerId}
                  onChange={(e) => setNewCustomerId(e.target.value)}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.segment}) - {c.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">Source Channel</label>
                  <select
                    className="w-full px-3 py-2 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none text-text-main font-semibold"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                  >
                    <option value="FIELD_VISIT">Field Visit</option>
                    <option value="TELEPHONE">Telephone call</option>
                    <option value="EMAIL">Email Marketing</option>
                    <option value="REFERRAL">Referral Campaign</option>
                    <option value="INBOUND">Inbound Inquiry</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">Owner RM</label>
                  <select
                    className="w-full px-3 py-2 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none text-text-main font-semibold"
                    value={newOwnerId}
                    onChange={(e) => setNewOwnerId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">Cross-Sell Product</label>
                <select
                  required
                  className="w-full px-3 py-2 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none text-text-main font-semibold"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                >
                  <option value="">-- Select Product --</option>
                  <option value="Working Capital Loan">Working Capital Loan</option>
                  <option value="Term Loan - Business Expansion">Term Loan - Business Expansion</option>
                  <option value="POS QR Merchant Stand">POS QR Merchant Stand</option>
                  <option value="Salary Premium Accounts bundle">Salary Premium Accounts bundle</option>
                  <option value="Commercial Business Insurance">Commercial Business Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">Potential Opportunity Value (INR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 250000"
                  className="w-full px-3 py-2 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none text-text-main font-semibold"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingLead}
                  className="w-full py-2.5 bg-navy hover:bg-navy/90 text-white font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2"
                >
                  {submittingLead ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Lead...</span>
                    </>
                  ) : (
                    <span>Add to Pipeline Board</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border-warm rounded-2xl p-6 max-w-sm w-full shadow-xl relative">
            <button
              onClick={() => {
                setShowFollowUpModal(false);
                setSelectedLeadId(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-bg-warm text-text-sub hover:text-text-main transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-navy mb-4 flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-orange-acc" />
              <span>Schedule Next Action Task</span>
            </h3>

            <form onSubmit={handleScheduleFollowUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">Action reminder note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call customer to review GST filings"
                  className="w-full px-3 py-2 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none text-text-main font-semibold"
                  value={followUpText}
                  onChange={(e) => setFollowUpText(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">Target date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none text-text-main font-semibold"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingFollowUp}
                  className="w-full py-2 bg-navy hover:bg-navy/90 text-white font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2"
                >
                  {submittingFollowUp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <span>Save Task Activity</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

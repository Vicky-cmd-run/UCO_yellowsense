'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api';
import {
  AlertTriangle, CheckCircle, ShieldAlert, Clock, Filter,
  RefreshCw, ArrowUpRight, Search, CheckCircle2, AlertCircle, PlayCircle
} from 'lucide-react';

interface Complaint {
  id: string;
  customer_id: string;
  category: string;
  severity: string;
  status: string;
  assigned_team: string | null;
  sla_due_at: string | null;
  sentiment: string;
  escalation_level: number;
  customer_name: string | null;
}

export default function ComplaintsQueuePage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Processing state for individual buttons
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadComplaints() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.fetchComplaints();
        setComplaints(data);
      } catch (err: any) {
        console.error('Failed to fetch complaints', err);
        setError(err.message || 'Failed to retrieve complaints data.');
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, [refreshTrigger]);

  const handleEscalate = async (complaint: Complaint) => {
    setUpdatingId(complaint.id);
    try {
      const nextLevel = complaint.escalation_level + 1;
      const nextTeam = nextLevel === 1 
        ? 'Regional Operations Desk' 
        : nextLevel === 2 
        ? 'Nodal Officer Committee' 
        : 'Principal Grievance Directorate';

      const updated = await apiService.updateComplaint(
        complaint.id,
        'ESCALATED',
        nextTeam,
        nextLevel
      );
      
      setComplaints(prev => prev.map(c => c.id === complaint.id ? updated : c));
    } catch (err: any) {
      console.error(err);
      alert('Failed to escalate complaint.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResolve = async (complaintId: string) => {
    setUpdatingId(complaintId);
    try {
      const updated = await apiService.updateComplaint(
        complaintId,
        'RESOLVED',
        null,
        0
      );
      setComplaints(prev => prev.map(c => c.id === complaintId ? updated : c));
    } catch (err: any) {
      console.error(err);
      alert('Failed to resolve complaint.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Calculations for KPI header cards
  const activeCount = complaints.filter(c => c.status !== 'RESOLVED').length;
  const criticalCount = complaints.filter(c => c.severity === 'CRITICAL' && c.status !== 'RESOLVED').length;
  const escalatedCount = complaints.filter(c => c.status === 'ESCALATED').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  const categories = Array.from(new Set(complaints.map(c => c.category)));

  // Filter complaints list
  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || c.severity === severityFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      (c.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.category?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.id?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSeverity && matchesCategory && matchesSearch;
  });

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-danger-acc/10 text-danger-acc border border-danger-acc/25';
      case 'HIGH':
        return 'bg-orange-acc/10 text-orange-acc border border-orange-acc/25';
      case 'MEDIUM':
        return 'bg-gold/25 text-navy border border-gold/40';
      default:
        return 'bg-navy/5 text-text-sub border border-border-warm';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
        return 'bg-success-acc/10 text-success-acc border border-success-acc/20';
      case 'ESCALATED':
        return 'bg-danger-acc text-white';
      default:
        return 'bg-yellow-acc/20 text-navy border border-yellow-acc/30';
    }
  };

  const formatSLATimeline = (slaStr: string | null) => {
    if (!slaStr) return 'N/A';
    const slaDate = new Date(slaStr);
    const now = new Date();
    const diffMs = slaDate.getTime() - now.getTime();
    const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));

    if (diffHrs < 0) {
      return (
        <span className="text-danger-acc font-bold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Breached by {Math.abs(diffHrs)} hrs
        </span>
      );
    }
    return (
      <span className="text-text-main font-semibold flex items-center gap-1">
        <Clock className="w-3.5 h-3.5 text-text-sub" />
        {diffHrs} hrs left
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Operational Service Desk</h1>
          <p className="text-text-sub text-sm mt-1">
            Track customer complaints, verify service levels (SLAs), and manage case resolutions.
          </p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-4 py-2 border border-border-warm hover:bg-surface text-navy font-bold rounded-xl transition flex items-center gap-2 shadow-sm bg-white"
        >
          <RefreshCw className="w-4 h-4 text-text-sub" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-card bg-surface border-l-4 border-l-orange-acc">
          <div className="flex justify-between items-center text-text-sub">
            <span className="text-xs font-bold uppercase tracking-wider">Active Complaints</span>
            <AlertTriangle className="w-4 h-4 text-orange-acc" />
          </div>
          <div className="mt-2 text-2xl font-black text-navy">{activeCount} Cases</div>
          <p className="text-[10px] text-text-sub mt-1">Require immediate assistance</p>
        </div>

        <div className="premium-card bg-surface border-l-4 border-l-danger-acc">
          <div className="flex justify-between items-center text-text-sub">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Breaches</span>
            <ShieldAlert className="w-4 h-4 text-danger-acc" />
          </div>
          <div className="mt-2 text-2xl font-black text-navy">{criticalCount} Cases</div>
          <p className="text-[10px] text-text-sub mt-1">Overdue or priority accounts</p>
        </div>

        <div className="premium-card bg-surface border-l-4 border-l-yellow-acc">
          <div className="flex justify-between items-center text-text-sub">
            <span className="text-xs font-bold uppercase tracking-wider">Escalated Internally</span>
            <ArrowUpRight className="w-4 h-4 text-orange-acc" />
          </div>
          <div className="mt-2 text-2xl font-black text-navy">{escalatedCount} Cases</div>
          <p className="text-[10px] text-text-sub mt-1">Routed to regional committees</p>
        </div>

        <div className="premium-card bg-surface border-l-4 border-l-success-acc">
          <div className="flex justify-between items-center text-text-sub">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved Today</span>
            <CheckCircle className="w-4 h-4 text-success-acc" />
          </div>
          <div className="mt-2 text-2xl font-black text-navy">{resolvedCount} Cases</div>
          <p className="text-[10px] text-text-sub mt-1">Cleared from operational backlog</p>
        </div>
      </div>

      {/* Filter and Content Card */}
      <div className="premium-card p-0 overflow-hidden flex flex-col">
        {/* Controls header */}
        <div className="p-4 border-b border-border-warm bg-surface/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 grow w-full md:max-w-xs relative">
            <Search className="w-4 h-4 text-text-sub absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, case ID..."
              className="w-full pl-9 pr-4 py-2 bg-bg-warm border border-border-warm rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-yellow-acc font-semibold"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end">
            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider">Status:</span>
              <select
                className="p-1.5 bg-bg-warm border border-border-warm rounded-lg text-xs font-semibold focus:outline-none"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="ESCALATED">Escalated</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider">Severity:</span>
              <select
                className="p-1.5 bg-bg-warm border border-border-warm rounded-lg text-xs font-semibold focus:outline-none"
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider">Category:</span>
              <select
                className="p-1.5 bg-bg-warm border border-border-warm rounded-lg text-xs font-semibold focus:outline-none"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-orange-acc" />
              <p className="text-text-sub text-sm font-semibold">Fetching operational backlog...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-16 text-center text-text-sub font-semibold text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-success-acc mx-auto" />
              <p>No complaints match the filter criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-warm/40 border-b border-border-warm text-[10px] font-extrabold text-navy uppercase tracking-wider">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Escalation</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-warm text-xs font-semibold">
                {filteredComplaints.map(complaint => (
                  <tr key={complaint.id} className="hover:bg-bg-warm/20 transition">
                    <td className="py-4 px-4 font-mono text-[10px] text-text-sub">
                      {complaint.id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-navy">{complaint.customer_name || 'Loading Name...'}</div>
                      <div className="text-[10px] text-text-sub mt-0.5">Sentiment: <span className="font-bold">{complaint.sentiment}</span></div>
                    </td>
                    <td className="py-4 px-4 text-text-main">
                      {complaint.category}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadgeClass(complaint.severity)}`}>
                        {complaint.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase ${getStatusBadgeClass(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {complaint.status === 'RESOLVED' ? (
                        <span className="text-text-sub">None</span>
                      ) : (
                        <div>
                          <div className="font-bold text-navy">Lvl {complaint.escalation_level}</div>
                          <div className="text-[9px] text-text-sub">{complaint.assigned_team || 'Branch Executive'}</div>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {complaint.status === 'RESOLVED' ? (
                        <span className="text-success-acc flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolved
                        </span>
                      ) : (
                        formatSLATimeline(complaint.sla_due_at)
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {complaint.status !== 'RESOLVED' && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEscalate(complaint)}
                            disabled={updatingId === complaint.id}
                            className="px-2 py-1 bg-yellow-acc/10 hover:bg-yellow-acc/25 border border-yellow-acc/40 text-orange-acc text-[10px] font-bold rounded-lg transition disabled:opacity-50"
                          >
                            Escalate
                          </button>
                          <button
                            onClick={() => handleResolve(complaint.id)}
                            disabled={updatingId === complaint.id}
                            className="px-2 py-1 bg-success-acc text-white text-[10px] font-bold rounded-lg hover:bg-success-acc/95 transition disabled:opacity-50"
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api';
import {
  History, User, Database, Layers, Search, RefreshCw,
  Clock, ShieldCheck, ChevronDown, CheckCircle, FileText
} from 'lucide-react';

interface AuditEvent {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_state: string | null;
  after_state: string | null;
  timestamp: string;
}

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters
  const [actorFilter, setActorFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Expand state for before/after details
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAuditLogs() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.fetchAuditTrail(actorFilter, entityFilter, actionFilter);
        setLogs(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to retrieve governance audit logs.');
      } finally {
        setLoading(false);
      }
    }
    loadAuditLogs();
  }, [refreshTrigger, actorFilter, entityFilter, actionFilter]);

  const formatTimestamp = (tsStr: string) => {
    return new Date(tsStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadgeClass = (action: string) => {
    const act = action?.toUpperCase();
    if (act.includes('DELETE') || act.includes('REMOVE')) {
      return 'bg-danger-acc/10 text-danger-acc border border-danger-acc/20';
    } else if (act.includes('CREATE') || act.includes('ADD') || act.includes('SCHEDULED')) {
      return 'bg-success-acc/10 text-success-acc border border-success-acc/20';
    } else if (act.includes('UPDATE') || act.includes('ROUTED')) {
      return 'bg-yellow-acc/25 text-navy border border-yellow-acc/35';
    }
    return 'bg-navy/5 text-text-sub border border-border-warm';
  };

  const formatJSONState = (stateStr: string | null) => {
    if (!stateStr) return 'N/A';
    try {
      // Check if it's stringified JSON
      const parsed = JSON.parse(stateStr);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return stateStr;
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'customer':
        return <User className="w-3.5 h-3.5 text-orange-acc" />;
      case 'meeting':
        return <Clock className="w-3.5 h-3.5 text-gold" />;
      case 'complaint':
        return <ShieldCheck className="w-3.5 h-3.5 text-danger-acc" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-navy" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Audit & Governance Trail</h1>
          <p className="text-text-sub text-sm mt-1">
            Tamper-evident logs monitoring user actions, entity mutation histories, and compliance operations.
          </p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-4 py-2 border border-border-warm hover:bg-surface text-navy font-bold rounded-xl transition flex items-center gap-2 shadow-sm bg-white"
        >
          <RefreshCw className="w-4 h-4 text-text-sub animate-hover" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="premium-card bg-surface flex justify-between items-center">
          <div>
            <span className="text-[10px] text-text-sub font-bold uppercase tracking-wider block">Audited Transactions</span>
            <span className="text-2xl font-extrabold text-navy block mt-1">{logs.length} Actions</span>
          </div>
          <Database className="w-8 h-8 text-yellow-acc" />
        </div>

        <div className="premium-card bg-surface flex justify-between items-center">
          <div>
            <span className="text-[10px] text-text-sub font-bold uppercase tracking-wider block">Unique System Actors</span>
            <span className="text-2xl font-extrabold text-navy block mt-1">
              {Array.from(new Set(logs.map(l => l.actor_id))).length} Users
            </span>
          </div>
          <User className="w-8 h-8 text-orange-acc" />
        </div>

        <div className="premium-card bg-surface flex justify-between items-center">
          <div>
            <span className="text-[10px] text-text-sub font-bold uppercase tracking-wider block">Monitored Entities</span>
            <span className="text-2xl font-extrabold text-navy block mt-1">
              {Array.from(new Set(logs.map(l => l.entity_type))).length} Object Types
            </span>
          </div>
          <Layers className="w-8 h-8 text-navy" />
        </div>
      </div>

      {/* Filter panel */}
      <div className="premium-card p-4 bg-surface/50 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-navy uppercase tracking-wider">Actor ID:</span>
            <input
              type="text"
              placeholder="e.g. RM001, ZRT002"
              className="p-1.5 bg-bg-warm border border-border-warm rounded-lg text-xs font-semibold focus:outline-none w-32 text-text-main"
              value={actorFilter}
              onChange={e => setActorFilter(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-navy uppercase tracking-wider">Entity Type:</span>
            <select
              className="p-1.5 bg-bg-warm border border-border-warm rounded-lg text-xs font-semibold focus:outline-none"
              value={entityFilter}
              onChange={e => setEntityFilter(e.target.value)}
            >
              <option value="">All Entities</option>
              <option value="Customer">Customer</option>
              <option value="Lead">Lead</option>
              <option value="Visit">Visit</option>
              <option value="Meeting">Meeting</option>
              <option value="Complaint">Complaint</option>
              <option value="Query">Query</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-navy uppercase tracking-wider">Action:</span>
            <select
              className="p-1.5 bg-bg-warm border border-border-warm rounded-lg text-xs font-semibold focus:outline-none"
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
              <option value="MEETING_INTELLIGENCE_GENERATED">Meeting Intel Generated</option>
              <option value="COMPLAINT_UPDATED">Complaint Updated</option>
              <option value="QUERY_ROUTED">Query Routed</option>
              <option value="CREATE_LEAD">Lead Created</option>
              <option value="CREATE_VISIT">Visit Scheduled</option>
            </select>
          </div>
        </div>

        {(actorFilter || entityFilter || actionFilter) && (
          <button
            onClick={() => {
              setActorFilter('');
              setEntityFilter('');
              setActionFilter('');
            }}
            className="text-xs text-orange-acc hover:underline font-bold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Logs Table / Timeline */}
      <div className="premium-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-acc" />
            <p className="text-text-sub text-sm font-semibold">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-text-sub font-semibold text-xs space-y-2">
            <History className="w-8 h-8 text-text-sub mx-auto" />
            <p>No audit trail logs found matching search criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-warm">
            {logs.map(log => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div key={log.id} className="p-4 hover:bg-bg-warm/10 transition">
                  {/* Row Summary */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex items-start md:items-center gap-4">
                      {/* Circle dot icon */}
                      <div className="w-8 h-8 rounded-full bg-bg-warm flex items-center justify-center border border-border-warm shrink-0">
                        {getEntityIcon(log.entity_type)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getActionBadgeClass(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-[10px] text-text-sub font-bold">
                            Actor: <strong className="text-navy">{log.actor_id}</strong>
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-text-main">
                          Modified {log.entity_type} <span className="font-mono text-[10px] text-text-sub">({log.entity_id.substring(0,8)}...)</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end text-right">
                      <span className="text-[10px] text-text-sub font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimestamp(log.timestamp)}
                      </span>

                      {(log.before_state || log.after_state) && (
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="p-1 border border-border-warm hover:border-yellow-acc rounded-lg hover:bg-white text-text-sub hover:text-navy transition"
                          title="View State Diff"
                        >
                          <ChevronDown className={`w-4 h-4 transition duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded JSON diff states */}
                  {isExpanded && (log.before_state || log.after_state) && (
                    <div className="mt-4 pt-3 border-t border-dashed border-border-warm grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div>
                        <span className="text-[9px] font-bold text-text-sub uppercase tracking-wider block mb-1">Before State</span>
                        <pre className="p-3 bg-bg-warm/40 border border-border-warm rounded-xl text-[10px] font-mono text-text-main overflow-x-auto whitespace-pre-wrap max-h-48">
                          {formatJSONState(log.before_state)}
                        </pre>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold text-text-sub uppercase tracking-wider block mb-1">After State</span>
                        <pre className="p-3 bg-bg-warm/40 border border-border-warm rounded-xl text-[10px] font-mono text-text-main overflow-x-auto whitespace-pre-wrap max-h-48">
                          {formatJSONState(log.after_state)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

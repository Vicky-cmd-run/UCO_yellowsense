'use client';

import React, { useEffect, useState } from 'react';
import { useDemoStore, type DemoUser } from '../../../stores/demoStore';
import { apiService } from '../../../services/api';
import { db } from '../../../services/db';
import {
  Settings, User, Shield, Wifi, RefreshCw, AlertTriangle,
  Server, Key, Sliders, Database, Layers, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function SettingsPage() {
  const {
    activeUser, setActiveUser, networkStatus, setNetworkStatus,
    pendingSyncCount, setPendingSyncCount
  } = useDemoStore();

  const [users, setUsers] = useState<DemoUser[]>([]);
  const [syncQueueCount, setSyncQueueCount] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [copilotModel, setCopilotModel] = useState('decisioning-propensity-v2');
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await apiService.fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch user profiles for setting switcher', err);
      }
    }
    loadUsers();

    async function loadQueue() {
      const cnt = await db.syncQueue.count();
      setSyncQueueCount(cnt);
    }
    loadQueue();
  }, [pendingSyncCount]);

  const handleRoleChange = (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      setActiveUser(selected);
    }
  };

  const handleResetDemo = async () => {
    if (confirm('Are you sure you want to reset all demo database parameters back to initial state?')) {
      setResetting(true);
      try {
        await apiService.resetDemo();
        alert('Database successfully reset!');
        window.location.reload();
      } catch (err: any) {
        console.error(err);
        alert('Reset failed: ' + (err.message || 'unknown error'));
      } finally {
        setResetting(false);
      }
    }
  };

  const clearOfflineQueue = async () => {
    if (confirm('This will delete all local pending offline mutations. Are you sure?')) {
      await db.syncQueue.clear();
      setPendingSyncCount(0);
      setSyncQueueCount(0);
      alert('Local sync queue cleared!');
    }
  };

  if (!activeUser) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">System Settings & Configurations</h1>
        <p className="text-text-sub text-sm mt-1">
          Manage your employee account details, configure simulator parameters, and trigger database actions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: User Profile Details */}
        <div className="premium-card space-y-6">
          <div className="flex flex-col items-center text-center p-4 border-b border-border-warm pb-6">
            <div className="w-16 h-16 rounded-2xl bg-navy text-white flex items-center justify-center font-extrabold text-lg shadow-md mb-3">
              {activeUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 className="font-extrabold text-navy text-base">{activeUser.name}</h2>
            <span className="px-2.5 py-0.5 bg-orange-acc/10 text-orange-acc text-[10px] font-black uppercase rounded-lg border border-orange-acc/20 mt-1">
              {activeUser.role.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-4 text-xs font-semibold text-text-main">
            <div className="flex justify-between">
              <span className="text-text-sub">Employee ID</span>
              <span className="font-mono text-navy">{activeUser.employee_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-sub">Email Address</span>
              <span className="text-navy">{activeUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-sub">Assigned Branch</span>
              <span className="text-navy">{activeUser.branch_id || 'Regional Headquarters'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-sub">Region</span>
              <span className="text-navy">{activeUser.region_id || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-sub">System Status</span>
              <span className="text-success-acc flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Session
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns: Configuration categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Simulation & Demo controls */}
          <div className="premium-card space-y-4">
            <div className="pb-3 border-b border-border-warm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-acc" />
              <h3 className="font-extrabold text-navy text-sm">Demo Persona Switcher</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1.5">
                  Change Active Profile
                </label>
                <select
                  className="w-full p-2.5 bg-bg-warm border border-border-warm rounded-xl text-xs font-bold text-text-main focus:outline-none"
                  value={activeUser.id}
                  onChange={e => handleRoleChange(e.target.value)}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-text-sub font-medium block mt-1.5 leading-relaxed">
                  Switching profiles updates your workspace permissions, navigation sidebar, and local telemetry filters.
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1.5">
                  Database Reset
                </label>
                <button
                  onClick={handleResetDemo}
                  disabled={resetting}
                  className="w-full py-2.5 px-4 bg-danger-acc/10 hover:bg-danger-acc/20 border border-danger-acc/30 text-danger-acc text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {resetting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Database className="w-3.5 h-3.5" />
                  )}
                  <span>{resetting ? 'Resetting DB...' : 'Reset Demo Parameters'}</span>
                </button>
                <span className="text-[10px] text-text-sub font-medium block mt-1.5 leading-relaxed">
                  Wipes all modifications, visits completed offline, or scheduled meetings, restoring seed parameters.
                </span>
              </div>
            </div>
          </div>

          {/* Network & Offline caching configurations */}
          <div className="premium-card space-y-4">
            <div className="pb-3 border-b border-border-warm flex items-center gap-2">
              <Wifi className="w-4 h-4 text-gold" />
              <h3 className="font-extrabold text-navy text-sm">Offline Mode & Telemetry Simulator</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-navy uppercase tracking-wider block">Network Connectivity Status</span>
                <div className="flex gap-2">
                  {(['Online', 'Slow', 'Offline'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setNetworkStatus(status)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                        networkStatus === status
                          ? status === 'Offline'
                            ? 'bg-danger-acc/10 text-danger-acc border-danger-acc/30'
                            : 'bg-success-acc/10 text-success-acc border-success-acc/30'
                          : 'bg-bg-warm border-border-warm hover:bg-surface text-text-sub'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-text-sub font-medium leading-relaxed">
                  Toggling "Offline" forces Dexie IndexedDB caching for scheduled customer visits, lead creations, and logs.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-navy uppercase tracking-wider block">Sync Backlog queue</span>
                <div className="flex justify-between items-center p-3 bg-bg-warm/50 border border-border-warm rounded-xl">
                  <div>
                    <span className="text-[10px] text-text-sub font-bold block uppercase">Pending Mutations</span>
                    <span className="font-extrabold text-navy text-sm block mt-0.5">{syncQueueCount} Requests</span>
                  </div>
                  {syncQueueCount > 0 && (
                    <button
                      onClick={clearOfflineQueue}
                      className="px-2 py-1 bg-danger-acc text-white text-[10px] font-bold rounded-lg hover:bg-danger-acc/95 transition"
                    >
                      Purge
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-text-sub font-medium leading-relaxed">
                  Mutations automatically sync when restoring connections to "Online".
                </p>
              </div>
            </div>
          </div>

          {/* AI Copilot & NLP model configuration */}
          <div className="premium-card space-y-4">
            <div className="pb-3 border-b border-border-warm flex items-center gap-2">
              <Key className="w-4 h-4 text-navy" />
              <h3 className="font-extrabold text-navy text-sm">Copilot Model Policies</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1.5">
                  AI Model Endpoint
                </label>
                <select
                  className="w-full p-2.5 bg-bg-warm border border-border-warm rounded-xl text-xs font-semibold text-text-main focus:outline-none"
                  value={copilotModel}
                  onChange={e => setCopilotModel(e.target.value)}
                >
                  <option value="decisioning-propensity-v2">Next Best Action Propensity v2.1</option>
                  <option value="lead-scoring-xgboost">Lead Scoring XGBoost v1.4</option>
                  <option value="generic-gpt-4o">General Advisory GPT-4o (Fallback)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1.5">
                  Confidence Filter Limit ({confidenceThreshold}%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    className="w-full accent-navy"
                    value={confidenceThreshold}
                    onChange={e => setConfidenceThreshold(Number(e.target.value))}
                  />
                </div>
                <span className="text-[10px] text-text-sub font-medium block mt-1.5">
                  Suppresses recommendations scoring below the selected confidence threshold.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

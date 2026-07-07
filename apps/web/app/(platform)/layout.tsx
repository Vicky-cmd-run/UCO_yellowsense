'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useDemoStore, type DemoUser } from '../../stores/demoStore';
import { apiService } from '../../services/api';
import { synchronizeOfflineQueue } from '../../services/sync';
import { db } from '../../services/db';
import {
  LayoutDashboard, Users, MapPin, Briefcase, Calendar,
  AlertTriangle, Bot, BarChart3, History, Settings, LogOut,
  Search, Bell, Wifi, WifiOff, RefreshCw, ChevronDown, CheckCircle, AlertCircle
} from 'lucide-react';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    activeUser, setActiveUser, networkStatus, setNetworkStatus,
    pendingSyncCount, setPendingSyncCount, logout
  } = useDemoStore();

  const [users, setUsers] = useState<DemoUser[]>([]);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ processed: 0, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync queue count updater
  const updateQueueCount = async () => {
    const count = await db.syncQueue.count();
    setPendingSyncCount(count);
  };

  useEffect(() => {
    if (!activeUser) {
      router.push('/login');
      return;
    }

    updateQueueCount();

    // Fetch users for switcher
    async function loadDemoUsers() {
      try {
        const data = await apiService.fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load demo users', err);
      }
    }
    loadDemoUsers();

    // Fetch alerts/notifications
    async function loadNotifications() {
      try {
        const alerts = await apiService.fetchNotifications();
        setNotifications(alerts.slice(0, 5));
      } catch (err) {
        console.error('Failed to load alerts', err);
      }
    }
    loadNotifications();
  }, [activeUser, router]);

  // Click outside to close role switcher
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoleSwitcher(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync handler when network toggled back to Online
  const handleNetworkChange = async (status: 'Online' | 'Slow' | 'Offline') => {
    setNetworkStatus(status);
    if (status === 'Online') {
      setSyncing(true);
      await synchronizeOfflineQueue((proc, tot) => {
        setSyncProgress({ processed: proc, total: tot });
      });
      setSyncing(false);
      setSyncProgress({ processed: 0, total: 0 });
      updateQueueCount();
    }
  };

  const handleRoleSwitch = (targetUser: DemoUser) => {
    setActiveUser(targetUser);
    setShowRoleSwitcher(false);
    
    // Auto navigation depending on active role
    if (targetUser.role === 'ZRT_OFFICER') {
      router.push('/zrt');
    } else if (targetUser.role === 'RM') {
      router.push('/rm');
    } else if (targetUser.role === 'VRM') {
      router.push('/vrm');
    } else {
      router.push('/executive');
    }
  };

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length > 1) {
      try {
        const results = await apiService.fetchCustomers(val);
        setSearchResults(results.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleResetDemo = async () => {
    if (confirm('Are you sure you want to reset all demo database parameters back to initial state?')) {
      try {
        await apiService.resetDemo();
        alert('Database successfully reset!');
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Reset endpoint failed. Attempting offline reset...');
        window.location.reload();
      }
    }
  };

  const menuItems = [
    { name: 'Command Center', icon: LayoutDashboard, path: '/executive', roles: ['BRANCH_MANAGER', 'REGIONAL_MANAGER', 'HEAD_OFFICE', 'ADMIN'] },
    { name: 'Customer 360', icon: Users, path: '/customers', roles: ['RM', 'VRM', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'HEAD_OFFICE', 'ADMIN'] },
    { name: 'ZRT Field Desk', icon: MapPin, path: '/zrt', roles: ['ZRT_OFFICER', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'HEAD_OFFICE', 'ADMIN'] },
    { name: 'RM Workspace', icon: Briefcase, path: '/rm', roles: ['RM', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'HEAD_OFFICE', 'ADMIN'] },
    { name: 'VRM Desk', icon: Users, path: '/vrm', roles: ['VRM', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'HEAD_OFFICE', 'ADMIN'] },
    { name: 'Lead Pipeline', icon: Briefcase, path: '/leads', roles: ['RM', 'VRM', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'HEAD_OFFICE', 'ADMIN'] },
    { name: 'Meetings Intel', icon: Calendar, path: '/meetings', roles: ['RM', 'VRM', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'HEAD_OFFICE', 'ADMIN'] },
    { name: 'Complaints Queue', icon: AlertTriangle, path: '/complaints', roles: ['RM', 'VRM', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'HEAD_OFFICE', 'ADMIN'] },
    { name: 'AI Copilot', icon: Bot, path: '/ai-copilot', roles: ['RM', 'VRM', 'ZRT_OFFICER', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'HEAD_OFFICE', 'ADMIN'] },
    { name: 'Analytics & MIS', icon: BarChart3, path: '/analytics', roles: ['BRANCH_MANAGER', 'REGIONAL_MANAGER', 'HEAD_OFFICE', 'ADMIN'] },
    { name: 'Audit & Governance', icon: History, path: '/audit', roles: ['BRANCH_MANAGER', 'REGIONAL_MANAGER', 'HEAD_OFFICE', 'ADMIN'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['RM', 'VRM', 'ZRT_OFFICER', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'HEAD_OFFICE', 'ADMIN'] }
  ];

  const visibleMenuItems = menuItems.filter(item => activeUser && item.roles.includes(activeUser.role));

  if (!activeUser) return null;

  return (
    <div className="flex h-screen bg-bg-warm overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-surface border-r border-border-warm flex flex-col justify-between shrink-0 h-full relative z-20">
        <div className="flex flex-col overflow-y-auto grow">
          {/* Logo */}
          <div className="p-6 border-b border-border-warm flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-acc flex items-center justify-center font-bold text-navy text-sm shadow-sm relative">
              YS
              <div className="absolute -inset-1 rounded-full border border-orange-acc/20 animate-pulse"></div>
            </div>
            <div>
              <div className="font-extrabold text-navy text-sm leading-tight">YellowSense C360</div>
              <div className="text-[10px] text-text-sub font-semibold tracking-wide uppercase">Unified Customer Desk</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 grow">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition duration-150 ${
                    isActive
                      ? 'bg-yellow-acc/10 text-orange-acc border-l-2 border-orange-acc'
                      : 'text-text-main hover:bg-bg-warm'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-acc' : 'text-text-sub'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Role Switcher & Network Controls) */}
        <div className="p-4 border-t border-border-warm bg-bg-warm/40 space-y-3">
          {/* Network Control */}
          <div className="flex items-center justify-between bg-surface border border-border-warm rounded-xl p-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-main">
              {networkStatus === 'Offline' ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-danger-acc" />
                  <span>Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-success-acc" />
                  <span>{networkStatus}</span>
                </>
              )}
            </div>
            <div className="flex gap-1">
              {(['Online', 'Slow', 'Offline'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleNetworkChange(status)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold transition ${
                    networkStatus === status
                      ? (status === 'Offline' ? 'bg-danger-acc/20 text-danger-acc' : 'bg-success-acc/20 text-success-acc')
                      : 'hover:bg-border-warm text-text-sub'
                  }`}
                >
                  {status[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Sync Progress / Telemetry */}
          {pendingSyncCount > 0 && (
            <div className="bg-surface border border-border-warm rounded-xl p-2 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-navy">
                <span>Pending Sync</span>
                <span>{pendingSyncCount} drafts</span>
              </div>
              {syncing && (
                <div className="space-y-1">
                  <div className="w-full bg-border-warm rounded-full h-1">
                    <div
                      className="bg-success-acc h-1 rounded-full transition-all duration-300"
                      style={{ width: `${(syncProgress.processed / syncProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-text-sub text-right">
                    Syncing {syncProgress.processed}/{syncProgress.total}...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User profile dropdown & switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="w-full flex items-center justify-between p-2.5 bg-surface border border-border-warm rounded-xl hover:border-yellow-acc transition text-left"
            >
              <div className="min-w-0">
                <div className="font-extrabold text-navy text-xs truncate">{activeUser.name}</div>
                <div className="text-[10px] text-text-sub font-semibold tracking-wide uppercase mt-0.5">
                  {activeUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-text-sub shrink-0" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface border border-border-warm rounded-xl shadow-lg p-1.5 space-y-0.5 max-h-48 overflow-y-auto">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleRoleSwitch(u)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition ${
                      activeUser.id === u.id
                        ? 'bg-yellow-acc/10 text-orange-acc font-bold'
                        : 'hover:bg-bg-warm text-text-main'
                    }`}
                  >
                    <div>{u.name}</div>
                    <div className="text-[9px] text-text-sub font-semibold uppercase tracking-wide">{u.role.replace('_', ' ')}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Developer Reset control */}
          <button
            onClick={handleResetDemo}
            className="w-full py-2 px-3 border border-dashed border-border-warm hover:border-orange-acc hover:text-orange-acc text-text-sub text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* TOP BAR */}
        <header className="h-16 bg-surface border-b border-border-warm flex items-center justify-between px-6 shrink-0 z-10">
          {/* Global search */}
          <div className="w-80 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-acc text-text-main"
                placeholder="Search customers, numbers, mobile..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {/* Search autocomplete */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-warm rounded-xl shadow-lg p-1.5 space-y-0.5 z-50">
                {searchResults.map((cust) => (
                  <button
                    key={cust.id}
                    onClick={() => {
                      router.push(`/customers/${cust.id}`);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 hover:bg-bg-warm rounded-lg text-xs flex justify-between"
                  >
                    <div>
                      <div className="font-bold text-navy">{cust.full_name}</div>
                      <div className="text-[10px] text-text-sub">{cust.customer_number} • {cust.city}</div>
                    </div>
                    <div className="text-[10px] font-bold text-orange-acc uppercase self-center">{cust.segment}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick action tools */}
          <div className="flex items-center gap-4">
            {/* AI Copilot Quick Launch */}
            <Link
              href="/ai-copilot"
              className="px-3 py-1.5 bg-yellow-acc/10 hover:bg-yellow-acc/20 border border-yellow-acc/30 text-orange-acc text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Copilot</span>
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 border border-border-warm hover:bg-bg-warm rounded-xl transition relative"
              >
                <Bell className="w-4 h-4 text-text-main" />
                {notifications.length > 0 && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger-acc"></div>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-1.5 w-80 bg-surface border border-border-warm rounded-xl shadow-lg p-3 space-y-2 z-50">
                  <div className="font-extrabold text-navy text-xs uppercase tracking-wider pb-1.5 border-b border-border-warm flex justify-between">
                    <span>Active Alerts</span>
                    <span className="text-[10px] text-text-sub font-semibold">{notifications.length} alerts</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((alert) => (
                      <div key={alert.id} className="p-2 rounded-lg bg-bg-warm/50 border border-border-warm text-xs flex gap-2">
                        {alert.severity === 'CRITICAL' ? (
                          <AlertCircle className="w-4 h-4 text-danger-acc shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-warning-acc shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold text-navy">{alert.title}</div>
                          <div className="text-text-sub mt-0.5">{alert.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <div className="font-extrabold text-navy text-sm">{activeUser.name}</div>
                <div className="text-[10px] text-text-sub font-semibold uppercase tracking-wide">
                  {activeUser.role.replace('_', ' ')}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {activeUser.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="p-2 border border-border-warm hover:bg-danger-acc/10 hover:border-danger-acc/20 rounded-xl transition text-text-sub hover:text-danger-acc"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT ROUTER */}
        <main className="flex-1 overflow-y-auto p-8 relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}

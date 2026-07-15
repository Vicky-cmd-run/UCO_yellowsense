'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '../../../stores/demoStore';
import { apiService } from '../../../services/api';
import { ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

function getRouteForRole(role: string) {
  switch (role) {
    case 'ZRT_OFFICER': return '/zrt';
    case 'RM': return '/rm';
    case 'VRM': return '/vrm';
    case 'BRANCH_MANAGER':
    case 'REGIONAL_MANAGER':
    case 'HEAD_OFFICE':
    case 'ADMIN':
    default: return '/executive';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { setActiveUser, setAccessToken, activeUser } = useDemoStore();
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, go to command center
    if (activeUser) {
      router.push(getRouteForRole(activeUser.role));
      return;
    }

    // Fetch demo users to show role switcher buttons
    async function loadDemoUsers() {
      try {
        const data = await apiService.fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load demo users, fallback list used', err);
        // Fallback demo users if api is starting
        setUsers([
          { id: '1', name: 'Arjun Rao', role: 'ZRT_OFFICER', email: 'arjun.rao@yellowsensebank.com', employee_id: 'ZRT001' },
          { id: '2', name: 'Priya Nair', role: 'RM', email: 'priya.nair@yellowsensebank.com', employee_id: 'RM001' },
          { id: '3', name: 'Vikram Shah', role: 'VRM', email: 'vikram.shah@yellowsensebank.com', employee_id: 'VRM001' },
          { id: '4', name: 'Meera Iyer', role: 'BRANCH_MANAGER', email: 'meera.iyer@yellowsensebank.com', employee_id: 'BM001' },
          { id: '5', name: 'Rahul Menon', role: 'REGIONAL_MANAGER', email: 'rahul.menon@yellowsensebank.com', employee_id: 'RH001' },
          { id: '6', name: 'Ananya Kapoor', role: 'HEAD_OFFICE', email: 'ananya.kapoor@yellowsensebank.com', employee_id: 'HO001' }
        ]);
      }
    }
    loadDemoUsers();
  }, [activeUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // await apiService.login(email, password);
      // router.push('/executive');
      const data = await apiService.login(email, password);
      router.push(getRouteForRole(data.user.role));
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (user: any) => {
    setLoading(true);
    setError('');
    try {
      await apiService.login(user.email, 'password123');
      router.push(getRouteForRole(user.role));
    } catch (err: any) {
      // Fallback local auth bypass for frontend development
      console.warn('Backend login failed, logging in locally:', err);
      setAccessToken('mock-token');
      setActiveUser(user);
      router.push('/executive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-warm px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-surface border border-border-warm p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-acc"></div>
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-yellow-acc/10 flex items-center justify-center text-orange-acc">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-navy">YellowSense C360</h2>
          <p className="mt-2 text-sm text-text-sub">Unified AI Customer Growth & Field Mobilization</p>
        </div>

        {error && (
          <div className="bg-danger-acc/10 border border-danger-acc/20 text-danger-acc text-sm rounded-xl p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-navy">Email or Employee ID</label>
              <input
                id="email"
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 bg-bg-warm border border-border-warm rounded-xl text-text-main focus:outline-none focus:ring-1 focus:ring-yellow-acc"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya.nair@yellowsensebank.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-navy">Password</label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 bg-bg-warm border border-border-warm rounded-xl text-text-main focus:outline-none focus:ring-1 focus:ring-yellow-acc"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-navy hover:bg-navy/90 text-white font-bold rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-warm">
          <p className="text-xs font-semibold text-text-sub text-center uppercase tracking-wider mb-4">Demo Personas (One-Click Login)</p>
          <div className="grid grid-cols-2 gap-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleDemoLogin(user)}
                disabled={loading}
                className="p-3 border border-border-warm bg-bg-warm hover:bg-yellow-acc/10 hover:border-yellow-acc rounded-xl text-left transition duration-150 text-xs flex flex-col justify-between shrink-0"
              >
                <div className="font-bold text-navy flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-orange-acc" />
                  <span>{user.name}</span>
                </div>
                <div className="text-[10px] text-text-sub font-semibold mt-1 uppercase tracking-wide">{user.role.replace('_', ' ')}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

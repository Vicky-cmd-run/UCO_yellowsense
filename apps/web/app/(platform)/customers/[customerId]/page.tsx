'use client';

import React, { useEffect, useState, use } from 'react';
import { apiService } from '../../../../services/api';
import { useDemoStore } from '../../../../stores/demoStore';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Briefcase, Calendar,
  AlertTriangle, ShieldAlert, Sparkles, FileText, CheckCircle2,
  XCircle, ChevronRight, RefreshCw, Plus, Clock, MessageSquare,
  Award, Play, Check, ToggleLeft, ToggleRight, Trash2, HelpCircle
} from 'lucide-react';
import Link from 'next/link';

// INR Formatting Helper
const formatINR = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

export default function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
  const resolvedParams = use(params);
  const customerId = resolvedParams.customerId;

  const { activeUser } = useDemoStore();
  const [customer, setCustomer] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Tabs state
  const [activeTab, setActiveTab] = useState('overview');

  // Interactive Form states (Local state modifications for quick feedback)
  const [newInteraction, setNewInteraction] = useState({ channel: 'PHONE', type: 'Service', direction: 'OUTBOUND', summary: '', sentiment: 'NEUTRAL' });
  const [newLead, setNewLead] = useState({ product: '', potential_value: '', source: 'RM', priority: 'MEDIUM' });
  const [newMeeting, setNewMeeting] = useState({ purpose: '', scheduled_at: '', transcript: '' });
  
  // AI summary states
  const [aiSummaryLoading, setAiSummaryLoading] = useState<Record<string, boolean>>({});
  const [aiSummaries, setAiSummaries] = useState<Record<string, any>>({});

  // Consent states
  const [consents, setConsents] = useState<any[]>([
    { id: '1', channel: 'SMS', purpose: 'Transactional & Alert SMS', granted: true, date: '2026-01-10' },
    { id: '2', channel: 'EMAIL', purpose: 'Monthly Statements & Newsletters', granted: true, date: '2026-01-10' },
    { id: '3', channel: 'WHATSAPP', purpose: 'Product offers & RM Quick Chat', granted: true, date: '2026-03-12' },
    { id: '4', channel: 'CALL', purpose: 'Marketing Tele-calling offers', granted: false, date: '2026-05-18', revokedDate: '2026-06-01' }
  ]);

  // Document states
  const [documents, setDocuments] = useState<any[]>([
    { name: 'Aadhaar Card KYC', size: '1.4 MB', type: 'PDF', date: '2026-01-10', status: 'VERIFIED' },
    { name: 'PAN Card Verification', size: '920 KB', type: 'PDF', date: '2026-01-10', status: 'VERIFIED' },
    { name: 'GST Certificate (3 Years)', size: '2.8 MB', type: 'PDF', date: '2026-02-15', status: 'VERIFIED' },
    { name: 'Form 16 Tax Filing', size: '4.1 MB', type: 'PDF', date: '2026-05-18', status: 'VERIFIED' }
  ]);

  // Load everything
  useEffect(() => {
    if (!customerId) return;

    async function loadCustomerData() {
      setLoading(true);
      setError(null);
      try {
        const [custDetail, custTimeline, custRecs] = await Promise.all([
          apiService.fetchCustomerById(customerId),
          apiService.fetchCustomerTimeline(customerId),
          apiService.fetchCustomerRecommendations(customerId)
        ]);

        setCustomer(custDetail);
        setTimeline(custTimeline);
        setRecommendations(custRecs || []);

        // Load bank users to resolve RM names
        try {
          const listUsers = await apiService.fetchUsers();
          setUsers(listUsers);
        } catch (_) {}

        // Fetch other models and filter locally by customer_id
        const [leadsRes, visitsRes, meetingsRes, complaintsRes] = await Promise.allSettled([
          apiService.fetchLeads(),
          apiService.fetchVisits(),
          apiService.fetchMeetings(),
          apiService.fetchComplaints()
        ]);

        if (leadsRes.status === 'fulfilled') {
          setLeads(leadsRes.value.filter((l: any) => l.customer_id === customerId));
        }
        if (visitsRes.status === 'fulfilled') {
          setVisits(visitsRes.value.filter((v: any) => v.customer_id === customerId));
        }
        if (meetingsRes.status === 'fulfilled') {
          setMeetings(meetingsRes.value.filter((m: any) => m.customer_id === customerId));
        }
        if (complaintsRes.status === 'fulfilled') {
          setComplaints(complaintsRes.value.filter((c: any) => c.customer_id === customerId));
        }

      } catch (err: any) {
        console.error('Failed to load customer 360 profile', err);
        setError(err.message || 'Customer profile not found or server is unreachable.');
      } finally {
        setLoading(false);
      }
    }

    loadCustomerData();
  }, [customerId, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-border-warm rounded"></div>
        <div className="premium-card h-40 bg-surface"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 premium-card h-96 bg-surface"></div>
          <div className="premium-card h-96 bg-surface"></div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="premium-card max-w-xl mx-auto my-12 text-center p-8 flex flex-col items-center gap-4">
        <AlertTriangle className="w-12 h-12 text-danger-acc" />
        <h3 className="text-lg font-bold text-navy">Customer Not Found</h3>
        <p className="text-text-sub text-sm">{error || 'The requested customer profile could not be loaded.'}</p>
        <div className="flex gap-4">
          <Link
            href="/customers"
            className="px-4 py-2 border border-border-warm hover:bg-bg-warm text-navy font-bold rounded-xl text-xs transition"
          >
            Back to Directory
          </Link>
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="px-4 py-2 bg-yellow-acc hover:bg-yellow-acc/90 text-navy font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // Helper lists for RM/VRM names
  const assignedRMUser = users.find(u => u.id === customer.assigned_rm_id);
  const assignedVRMUser = users.find(u => u.id === customer.assigned_vrm_id);

  // Tabs structure
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'accounts', label: 'Accounts & Holdings' },
    { id: 'interactions', label: 'Interactions' },
    { id: 'visits', label: 'Field Visits' },
    { id: 'leads', label: 'Leads Pipeline' },
    { id: 'meetings', label: 'Meetings Intel' },
    { id: 'complaints', label: 'Complaints Queue' },
    { id: 'documents', label: 'KYC & Documents' },
    { id: 'consent', label: 'Consent Registry' },
    { id: 'audit', label: 'Audit Trail' }
  ];

  // Actions for interactive inputs
  const handleCreateInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteraction.summary.trim()) return;
    try {
      // We can log this locally to simulated list or database if API supports logging. 
      // Timeline endpoint will update next time, let's append to local timeline for immediate UI reflection.
      const simulatedItem = {
        id: `sim-int-${Date.now()}`,
        type: 'interaction',
        title: `Interaction: ${newInteraction.channel} (${newInteraction.type})`,
        description: newInteraction.summary,
        timestamp: new Date().toISOString(),
        sentiment: newInteraction.sentiment,
        actor: activeUser?.employee_id || 'ME'
      };
      setTimeline(prev => [simulatedItem, ...prev]);
      setNewInteraction({ channel: 'PHONE', type: 'Service', direction: 'OUTBOUND', summary: '', sentiment: 'NEUTRAL' });
      alert('Interaction logged successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.product.trim() || !newLead.potential_value) return;
    try {
      const valueNum = parseFloat(newLead.potential_value);
      const res = await apiService.createLead(customer.id, newLead.source, newLead.product, valueNum, activeUser?.id);
      setLeads(prev => [res, ...prev]);
      setNewLead({ product: '', potential_value: '', source: 'RM', priority: 'MEDIUM' });
      alert('New Sales Opportunity / Lead Created!');
    } catch (err: any) {
      alert(`Failed to create lead: ${err.message}`);
    }
  };

  const handleTriggerMeetingIntelligence = async (meetingId: string) => {
    setAiSummaryLoading(prev => ({ ...prev, [meetingId]: true }));
    try {
      const intel = await apiService.generateMeetingIntelligence(meetingId);
      setAiSummaries(prev => ({ ...prev, [meetingId]: intel }));
    } catch (err: any) {
      alert(`AI Extraction failed: ${err.message}`);
    } finally {
      setAiSummaryLoading(prev => ({ ...prev, [meetingId]: false }));
    }
  };

  const handleToggleConsent = (id: string) => {
    setConsents(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          granted: !c.granted,
          revokedDate: !c.granted ? undefined : new Date().toISOString().split('T')[0]
        };
      }
      return c;
    }));
  };

  const handleAcceptRecommendation = (recId: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== recId));
    alert('AI Next Best Action opportunity converted to a Sales Lead Pipeline target!');
  };

  const handleDismissRecommendation = (recId: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== recId));
  };

  return (
    <div className="space-y-6">
      {/* Back button and profile title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 border border-border-warm hover:bg-surface text-text-sub hover:text-navy rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-navy tracking-tight">{customer.full_name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                customer.segment === 'MSME' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                customer.segment === 'PREMIUM' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {customer.segment}
              </span>
            </div>
            <p className="text-text-sub text-xs mt-0.5">
              Customer ID: <span className="font-bold text-navy">{customer.customer_number}</span> • Segment: <span className="font-semibold text-navy">{customer.customer_type}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-3.5 py-1.5 border border-border-warm bg-white hover:bg-surface text-navy font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-text-sub" />
          <span>Refresh Details</span>
        </button>
      </div>

      {/* Customer Health Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Relationship Value */}
        <div className="premium-card bg-surface border-l-4 border-l-yellow-acc">
          <span className="text-[10px] font-black text-text-sub uppercase tracking-wider block">Relationship Value</span>
          <span className="text-xl font-extrabold text-navy tracking-tight block mt-1">
            {formatINR(customer.relationship_value)}
          </span>
          <span className="text-[10px] text-text-sub font-semibold mt-1 block">
            Tenure: {customer.relationship_tenure_months} months
          </span>
        </div>

        {/* KPI 2: Churn Risk */}
        <div className="premium-card bg-surface border-l-4 border-l-danger-acc">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-text-sub uppercase tracking-wider">Churn Risk Assessment</span>
            {customer.churn_risk >= 75 && (
              <ShieldAlert className="w-4 h-4 text-danger-acc shrink-0" />
            )}
          </div>
          <span className={`text-xl font-extrabold tracking-tight block mt-1 ${
            customer.churn_risk >= 75 ? 'text-danger-acc' :
            customer.churn_risk >= 40 ? 'text-warning-acc' : 'text-success-acc'
          }`}>
            {customer.churn_risk}%
          </span>
          <span className="text-[10px] text-text-sub font-semibold mt-1 block">
            {customer.churn_risk >= 75 ? 'High Risk - Service Recovery required' : 'Stable retention score'}
          </span>
        </div>

        {/* KPI 3: Lead Propensity */}
        <div className="premium-card bg-surface border-l-4 border-l-success-acc">
          <span className="text-[10px] font-black text-text-sub uppercase tracking-wider block">Lead Propensity</span>
          <span className="text-xl font-extrabold text-navy tracking-tight block mt-1">
            {customer.lead_propensity}%
          </span>
          <span className="text-[10px] text-text-sub font-semibold mt-1 block">
            Likelihood to adopt cross-sell products
          </span>
        </div>

        {/* KPI 4: Digital Engagement & Sentiment */}
        <div className="premium-card bg-surface border-l-4 border-l-navy">
          <span className="text-[10px] font-black text-text-sub uppercase tracking-wider block">Engagement & Sentiment</span>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm font-extrabold text-navy">
              Digital Score: {customer.digital_engagement_score}/100
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
              customer.sentiment === 'POSITIVE' ? 'bg-success-acc text-white' :
              customer.sentiment === 'NEGATIVE' ? 'bg-danger-acc text-white' : 'bg-gold text-navy'
            }`}>
              {customer.sentiment}
            </span>
          </div>
          <span className="text-[10px] text-text-sub font-semibold mt-1 block">
            Channel usage: Mobile App, NetBanking
          </span>
        </div>
      </div>

      {/* Main Workspace Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Tabs Navigation and Content (3/4 width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs Navbar */}
          <div className="flex border-b border-border-warm overflow-x-auto scrollbar-none whitespace-nowrap bg-surface rounded-xl p-1 border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-yellow-acc text-navy shadow-sm'
                    : 'text-text-sub hover:bg-bg-warm'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Content Panel */}
          <div className="premium-card bg-surface min-h-[400px]">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-navy text-base">Customer Overview Profile</h3>
                  <p className="text-xs text-text-sub">Demographics, core holdings, and active staff assignments.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Demographics details */}
                  <div className="bg-bg-warm/50 border border-border-warm rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-navy uppercase tracking-wider pb-1.5 border-b border-border-warm">Demographics</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <span className="text-text-sub font-medium">Occupation:</span>
                      <span className="text-navy font-bold">{customer.profile?.occupation || 'N/A'}</span>
                      <span className="text-text-sub font-medium">Business:</span>
                      <span className="text-navy font-bold">{customer.profile?.business_type || 'N/A'}</span>
                      <span className="text-text-sub font-medium">Annual Income:</span>
                      <span className="text-navy font-bold">{customer.profile?.annual_income ? formatINR(customer.profile.annual_income) : 'N/A'}</span>
                      <span className="text-text-sub font-medium">Annual Turnover:</span>
                      <span className="text-navy font-bold">{customer.profile?.annual_turnover ? formatINR(customer.profile.annual_turnover) : 'N/A'}</span>
                      <span className="text-text-sub font-medium">Employees:</span>
                      <span className="text-navy font-bold">{customer.profile?.employee_count || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Channel Preferences */}
                  <div className="bg-bg-warm/50 border border-border-warm rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-navy uppercase tracking-wider pb-1.5 border-b border-border-warm">Communication preferences</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <span className="text-text-sub font-medium">Language:</span>
                      <span className="text-navy font-bold">{customer.profile?.preferred_language || 'English'}</span>
                      <span className="text-text-sub font-medium">Primary Channel:</span>
                      <span className="text-navy font-bold uppercase">{customer.profile?.preferred_channel || 'EMAIL'}</span>
                      <span className="text-text-sub font-medium">Assigned RM:</span>
                      <span className="text-navy font-bold">{assignedRMUser?.name || 'Not Assigned'}</span>
                      <span className="text-text-sub font-medium">Assigned VRM:</span>
                      <span className="text-navy font-bold">{assignedVRMUser?.name || 'Not Assigned'}</span>
                    </div>
                  </div>
                </div>

                {/* holdings preview */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Product Holdings Summary</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {customer.accounts && customer.accounts.slice(0, 3).map((acc: any) => (
                      <div key={acc.id} className="p-3 bg-bg-warm/30 border border-border-warm rounded-xl text-xs">
                        <div className="font-extrabold text-navy">{acc.account_type} Account</div>
                        <div className="text-[10px] text-text-sub mt-0.5">{acc.account_number_masked}</div>
                        <div className="font-black text-navy mt-1.5">{formatINR(acc.balance)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* mini recent timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Recent Activities</h4>
                  <div className="space-y-3">
                    {timeline.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex gap-3 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-acc mt-1.5 shrink-0"></div>
                        <div className="grow">
                          <span className="font-bold text-navy">{item.title}</span>
                          <p className="text-text-sub mt-0.5">{item.description}</p>
                          <span className="text-[10px] text-text-sub block mt-0.5">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ACCOUNTS & HOLDINGS TAB */}
            {activeTab === 'accounts' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-navy text-base">Liquid Accounts & Product Holdings</h3>
                  <p className="text-xs text-text-sub">Review details of savings accounts, loans, deposits, and merchant assets.</p>
                </div>

                {/* Bank Accounts */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-navy uppercase tracking-wider">Operational Bank Accounts</h4>
                  <div className="border border-border-warm rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-bg-warm/50 border-b border-border-warm text-[10px] font-bold text-text-sub uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Account Number</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Balance</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Opened Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-warm/60">
                        {customer.accounts && customer.accounts.map((acc: any) => (
                          <tr key={acc.id}>
                            <td className="py-3 px-3 font-bold text-navy">{acc.account_number_masked}</td>
                            <td className="py-3 px-3 font-semibold text-text-main">{acc.account_type}</td>
                            <td className="py-3 px-3 font-bold text-navy">{formatINR(acc.balance)}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 bg-success-acc/10 border border-success-acc/20 text-success-acc font-black text-[9px] rounded uppercase">
                                {acc.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-text-sub">{new Date(acc.opened_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Other holdings */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-navy uppercase tracking-wider">Product Asset Holdings</h4>
                  <div className="border border-border-warm rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-bg-warm/50 border-b border-border-warm text-[10px] font-bold text-text-sub uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Holding Value</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-warm/60">
                        {customer.product_holdings && customer.product_holdings.map((hold: any) => (
                          <tr key={hold.id}>
                            <td className="py-3 px-3 font-bold text-navy">{hold.product_name}</td>
                            <td className="py-3 px-3 font-semibold text-text-main">{hold.product_type}</td>
                            <td className="py-3 px-3 font-bold text-navy">{formatINR(hold.value)}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 bg-blue-100 border border-blue-200 text-blue-800 font-black text-[9px] rounded uppercase">
                                {hold.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIONS TAB */}
            {activeTab === 'interactions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-navy text-base">Interaction History Desk</h3>
                    <p className="text-xs text-text-sub">Record of outbound calls, email updates, and branch service tickets.</p>
                  </div>
                </div>

                {/* Logging form */}
                <form onSubmit={handleCreateInteraction} className="bg-bg-warm/40 border border-border-warm rounded-xl p-4 space-y-4">
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Log New Interaction Event</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-text-sub mb-1 font-semibold">Channel</label>
                      <select
                        className="w-full bg-white border border-border-warm p-1.5 rounded-lg text-xs"
                        value={newInteraction.channel}
                        onChange={(e) => setNewInteraction(prev => ({ ...prev, channel: e.target.value }))}
                      >
                        <option value="PHONE">Phone Call</option>
                        <option value="EMAIL">Email</option>
                        <option value="VISIT">In-Person Visit</option>
                        <option value="BRANCH">Branch Walk-In</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-text-sub mb-1 font-semibold">Type</label>
                      <select
                        className="w-full bg-white border border-border-warm p-1.5 rounded-lg text-xs"
                        value={newInteraction.type}
                        onChange={(e) => setNewInteraction(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="Service">Service Recovery</option>
                        <option value="Sales">Sales Pitch</option>
                        <option value="Complaint">Complaint Intake</option>
                        <option value="Feedback">Customer Survey</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-text-sub mb-1 font-semibold">Direction</label>
                      <select
                        className="w-full bg-white border border-border-warm p-1.5 rounded-lg text-xs"
                        value={newInteraction.direction}
                        onChange={(e) => setNewInteraction(prev => ({ ...prev, direction: e.target.value }))}
                      >
                        <option value="INBOUND">Inbound</option>
                        <option value="OUTBOUND">Outbound</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-text-sub mb-1 font-semibold">Sentiment</label>
                      <select
                        className="w-full bg-white border border-border-warm p-1.5 rounded-lg text-xs"
                        value={newInteraction.sentiment}
                        onChange={(e) => setNewInteraction(prev => ({ ...prev, sentiment: e.target.value }))}
                      >
                        <option value="POSITIVE">Positive</option>
                        <option value="NEUTRAL">Neutral</option>
                        <option value="NEGATIVE">Negative</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-text-sub mb-1 font-semibold">Discussion Summary</label>
                    <textarea
                      rows={2}
                      className="w-full bg-white border border-border-warm p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-acc"
                      placeholder="Write brief points discussed, interest shown, or issues highlighted..."
                      value={newInteraction.summary}
                      onChange={(e) => setNewInteraction(prev => ({ ...prev, summary: e.target.value }))}
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-navy hover:bg-navy/95 text-white font-bold rounded-xl text-xs transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Interaction</span>
                    </button>
                  </div>
                </form>

                {/* Interaction log table */}
                <div className="space-y-3">
                  {timeline.filter(t => t.type === 'interaction').map((item) => (
                    <div key={item.id} className="p-3 bg-bg-warm/25 border border-border-warm rounded-xl text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="font-extrabold text-navy">{item.title}</span>
                        <span className="text-text-sub font-semibold">{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-text-main">{item.description}</p>
                      <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-border-warm/30">
                        <span className="text-text-sub font-semibold">Log Owner ID: <span className="text-navy">{item.actor}</span></span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          item.sentiment === 'POSITIVE' ? 'bg-success-acc/10 text-success-acc' :
                          item.sentiment === 'NEGATIVE' ? 'bg-danger-acc/10 text-danger-acc' :
                          'bg-gold/10 text-gold'
                        }`}>{item.sentiment}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FIELD VISITS TAB */}
            {activeTab === 'visits' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-navy text-base">ZRT Field Visits Desk</h3>
                  <p className="text-xs text-text-sub">Field check-in audits, GPS verifications, and credit needs assessment checklists.</p>
                </div>

                <div className="space-y-4">
                  {visits.length === 0 ? (
                    <div className="py-12 border border-dashed border-border-warm rounded-xl text-center text-xs space-y-2">
                      <Clock className="w-8 h-8 text-text-sub mx-auto" />
                      <p className="font-bold text-navy">No visits planned</p>
                      <p className="text-text-sub">No recent or scheduled field visits have been recorded for this customer file.</p>
                    </div>
                  ) : (
                    visits.map((visit) => (
                      <div key={visit.id} className="p-4 bg-bg-warm/20 border border-border-warm rounded-xl text-xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-navy block text-sm">Purpose: {visit.purpose}</span>
                            <span className="text-[10px] text-text-sub font-semibold mt-0.5 block">
                              Scheduled Date: {new Date(visit.scheduled_at).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                            visit.status === 'COMPLETED' ? 'bg-success-acc/10 text-success-acc border-success-acc/20' :
                            visit.status === 'IN_PROGRESS' ? 'bg-orange-acc/10 text-orange-acc border-orange-acc/20' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }`}>{visit.status}</span>
                        </div>

                        {visit.notes && (
                          <div className="p-2.5 bg-white border border-border-warm rounded-lg text-xs italic">
                            {visit.notes}
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] pt-2 border-t border-border-warm/40">
                          <div>
                            <span className="text-text-sub font-semibold uppercase block">ZRT Officer ID</span>
                            <span className="font-bold text-navy uppercase">{visit.zrt_officer_id}</span>
                          </div>
                          <div>
                            <span className="text-text-sub font-semibold uppercase block">GPS Check-In</span>
                            <span className="font-bold text-navy">
                              {visit.geo_verified ? 'GEO Verified ✅' : 'No GPS Records'}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-sub font-semibold uppercase block">Check-In</span>
                            <span className="font-bold text-navy">
                              {visit.check_in_at ? new Date(visit.check_in_at).toLocaleTimeString() : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-sub font-semibold uppercase block">Check-Out</span>
                            <span className="font-bold text-navy">
                              {visit.check_out_at ? new Date(visit.check_out_at).toLocaleTimeString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* LEADS PIPELINE TAB */}
            {activeTab === 'leads' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-navy text-base">Sales Opportunity Pipeline</h3>
                  <p className="text-xs text-text-sub">Track potential loan products, deposits, and merchant accounts onboarding.</p>
                </div>

                {/* Add new lead form */}
                <form onSubmit={handleCreateLead} className="bg-bg-warm/40 border border-border-warm rounded-xl p-4 space-y-4">
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Initiate New Lead Pipeline target</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-text-sub mb-1 font-semibold">Target Product</label>
                      <input
                        type="text"
                        placeholder="e.g. MSME Working Capital, Savings Platinum"
                        className="w-full bg-white border border-border-warm p-1.5 rounded-lg text-xs"
                        value={newLead.product}
                        onChange={(e) => setNewLead(prev => ({ ...prev, product: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-text-sub mb-1 font-semibold">Potential Value (INR)</label>
                      <input
                        type="number"
                        placeholder="e.g. 500000"
                        className="w-full bg-white border border-border-warm p-1.5 rounded-lg text-xs"
                        value={newLead.potential_value}
                        onChange={(e) => setNewLead(prev => ({ ...prev, potential_value: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-text-sub mb-1 font-semibold">Lead Priority</label>
                      <select
                        className="w-full bg-white border border-border-warm p-1.5 rounded-lg text-xs"
                        value={newLead.priority}
                        onChange={(e) => setNewLead(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-navy hover:bg-navy/95 text-white font-bold rounded-xl text-xs transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Pipeline Lead</span>
                    </button>
                  </div>
                </form>

                {/* Leads list */}
                <div className="space-y-4">
                  {leads.length === 0 ? (
                    <div className="py-12 border border-dashed border-border-warm rounded-xl text-center text-xs space-y-2">
                      <Award className="w-8 h-8 text-text-sub mx-auto" />
                      <p className="font-bold text-navy">No active leads</p>
                      <p className="text-text-sub">No sales pipeline leads are active for this customer profile.</p>
                    </div>
                  ) : (
                    leads.map((lead) => (
                      <div key={lead.id} className="p-3 bg-white border border-border-warm rounded-xl text-xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-navy text-sm block">{lead.product}</span>
                            <span className="text-[10px] text-text-sub font-semibold block mt-0.5">
                              Source: {lead.source} • Created on {new Date(lead.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-navy text-sm block">{formatINR(lead.potential_value)}</span>
                            <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase mt-1 ${
                              lead.priority === 'HIGH' ? 'bg-danger-acc/10 text-danger-acc' :
                              lead.priority === 'MEDIUM' ? 'bg-gold/10 text-orange-acc' : 'bg-slate-100 text-slate-700'
                            }`}>{lead.priority} Priority</span>
                          </div>
                        </div>

                        {/* Kanban progress bar simulation */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-text-main">
                            <span>Stage: <span className="text-navy">{lead.stage}</span></span>
                            <span>Conversion Probability: {lead.conversion_probability}%</span>
                          </div>
                          <div className="w-full bg-bg-warm rounded-full h-2 overflow-hidden border border-border-warm/40 flex">
                            {/* Simple stages: New, Qualified, Approved, Converted */}
                            <div className="h-full bg-success-acc" style={{ 
                              width: `${
                                lead.stage === 'Converted' ? 100 :
                                lead.stage === 'Approved' ? 80 :
                                lead.stage === 'Application' ? 60 :
                                lead.stage === 'Qualified' ? 40 : 20
                              }%` 
                            }}></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* MEETINGS INTEL TAB */}
            {activeTab === 'meetings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-navy text-base">Meetings Intel & AI summarization</h3>
                  <p className="text-xs text-text-sub">Access scheduled meet records and trigger AI analysis on discussion transcripts.</p>
                </div>

                <div className="space-y-4">
                  {meetings.length === 0 ? (
                    <div className="py-12 border border-dashed border-border-warm rounded-xl text-center text-xs space-y-2">
                      <Calendar className="w-8 h-8 text-text-sub mx-auto" />
                      <p className="font-bold text-navy">No meetings records</p>
                      <p className="text-text-sub">No recent customer portfolio meetings records found.</p>
                    </div>
                  ) : (
                    meetings.map((meet) => {
                      const isAiLoading = aiSummaryLoading[meet.id];
                      const aiResult = aiSummaries[meet.id];

                      return (
                        <div key={meet.id} className="p-4 bg-white border border-border-warm rounded-xl text-xs space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-extrabold text-navy text-sm block">Purpose: {meet.purpose}</span>
                              <span className="text-[10px] text-text-sub font-semibold block mt-0.5">
                                Scheduled: {new Date(meet.scheduled_at).toLocaleString()}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              meet.sentiment === 'POSITIVE' ? 'bg-success-acc text-white' :
                              meet.sentiment === 'NEGATIVE' ? 'bg-danger-acc text-white' : 'bg-gold text-navy'
                            }`}>{meet.sentiment} Sentiment</span>
                          </div>

                          {/* Action details */}
                          {meet.summary && (
                            <div className="p-3 bg-bg-warm/30 rounded-xl space-y-2">
                              <span className="font-bold text-navy text-[11px] block">Standard Summary:</span>
                              <p className="text-text-main">{meet.summary}</p>
                              {meet.action_items && (
                                <p className="text-text-sub mt-1"><strong>Action items:</strong> {meet.action_items}</p>
                              )}
                            </div>
                          )}

                          {/* AI summarization triggers */}
                          {meet.transcript && !meet.summary && !aiResult && (
                            <div className="p-3 bg-yellow-acc/5 border border-yellow-acc/20 rounded-xl flex flex-col items-start gap-2">
                              <span className="text-[10px] text-text-sub font-bold uppercase">Transcript Captured</span>
                              <p className="text-text-sub text-[11px] italic line-clamp-2">"{meet.transcript}"</p>
                              <button
                                onClick={() => handleTriggerMeetingIntelligence(meet.id)}
                                disabled={isAiLoading}
                                className="px-3 py-1.5 bg-yellow-acc hover:bg-yellow-acc/90 text-navy font-bold rounded-lg text-[10px] transition flex items-center gap-1.5"
                              >
                                {isAiLoading ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3" />
                                )}
                                <span>{isAiLoading ? 'Extracting...' : 'Summarize Transcript (AI)'}</span>
                              </button>
                            </div>
                          )}

                          {/* AI extracted summary presentation */}
                          {aiResult && (
                            <div className="p-3.5 bg-emerald-50 border border-success-acc/20 rounded-xl space-y-2">
                              <div className="flex items-center gap-1 text-success-acc text-[11px] font-black uppercase">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>AI Generated Intelligence</span>
                              </div>
                              <p className="text-navy font-bold text-xs">{aiResult.summary}</p>
                              <div className="text-text-sub mt-2 space-y-1">
                                <strong className="block text-[10px] font-black uppercase">Extracted Action Items:</strong>
                                <p>{aiResult.action_items}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* COMPLAINTS QUEUE TAB */}
            {activeTab === 'complaints' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-navy text-base">Service Support Complaints Queue</h3>
                  <p className="text-xs text-text-sub">Resolve customer service issues, check SLA limits, and escalate urgent grievances.</p>
                </div>

                <div className="space-y-4">
                  {complaints.length === 0 ? (
                    <div className="py-12 border border-dashed border-border-warm rounded-xl text-center text-xs space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-success-acc mx-auto" />
                      <p className="font-bold text-navy">No pending issues</p>
                      <p className="text-text-sub">Customer file has zero open service tickets or complaints.</p>
                    </div>
                  ) : (
                    complaints.map((comp) => (
                      <div key={comp.id} className="p-4 bg-white border border-border-warm rounded-xl text-xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-navy text-sm block">Category: {comp.category}</span>
                            <span className="text-[10px] text-text-sub font-semibold block mt-0.5">
                              SLA Due: {new Date(comp.sla_due_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              comp.severity === 'CRITICAL' ? 'bg-danger-acc text-white' :
                              comp.severity === 'HIGH' ? 'bg-orange-acc text-white' : 'bg-slate-100 text-slate-700'
                            }`}>{comp.severity} Severity</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                              comp.status === 'RESOLVED' ? 'bg-success-acc/10 text-success-acc border-success-acc/20' :
                              comp.status === 'ESCALATED' ? 'bg-danger-acc/10 text-danger-acc border-danger-acc/20' :
                              'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>{comp.status}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-border-warm/40 text-text-sub">
                          <div>Assigned Team: <span className="font-bold text-navy">{comp.assigned_team || 'General support'}</span></div>
                          <div>Escalation Level: <span className="font-bold text-navy">{comp.escalation_level}</span></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-navy text-base">KYC Document Repository</h3>
                  <p className="text-xs text-text-sub">Verify Aadhaar, PAN Cards, partnership deeds, and trade licences.</p>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-border-warm rounded-xl p-6 text-center text-xs space-y-2 bg-bg-warm/20">
                  <FileText className="w-8 h-8 text-text-sub mx-auto" />
                  <p className="font-bold text-navy">Upload Customer KYC Files</p>
                  <p className="text-[10px] text-text-sub">Supports PDF, PNG files up to 10MB in size.</p>
                  <button
                    type="button"
                    onClick={() => {
                      const name = prompt('Enter document name:');
                      if (name) {
                        setDocuments(prev => [...prev, {
                          name,
                          size: '1.2 MB',
                          type: 'PDF',
                          date: new Date().toISOString().split('T')[0],
                          status: 'VERIFIED'
                        }]);
                      }
                    }}
                    className="mt-2 px-3.5 py-1.5 bg-navy hover:bg-navy/95 text-white font-bold rounded-lg text-[10px] transition"
                  >
                    Select File
                  </button>
                </div>

                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.name} className="flex justify-between items-center p-3 bg-bg-warm/15 border border-border-warm rounded-xl text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border border-border-warm rounded-lg flex items-center justify-center font-bold text-navy text-[10px]">
                          PDF
                        </div>
                        <div>
                          <span className="font-bold text-navy block">{doc.name}</span>
                          <span className="text-[10px] text-text-sub font-semibold">{doc.size} • Uploaded {doc.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-success-acc/10 text-success-acc border border-success-acc/20 font-black text-[9px] rounded">
                          {doc.status}
                        </span>
                        <button
                          onClick={() => setDocuments(prev => prev.filter(d => d.name !== doc.name))}
                          className="p-1 border border-border-warm hover:bg-danger-acc/10 text-text-sub hover:text-danger-acc rounded-lg transition"
                          title="Delete File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONSENT REGISTRY TAB */}
            {activeTab === 'consent' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-navy text-base">Communication Consent Permissions</h3>
                  <p className="text-xs text-text-sub">Manage permissions for marketing alerts, direct SMS pitches, and WhatsApp notifications.</p>
                </div>

                <div className="divide-y divide-border-warm">
                  {consents.map((c) => (
                    <div key={c.id} className="py-4 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-navy text-sm uppercase">{c.channel} Channel</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            c.granted ? 'bg-success-acc/10 text-success-acc' : 'bg-danger-acc/10 text-danger-acc'
                          }`}>{c.granted ? 'Granted' : 'Revoked / Denied'}</span>
                        </div>
                        <span className="text-text-sub text-xs mt-0.5 block">{c.purpose}</span>
                        <span className="text-[10px] text-text-sub font-semibold mt-1 block">
                          Captured Date: {c.date} {c.revokedDate && `• Revoked: ${c.revokedDate}`}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleConsent(c.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          c.granted 
                            ? 'bg-success-acc/10 border-success-acc/20 text-success-acc' 
                            : 'bg-danger-acc/10 border-danger-acc/20 text-danger-acc'
                        }`}
                      >
                        {c.granted ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Revoke Permission</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Grant Permission</span>
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIT LOG TAB */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-navy text-base">Governance & Audit Logs</h3>
                  <p className="text-xs text-text-sub">Complete security history of customer profile modifications, lead allocations, and NBA status swaps.</p>
                </div>

                <div className="border border-border-warm rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-bg-warm/50 border-b border-border-warm text-[10px] font-bold text-text-sub uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">Actor ID</th>
                        <th className="py-2.5 px-3">Before State</th>
                        <th className="py-2.5 px-3">After State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-warm/60">
                      {timeline.filter(t => t.type === 'audit').map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-3 text-text-sub">{new Date(item.timestamp).toLocaleString()}</td>
                          <td className="py-3 px-3 font-bold text-navy">{item.title}</td>
                          <td className="py-3 px-3 font-semibold text-text-main">{item.actor}</td>
                          <td className="py-3 px-3 font-medium text-text-sub italic truncate max-w-[150px]" title={item.description}>
                            -
                          </td>
                          <td className="py-3 px-3 font-medium text-navy truncate max-w-[150px]" title={item.description}>
                            {item.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: AI recommendations and RM assigned (1/4 width) */}
        <div className="space-y-6">
          {/* Active AI Recommendation Panel */}
          <div className="premium-card bg-surface relative overflow-hidden border border-border-warm/80 shadow-md">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-acc to-orange-acc/20 opacity-20 rounded-bl-full pointer-events-none"></div>

            <div className="flex items-center gap-1.5 pb-3 border-b border-border-warm">
              <Sparkles className="w-4 h-4 text-orange-acc" />
              <h4 className="font-black text-navy text-xs uppercase tracking-wider">AI Next Best Action</h4>
            </div>

            {recommendations.length === 0 ? (
              <div className="py-8 text-center text-xs space-y-1.5">
                <CheckCircle2 className="w-6 h-6 text-success-acc mx-auto" />
                <p className="font-bold text-navy">No pending recommendations</p>
                <p className="text-text-sub">Engines are checking fresh signals...</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {recommendations.map((rec) => {
                  let codes: string[] = [];
                  if (rec.reason_codes) {
                    try {
                      codes = JSON.parse(rec.reason_codes);
                    } catch (_) {
                      codes = [rec.reason_codes];
                    }
                  }

                  return (
                    <div key={rec.id} className="p-3 bg-bg-warm/40 border border-border-warm rounded-xl text-xs space-y-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-[10px] text-orange-acc uppercase tracking-wide">
                            {rec.recommendation_type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-black text-success-acc">{rec.confidence}% Conf.</span>
                        </div>
                        <p className="text-navy font-bold mt-1.5 leading-snug">{rec.recommendation}</p>
                      </div>

                      {codes.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-text-sub font-black uppercase">Trigger Signals:</span>
                          <div className="flex flex-wrap gap-1">
                            {codes.map((code) => (
                              <span key={code} className="px-1.5 py-0.5 bg-white border border-border-warm rounded text-[9px] font-bold text-text-main">
                                {code}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-warm/40">
                        <button
                          onClick={() => handleDismissRecommendation(rec.id)}
                          className="py-1.5 border border-border-warm hover:bg-white text-text-sub font-bold rounded-lg text-[10px] transition text-center"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleAcceptRecommendation(rec.id)}
                          className="py-1.5 bg-yellow-acc hover:bg-yellow-acc/95 text-navy font-black rounded-lg text-[10px] transition text-center shadow-sm"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assigned Officers Contact Card */}
          <div className="premium-card bg-surface space-y-4">
            <h4 className="font-extrabold text-navy text-xs uppercase tracking-wider pb-2 border-b border-border-warm">
              Account Handlers
            </h4>

            {/* RM details */}
            {assignedRMUser ? (
              <div className="text-xs space-y-1">
                <span className="text-[10px] text-text-sub font-black uppercase block">Assigned Relationship Manager</span>
                <span className="font-bold text-navy block text-sm">{assignedRMUser.name}</span>
                <span className="text-[10px] text-text-sub font-medium block">Emp ID: {assignedRMUser.employee_id}</span>
                <div className="flex items-center gap-1.5 text-text-sub font-semibold mt-1.5">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{assignedRMUser.email}</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-text-sub font-semibold">No RM assigned</p>
            )}

            {/* VRM details */}
            {assignedVRMUser && (
              <div className="text-xs space-y-1 pt-3 border-t border-border-warm/60">
                <span className="text-[10px] text-text-sub font-black uppercase block">Assigned Virtual RM</span>
                <span className="font-bold text-navy block text-sm">{assignedVRMUser.name}</span>
                <span className="text-[10px] text-text-sub font-medium block">Emp ID: {assignedVRMUser.employee_id}</span>
                <div className="flex items-center gap-1.5 text-text-sub font-semibold mt-1.5">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{assignedVRMUser.email}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

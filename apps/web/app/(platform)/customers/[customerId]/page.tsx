'use client';

import React, { use, useState, useEffect } from 'react';
import { DEMO_CUSTOMERS, DEMO_RECOMMENDATIONS, DEMO_LEADS, DEMO_MEETINGS, DEMO_COMPLAINTS, DEMO_VISITS, DEMO_AUDIT_EVENTS } from '@/services/DEMO_DATA';
import { apiService } from '@/services/api';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Building2, Star,
  TrendingDown, Activity, ChevronRight, CheckCircle, XCircle,
  Briefcase, Calendar, MessageSquare, AlertTriangle, FileText,
  Shield, ClipboardList, Bot, Sparkles, Check, X, ShieldAlert, CreditCard, Smartphone
} from 'lucide-react';
import Link from 'next/link';

const formatINR = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'accounts', label: 'Accounts', icon: CreditCard },
  { id: 'digital', label: 'Digital Adoption', icon: Smartphone },
  { id: 'leads', label: 'Leads', icon: TrendingDown },
  { id: 'visits', label: 'Visits', icon: MapPin },
  { id: 'meetings', label: 'Meetings', icon: Calendar },
  { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
  { id: 'interactions', label: 'Timeline', icon: Activity },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'consent', label: 'Consent', icon: Shield },
  { id: 'audit', label: 'Audit', icon: ClipboardList },
];

const DEMO_INTERACTIONS = [
  { date: '2026-07-05', type: 'Visit', desc: 'ZRT officer Arjun Rao field visit — expansion requirement captured', actor: 'Arjun Rao', sentiment: 'POSITIVE' },
  { date: '2026-07-03', type: 'Meeting', desc: 'Priya Nair — MSME Expansion Loan initial assessment discussion', actor: 'Priya Nair', sentiment: 'POSITIVE' },
  { date: '2026-06-28', type: 'Complaint', desc: 'POS terminal network error reported — escalated to Digital Channels', actor: 'System', sentiment: 'NEGATIVE' },
  { date: '2026-06-20', type: 'Lead', desc: 'Trade Finance LC ₹1Cr lead converted successfully', actor: 'Priya Nair', sentiment: 'POSITIVE' },
  { date: '2026-06-15', type: 'Query', desc: 'CC renewal status inquiry via email — resolved in 2 days', actor: 'Credit Team', sentiment: 'NEUTRAL' },
  { date: '2026-06-01', type: 'Payment', desc: 'EMI of ₹1,24,500 received on time — clean track record maintained', actor: 'System', sentiment: 'POSITIVE' },
];

const DEMO_DOCUMENTS = [
  { name: 'GST Returns FY 2023-24', status: 'VERIFIED', date: '2026-06-10', type: 'Tax' },
  { name: 'CA Certified P&L Statement', status: 'VERIFIED', date: '2026-06-10', type: 'Financial' },
  { name: 'Property Documents (Ambattur)', status: 'PENDING', date: '2026-07-04', type: 'Legal' },
  { name: 'KYC — Director Aadhaar & PAN', status: 'VERIFIED', date: '2025-01-15', type: 'KYC' },
  { name: 'Bank Statements (6 months)', status: 'SUBMITTED', date: '2026-07-04', type: 'Financial' },
];

const DEMO_CONSENT = [
  { purpose: 'Credit Bureau (CIBIL) check', granted: true, date: '2024-03-01' },
  { purpose: 'Marketing communications via SMS', granted: true, date: '2024-03-01' },
  { purpose: 'Email marketing & product offers', granted: false, date: '2024-03-01' },
  { purpose: 'Third-party data sharing for insurance', granted: false, date: '2024-03-01' },
  { purpose: 'Digital behavior analytics', granted: true, date: '2024-03-01' },
];

export default function Customer360Page({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = use(params);
  const [activeTab, setActiveTab] = useState('overview');
  const [dismissedRec, setDismissedRec] = useState<string[]>([]);

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [consents, setConsents] = useState<any[]>([]);
  const [reactivated, setReactivated] = useState<string[]>([]);

  useEffect(() => {
    async function loadCustomer() {
      try {
        const data = await apiService.fetchCustomerById(customerId);
        setCustomer(data);
        setConsents(data.consents || []);
      } catch (err) {
        console.warn('API error, falling back to static mock data', err);
        const staticCust = DEMO_CUSTOMERS.find(c => c.id === customerId) || DEMO_CUSTOMERS[0];
        setCustomer(staticCust);
        
        // Populate consents static fallback
        const isAnita = staticCust.customer_number === 'UCO2024002' || staticCust.id === 'c002';
        setConsents([
          { channel: 'EMAIL', purpose: 'Marketing communications via Email', granted: !isAnita, captured_at: new Date(Date.now() - 180 * 86400000).toISOString() },
          { channel: 'SMS', purpose: 'Marketing communications via SMS', granted: !isAnita, captured_at: new Date(Date.now() - 180 * 86400000).toISOString() },
          { channel: 'WHATSAPP', purpose: 'Marketing communications via WhatsApp', granted: !isAnita, captured_at: new Date(Date.now() - 180 * 86400000).toISOString() },
          { channel: 'CALL', purpose: 'Third-party relationship calls', granted: staticCust.customer_type === 'CORPORATE', captured_at: new Date(Date.now() - 180 * 86400000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, [customerId]);

  const recommendations = (DEMO_RECOMMENDATIONS[customer?.id || 'c001'] || DEMO_RECOMMENDATIONS['c001'])
    .filter(r => !dismissedRec.includes(r.id));
  const customerLeads = DEMO_LEADS.filter(l => l.customer_id === customer?.id);
  const customerMeetings = DEMO_MEETINGS.filter(m => m.customer_id === customer?.id);
  const customerComplaints = DEMO_COMPLAINTS.filter(c => c.customer_id === customer?.id);
  const customerVisits = DEMO_VISITS.filter(v => v.customer_id === customer?.id);
  const customerAudit = DEMO_AUDIT_EVENTS.filter(e => e.entity_id === customer?.id || (customer?.full_name && e.description.toLowerCase().includes(customer.full_name.split(' ')[0].toLowerCase()))).slice(0, 8);

  if (loading || !customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px] py-12 bg-[#FFFDF7]">
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs text-navy font-bold animate-pulse">Loading Customer 360 Workspace...</span>
        </div>
      </div>
    );
  }

  const riskColor = customer.churn_risk >= 70 ? 'text-red-600 bg-red-50 border-red-200' :
    customer.churn_risk >= 40 ? 'text-amber-600 bg-amber-50 border-amber-200' :
    'text-emerald-600 bg-emerald-50 border-emerald-200';

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/customers" className="inline-flex items-center gap-2 text-xs font-bold text-[#6B7076] hover:text-[#16263A] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
      </Link>

      {/* Profile Header */}
      <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Avatar + core */}
          <div className="flex gap-5 items-start flex-1">
            <div className="w-16 h-16 rounded-2xl bg-[#16263A] text-white flex items-center justify-center font-extrabold text-2xl shrink-0 shadow-md">
              {customer.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-extrabold text-[#16263A]">{customer.full_name}</h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">{customer.segment}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${riskColor}`}>
                  {customer.lifecycle_stage.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-[#6B7076] font-mono">{customer.customer_number}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#6B7076]">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.mobile}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customer.email}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {customer.city}, {customer.state}</span>
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {customer.branch_id}</span>
                {customer.gst_number && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {customer.gst_number}</span>}
              </div>
            </div>
          </div>

          {/* Score chips */}
          <div className="flex flex-wrap lg:flex-col gap-3 lg:gap-2 shrink-0">
            {[
              { label: 'Relationship Value', value: formatINR(customer.relationship_value), color: 'text-[#16263A]' },
              { label: 'Churn Risk', value: `${customer.churn_risk}%`, color: customer.churn_risk >= 70 ? 'text-red-600' : customer.churn_risk >= 40 ? 'text-amber-600' : 'text-emerald-600' },
              { label: 'Lead Propensity', value: `${customer.lead_propensity}%`, color: 'text-[#F4A623]' },
              { label: 'Digital Score', value: `${customer.digital_engagement_score}/100`, color: 'text-[#16263A]' },
              { label: 'Tenure', value: `${customer.relationship_tenure_months} months`, color: 'text-[#6B7076]' },
            ].map(s => (
              <div key={s.label} className="text-right">
                <p className="text-[10px] text-[#6B7076] font-semibold">{s.label}</p>
                <p className={`text-sm font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fraud Check Warning Alerts */}
      {customer.fraud_check_status === 'FAILED' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0 animate-bounce" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-red-700 text-xs uppercase tracking-wide">Security & Fraud Risk Warning</h4>
            <p className="text-xs text-red-600 font-semibold">Active regulatory warnings (SEBI Warning Watchlist) detected on associated customer holdings. Verify transaction paths and enforce strict compliance controls immediately.</p>
          </div>
        </div>
      )}
      {customer.fraud_check_status === 'WARNING' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-amber-700 text-xs uppercase tracking-wide">Compliance Warning Alert</h4>
            <p className="text-xs text-amber-600 font-semibold">Email domain validation alert: Registered company profile uses a mismatching public email host domain.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* AI Recommendation Panel */}
        <div className="xl:col-span-1 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-[#F4A623]" />
            <h2 className="text-sm font-extrabold text-[#16263A]">AI Intelligence</h2>
          </div>
          {recommendations.length === 0 ? (
            <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-4 text-center text-xs text-[#6B7076]">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
              All recommendations addressed
            </div>
          ) : (
            recommendations.map(rec => (
              <div key={rec.id} className={`bg-[#FFFDF7] border rounded-2xl p-4 ${rec.priority === 'CRITICAL' ? 'border-red-300 bg-red-50/20' : rec.priority === 'HIGH' ? 'border-amber-300 bg-amber-50/20' : 'border-[#E8DAAE]'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className={`w-3.5 h-3.5 shrink-0 ${rec.priority === 'CRITICAL' ? 'text-red-500' : 'text-[#F4A623]'}`} />
                    <span className={`text-[10px] font-extrabold uppercase ${rec.priority === 'CRITICAL' ? 'text-red-500' : 'text-[#F4A623]'}`}>{rec.priority}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setDismissedRec(d => [...d, rec.id])} className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors" title="Accept">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => setDismissedRec(d => [...d, rec.id])} className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors" title="Dismiss">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-bold text-[#16263A] leading-snug mb-1">{rec.action}</p>
                <p className="text-[10px] text-[#6B7076] leading-relaxed">{rec.rationale}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] bg-[#E8DAAE] text-[#16263A] px-2 py-0.5 rounded-full font-bold">{rec.category}</span>
                  <span className="text-[10px] text-[#6B7076] font-semibold">{rec.confidence}% confidence</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tab Workspace */}
        <div className="xl:col-span-3">
          {/* Tab Bar */}
          <div className="flex gap-1 overflow-x-auto pb-1 mb-4 scrollbar-hide">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#16263A] text-white shadow-sm'
                      : 'text-[#6B7076] hover:bg-[#E8DAAE]/50 hover:text-[#16263A]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6">

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-extrabold text-[#16263A] mb-3">Business Profile</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      ['Customer Type', customer.customer_type],
                      ['Segment', customer.segment],
                      ['Branch', customer.branch_id],
                      ['State', customer.state],
                      ...(customer.gst_number ? [['GST Number', customer.gst_number]] : []),
                      ...(customer.turnover ? [['Annual Turnover', formatINR(customer.turnover)]] : []),
                      ...((customer.profile?.kcc_eligible || customer.kcc_eligible) ? [['KCC Agri Finance', 'QUALIFIED']] : []),
                      ...((customer.profile?.msme_scheme_qualified || customer.msme_scheme_qualified) ? [['UCO MSME Scheme Match', customer.profile?.msme_scheme_qualified || customer.msme_scheme_qualified]] : []),
                      ['Assigned RM', 'Priya Nair'],
                      ['Assigned ZRT', 'Arjun Rao'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1.5 border-b border-[#E8DAAE]/50">
                        <span className="text-[#6B7076] font-semibold">{k}</span>
                        <span className="text-[#16263A] font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#16263A] mb-3">Relationship Scores</h3>
                  {[
                    { label: 'Churn Risk', value: customer.churn_risk, max: 100, color: customer.churn_risk >= 70 ? '#B74C44' : customer.churn_risk >= 40 ? '#D89A20' : '#2F8467' },
                    { label: 'Lead Propensity', value: customer.lead_propensity, max: 100, color: '#F4A623' },
                    { label: 'Digital Engagement', value: customer.digital_engagement_score, max: 100, color: '#16263A' },
                  ].map(s => (
                    <div key={s.label} className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold text-[#6B7076]">{s.label}</span>
                        <span className="text-xs font-extrabold text-[#16263A]">{s.value}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#E8DAAE] rounded-full">
                        <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-3 rounded-xl bg-[#FFF9ED] border border-[#E8DAAE]">
                    <p className="text-[10px] font-bold text-[#6B7076] uppercase mb-1">Sentiment</p>
                    <p className={`text-sm font-extrabold ${customer.sentiment === 'POSITIVE' ? 'text-emerald-600' : customer.sentiment === 'NEGATIVE' ? 'text-red-600' : 'text-amber-600'}`}>{customer.sentiment}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accounts' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-[#16263A]">Accounts & Holdings ({(customer.accounts?.length || 0) + (customer.holdings?.length || 0)} products)</h3>
                {customer.accounts?.map((acc: any) => {
                  const isReactivated = reactivated.includes(acc.id);
                  const effectiveStatus = isReactivated ? 'ACTIVE' : acc.status;
                  return (
                  <div key={acc.id} className="p-4 border border-[#E8DAAE] rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-extrabold text-[#16263A] text-sm">•••• {acc.account_number.slice(-4)} — {acc.account_type}</p>
                        <p className="text-xs text-[#6B7076]">{acc.branch} · IFSC: {acc.ifsc}</p>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${effectiveStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : effectiveStatus === 'DORMANT' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{effectiveStatus === 'ACTIVE' && isReactivated ? 'REACTIVATED' : effectiveStatus}</span>
                    </div>
                    <p className={`text-lg font-extrabold ${(acc.balance || 0) < 0 ? 'text-red-600' : 'text-[#16263A]'}`}>{formatINR(Math.abs(acc.balance || 0))} {(acc.balance || 0) < 0 ? '(Utilized)' : ''}</p>
                    {acc.limit && <p className="text-xs text-[#6B7076] mt-0.5">Limit: {formatINR(acc.limit)}</p>}
                    {acc.status === 'DORMANT' && !isReactivated && (
                      <button onClick={() => setReactivated(prev => [...prev, acc.id])} className="mt-2 text-[10px] font-extrabold text-[#16263A] border border-[#16263A] px-2 py-1 rounded-lg hover:bg-[#16263A] hover:text-white transition-all">
                        Convert to Active
                      </button>
                    )}
                  </div>
                  );
                })}
                {customer.holdings?.map((h: any) => (
                  <div key={h.id} className="p-4 border border-[#E8DAAE] rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-extrabold text-[#16263A] text-sm">{h.product}</p>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">{h.status}</span>
                    </div>
                    <p className="text-lg font-extrabold text-[#16263A]">{formatINR(h.amount)}</p>
                    {h.interest_rate > 0 && <p className="text-xs text-[#6B7076] mt-0.5">Interest Rate: {h.interest_rate}% p.a.</p>}
                  </div>
                ))}
                {(!customer.accounts?.length && !customer.holdings?.length) && (
                  <p className="text-sm text-[#6B7076] text-center py-8">No accounts or holdings on record.</p>
                )}
              </div>
            )}

            {activeTab === 'digital' && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-[#16263A] mb-4">Digital Product Adoption</h3>
                {(customer.holdings || []).filter((h: any) => h.category === 'DIGITAL').map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-3 border border-[#E8DAAE] rounded-xl">
                    <p className="text-xs font-bold text-[#16263A]">{h.product}</p>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${h.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{h.status === 'ACTIVE' ? 'Activated' : 'Pending'}</span>
                  </div>
                ))}
                {!(customer.holdings || []).some((h: any) => h.category === 'DIGITAL') && (
                  <p className="text-sm text-[#6B7076] text-center py-8">No digital products tracked for this customer yet.</p>
                )}
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-[#16263A]">Lead Pipeline ({customerLeads.length})</h3>
                {customerLeads.length === 0 ? <p className="text-sm text-[#6B7076] py-6 text-center">No leads for this customer yet.</p> : (
                  customerLeads.map(lead => (
                    <div key={lead.id} className="p-4 border border-[#E8DAAE] rounded-xl">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-extrabold text-[#16263A] text-sm">{lead.product}</p>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${lead.stage === 'Converted' ? 'bg-emerald-100 text-emerald-700' : lead.stage === 'Lost' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{lead.stage}</span>
                      </div>
                      <p className="text-base font-extrabold text-[#F4A623]">{formatINR(lead.potential_value)}</p>
                      <p className="text-xs text-[#6B7076] mt-1">Owner: {lead.owner_name} · Probability: {lead.conversion_probability}%</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'visits' && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-[#16263A]">Field Visits ({customerVisits.length})</h3>
                {customerVisits.length === 0 ? <p className="text-sm text-[#6B7076] py-6 text-center">No visits recorded for this customer.</p> : (
                  customerVisits.map(v => (
                    <Link key={v.id} href={`/zrt/visits/${v.id}`} className="block p-4 border border-[#E8DAAE] rounded-xl hover:border-[#F4A623] transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-extrabold text-[#16263A] text-sm">{v.purpose}</p>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${v.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{v.status}</span>
                      </div>
                      <p className="text-xs text-[#6B7076]">{new Date(v.scheduled_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      {v.notes && <p className="text-xs text-[#16263A] mt-2 italic border-t border-[#E8DAAE] pt-2">{v.notes}</p>}
                    </Link>
                  ))
                )}
              </div>
            )}

            {activeTab === 'meetings' && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-[#16263A]">Meetings & Intelligence ({customerMeetings.length})</h3>
                {customerMeetings.length === 0 ? <p className="text-sm text-[#6B7076] py-6 text-center">No meetings logged for this customer.</p> : (
                  customerMeetings.map(m => (
                    <div key={m.id} className="p-4 border border-[#E8DAAE] rounded-xl">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-extrabold text-[#16263A] text-sm">{m.purpose}</p>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${m.sentiment === 'POSITIVE' ? 'bg-emerald-100 text-emerald-700' : m.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{m.sentiment}</span>
                      </div>
                      <p className="text-xs text-[#6B7076] mb-2">{new Date(m.scheduled_at).toLocaleDateString('en-IN')} · {m.employee_name}</p>
                      {m.summary && <p className="text-xs text-[#29313A] leading-relaxed">{m.summary}</p>}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'complaints' && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-[#16263A]">Service Complaints ({customerComplaints.length})</h3>
                {customerComplaints.length === 0 ? <p className="text-sm text-[#6B7076] py-6 text-center">No complaints on record.</p> : (
                  customerComplaints.map(c => (
                    <div key={c.id} className={`p-4 border rounded-xl ${c.severity === 'HIGH' ? 'border-red-200 bg-red-50/20' : 'border-[#E8DAAE]'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-extrabold text-[#16263A] text-sm">{c.category}</p>
                        <div className="flex gap-1">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${c.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{c.severity}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{c.status}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#6B7076] mb-1">{c.ticket_id}</p>
                      <p className="text-xs text-[#29313A]">{c.description}</p>
                      {c.resolution && <p className="text-xs text-emerald-700 mt-2 border-t border-emerald-100 pt-2">✓ {c.resolution}</p>}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'interactions' && (
              <div>
                <h3 className="text-sm font-extrabold text-[#16263A] mb-4">Interaction Timeline</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-[#E8DAAE]" />
                  <div className="space-y-5">
                    {DEMO_INTERACTIONS.map((ev, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 text-[10px] font-extrabold ${ev.sentiment === 'POSITIVE' ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : ev.sentiment === 'NEGATIVE' ? 'bg-red-100 border-red-300 text-red-600' : 'bg-amber-100 border-amber-300 text-amber-700'}`}>
                          {ev.type.charAt(0)}
                        </div>
                        <div className="pb-4">
                          <p className="text-xs font-extrabold text-[#16263A]">{ev.desc}</p>
                          <p className="text-[10px] text-[#6B7076] mt-0.5">{ev.date} · {ev.actor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-[#16263A] mb-4">Document Checklist</h3>
                {DEMO_DOCUMENTS.map(doc => (
                  <div key={doc.name} className="flex items-center justify-between p-3 border border-[#E8DAAE] rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className={`w-4 h-4 ${doc.status === 'VERIFIED' ? 'text-emerald-500' : doc.status === 'SUBMITTED' ? 'text-blue-500' : 'text-amber-500'}`} />
                      <div>
                        <p className="text-xs font-bold text-[#16263A]">{doc.name}</p>
                        <p className="text-[10px] text-[#6B7076]">{doc.type} · {doc.date}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : doc.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{doc.status}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'consent' && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-[#16263A] mb-1">Consent & Data Permissions (DPDP 2023)</h3>
                <p className="text-xs text-[#6B7076] mb-4">Customer-controlled data usage consents as per Digital Personal Data Protection Act 2023.</p>
                {consents.map(c => (
                  <div key={c.channel} className="flex items-center justify-between p-3 border border-[#E8DAAE] rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-[#16263A]">{c.purpose || 'Marketing and Product Pitches'} ({c.channel})</p>
                      <p className="text-[10px] text-[#6B7076]">Consent recorded: {new Date(c.captured_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                    {c.granted ? (
                      <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle className="w-4 h-4" /> Granted</div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500 font-bold text-xs"><XCircle className="w-4 h-4" /> Denied</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-[#16263A] mb-4">Audit Trail</h3>
                {customerAudit.length === 0 ? (
                  <p className="text-sm text-center text-[#6B7076] py-6">No audit events found.</p>
                ) : customerAudit.map(ev => (
                  <div key={ev.id} className="p-3 border border-[#E8DAAE] rounded-xl">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-extrabold bg-[#16263A] text-white px-2 py-0.5 rounded-md">{ev.action}</span>
                      <span className="text-[10px] text-[#6B7076]">{new Date(ev.created_at).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#16263A] mt-1">{ev.description}</p>
                    <p className="text-[10px] text-[#6B7076]">By: {ev.actor_name}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

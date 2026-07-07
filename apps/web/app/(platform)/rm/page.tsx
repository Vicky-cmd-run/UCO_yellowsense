'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '../../../stores/demoStore';
import { apiService } from '../../../services/api';
import {
  TrendingUp, Users, AlertTriangle, CheckCircle2, Search,
  Phone, Mail, MessageSquare, Plus, RefreshCw, Calendar,
  ShieldAlert, Sparkles, Filter, ChevronRight, UserMinus
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts';

interface CustomerData {
  id: string;
  full_name: string;
  customer_number: string;
  segment: string;
  lifecycle_stage: string;
  mobile: string;
  email: string;
  city: string;
  state: string;
  relationship_value: number;
  relationship_tenure_months: number;
  digital_engagement_score: number;
  sentiment: string;
  churn_risk: number;
  lead_propensity: number;
  assigned_rm_id: string | null;
  assigned_vrm_id: string | null;
}

export default function RMCockpit() {
  const router = useRouter();
  const { activeUser } = useDemoStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [selectedCustId, setSelectedCustId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'RETENTION' | 'DIGITAL' | 'CROSSSELL'>('RETENTION');

  // Load RM portfolio customers
  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const data = await apiService.fetchCustomers();
      // Filter customers assigned to Priya Nair (whose id is '2' or RM user)
      const rmCustomers = data.filter((c: CustomerData) => {
        // If current active user is RM, filter by assigned_rm_id
        if (activeUser && activeUser.role === 'RM') {
          return c.assigned_rm_id === activeUser.id;
        }
        // Fallback for demo when logged in as HO or Admin
        return c.assigned_rm_id === '2' || !c.assigned_rm_id;
      });
      setCustomers(rmCustomers);
      if (rmCustomers.length > 0) {
        setSelectedCustId(rmCustomers[0].id);
      }
    } catch (err) {
      console.error('Failed to load portfolio', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadPortfolio();
  }, [activeUser]);

  // Selected customer data
  const selectedCustomer = customers.find(c => c.id === selectedCustId) || null;

  // Filtered action lists
  const retentionRiskList = customers
    .filter(c => c.churn_risk >= 50)
    .sort((a, b) => b.churn_risk - a.churn_risk);

  const digitalPushList = customers
    .filter(c => c.digital_engagement_score < 50)
    .sort((a, b) => a.digital_engagement_score - b.digital_engagement_score);

  const crossSellList = customers
    .filter(c => c.lead_propensity >= 60)
    .sort((a, b) => b.lead_propensity - a.lead_propensity);

  // Search filter
  const searchedCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customer_number.includes(searchQuery)
  );

  // Recharts scatter dataset
  const scatterData = searchedCustomers.map(c => ({
    ...c,
    x: c.churn_risk,
    y: c.digital_engagement_score,
    z: Math.max(c.relationship_value / 100000, 5) // bubble sizing scale
  }));

  // Calculations
  const totalAUM = customers.reduce((acc, c) => acc + c.relationship_value, 0);
  const atRiskAUM = retentionRiskList.reduce((acc, c) => acc + c.relationship_value, 0);
  const avgDigitalScore = customers.length > 0 
    ? Math.round(customers.reduce((acc, c) => acc + c.digital_engagement_score, 0) / customers.length)
    : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Recharts tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface border border-border-warm rounded-xl p-3 shadow-lg text-xs space-y-1.5 z-50">
          <div className="font-extrabold text-navy">{data.full_name}</div>
          <div className="text-text-sub">CID: {data.customer_number}</div>
          <div className="flex justify-between gap-4">
            <span>Churn Risk:</span>
            <span className="font-bold text-danger-acc">{data.churn_risk}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Digital Engagement:</span>
            <span className="font-bold text-navy">{data.digital_engagement_score}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Relationship Value:</span>
            <span className="font-extrabold text-success-acc">{formatCurrency(data.relationship_value)}</span>
          </div>
        </div>
      );
    };
    return null;
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">RM Workspace Cockpit</h1>
          <p className="text-text-sub text-sm">
            Manage Priya Nair&apos;s relationship values, monitor churn alerts, and execute cross-sell.
          </p>
        </div>

        <button
          onClick={loadPortfolio}
          className="p-2.5 border border-border-warm bg-surface hover:bg-bg-warm text-text-main rounded-xl transition duration-150 flex items-center gap-2 text-sm font-semibold"
        >
          <RefreshCw className="w-4 h-4 text-text-sub" />
          <span>Refresh Cockpit</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="premium-card bg-surface flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-acc/10 flex items-center justify-center text-navy shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-text-sub uppercase font-extrabold tracking-wide">Customers Managed</div>
            <div className="text-2xl font-extrabold text-navy">{customers.length}</div>
            <div className="text-[10px] text-text-sub font-semibold mt-0.5">
              Premium & MSME Segments
            </div>
          </div>
        </div>

        <div className="premium-card bg-surface flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-acc/10 flex items-center justify-center text-success-acc shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-text-sub uppercase font-extrabold tracking-wide">Managed AUM (INR)</div>
            <div className="text-2xl font-extrabold text-success-acc">{formatCurrency(totalAUM)}</div>
            <div className="text-[10px] text-text-sub font-semibold mt-0.5">
              Deposits, Loans & Insurance
            </div>
          </div>
        </div>

        <div className="premium-card bg-surface flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-danger-acc/10 flex items-center justify-center text-danger-acc shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-text-sub uppercase font-extrabold tracking-wide">AUM At Churn Risk</div>
            <div className="text-2xl font-extrabold text-danger-acc">{formatCurrency(atRiskAUM)}</div>
            <div className="text-[10px] text-text-sub font-semibold mt-0.5">
              {retentionRiskList.length} accounts &gt; 50% churn risk
            </div>
          </div>
        </div>

        <div className="premium-card bg-surface flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-acc/10 flex items-center justify-center text-orange-acc shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-text-sub uppercase font-extrabold tracking-wide">Avg Digital Score</div>
            <div className="text-2xl font-extrabold text-navy">{avgDigitalScore}%</div>
            <div className="text-[10px] text-text-sub font-semibold mt-0.5">
              Mobile app / QR adoption rate
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Scatter Matrix + Selected Customer Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scatter quadrant matrix plot */}
        <div className="lg:col-span-8 space-y-4">
          <div className="premium-card bg-surface">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-border-warm mb-4">
              <div>
                <h3 className="font-extrabold text-navy text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-acc" />
                  <span>Relationship Quadrant Matrix</span>
                </h3>
                <p className="text-[11px] text-text-sub">Scatter of Digital Engagement vs Churn Risk</p>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" />
                <input
                  type="text"
                  placeholder="Filter customer in matrix..."
                  className="pl-8 pr-3 py-1.5 bg-bg-warm border border-border-warm rounded-xl text-xs focus:outline-none w-full text-text-main"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Matrix rendering */}
            {loading ? (
              <div className="h-[350px] flex items-center justify-center text-text-sub">
                <span>Loading portfolio matrix...</span>
              </div>
            ) : (
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8DAAE" opacity={0.4} />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Churn Risk"
                      unit="%"
                      domain={[0, 100]}
                      label={{ value: 'Churn Risk (%) →', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#6B7076', fontWeight: 'bold' }}
                      tick={{ fontSize: 10, fill: '#29313A' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Digital score"
                      unit="%"
                      domain={[0, 100]}
                      label={{ value: 'Digital Engagement (%) →', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: '#6B7076', fontWeight: 'bold' }}
                      tick={{ fontSize: 10, fill: '#29313A' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Quadrant dividing references */}
                    <ReferenceLine x={50} stroke="#E8DAAE" strokeWidth={1} strokeDasharray="5 5" />
                    <ReferenceLine y={50} stroke="#E8DAAE" strokeWidth={1} strokeDasharray="5 5" />

                    <Scatter
                      name="Customers Managed"
                      data={scatterData}
                      fill="#FF8A16"
                      onClick={(e: any) => e && e.payload && setSelectedCustId(e.payload.id)}
                      className="cursor-pointer hover:opacity-80"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Matrix quadrants legend info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-border-warm mt-4 text-[10px]">
              <div className="p-2 bg-success-acc/5 border border-success-acc/10 rounded-xl">
                <div className="font-extrabold text-success-acc uppercase">Q1: Champions (Safe)</div>
                <div className="text-text-sub mt-0.5">Low Churn Risk (&lt;50%), High Digital Engagement (&gt;50%)</div>
              </div>
              <div className="p-2 bg-yellow-acc/10 border border-yellow-acc/20 rounded-xl">
                <div className="font-extrabold text-orange-acc uppercase">Q2: Volatile (At Risk VIP)</div>
                <div className="text-text-sub mt-0.5">High Churn Risk (&gt;50%), High Digital Engagement (&gt;50%)</div>
              </div>
              <div className="p-2 bg-navy/5 border border-border-warm rounded-xl">
                <div className="font-extrabold text-navy uppercase">Q3: Silent (Low Touch)</div>
                <div className="text-text-sub mt-0.5">Low Churn Risk (&lt;50%), Low Digital Engagement (&lt;50%)</div>
              </div>
              <div className="p-2 bg-danger-acc/5 border border-danger-acc/10 rounded-xl">
                <div className="font-extrabold text-danger-acc uppercase">Q4: Severe (Urgent Focus)</div>
                <div className="text-text-sub mt-0.5">High Churn Risk (&gt;50%), Low Digital Engagement (&lt;50%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Customer profile sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="premium-card bg-surface flex flex-col justify-between h-full min-h-[420px]">
            {selectedCustomer ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-border-warm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {selectedCustomer.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-navy text-sm truncate">{selectedCustomer.full_name}</h4>
                      <p className="text-[10px] text-text-sub font-semibold">
                        CID: {selectedCustomer.customer_number} • {selectedCustomer.segment}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score meters */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-bg-warm border border-border-warm rounded-xl p-2.5">
                    <div className="text-text-sub font-semibold">Churn Risk</div>
                    <div className={`text-lg font-extrabold ${selectedCustomer.churn_risk >= 50 ? 'text-danger-acc' : 'text-success-acc'}`}>
                      {selectedCustomer.churn_risk}%
                    </div>
                    <div className="w-full bg-border-warm h-1 rounded-full mt-1.5">
                      <div className={`h-1 rounded-full ${selectedCustomer.churn_risk >= 50 ? 'bg-danger-acc' : 'bg-success-acc'}`} style={{ width: `${selectedCustomer.churn_risk}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-bg-warm border border-border-warm rounded-xl p-2.5">
                    <div className="text-text-sub font-semibold">Digital Score</div>
                    <div className="text-lg font-extrabold text-navy">
                      {selectedCustomer.digital_engagement_score}%
                    </div>
                    <div className="w-full bg-border-warm h-1 rounded-full mt-1.5">
                      <div className="h-1 bg-navy rounded-full" style={{ width: `${selectedCustomer.digital_engagement_score}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Demographics details */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border-warm/60">
                    <span className="text-text-sub">Lifecycle Stage</span>
                    <span className="font-bold text-navy uppercase">{selectedCustomer.lifecycle_stage}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border-warm/60">
                    <span className="text-text-sub">Sentiment</span>
                    <span className={`font-bold ${selectedCustomer.sentiment === 'NEGATIVE' ? 'text-danger-acc' : (selectedCustomer.sentiment === 'POSITIVE' ? 'text-success-acc' : 'text-warm-gold')}`}>
                      {selectedCustomer.sentiment}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border-warm/60">
                    <span className="text-text-sub">AUM Value</span>
                    <span className="font-extrabold text-success-acc">{formatCurrency(selectedCustomer.relationship_value)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-sub">Contact Number</span>
                    <span className="font-bold text-navy">{selectedCustomer.mobile}</span>
                  </div>
                </div>

                {/* Quick RM Contact Actions */}
                <div className="space-y-2 pt-2 border-t border-border-warm">
                  <div className="text-[10px] text-text-sub uppercase font-extrabold tracking-wide">Initiate Customer Reach</div>
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={`tel:${selectedCustomer.mobile}`}
                      className="p-2 border border-border-warm hover:border-yellow-acc bg-bg-warm/50 hover:bg-yellow-acc/10 rounded-xl text-center text-xs font-bold text-navy transition flex flex-col items-center gap-1"
                    >
                      <Phone className="w-4 h-4 text-orange-acc" />
                      <span>Call Client</span>
                    </a>
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="p-2 border border-border-warm hover:border-yellow-acc bg-bg-warm/50 hover:bg-yellow-acc/10 rounded-xl text-center text-xs font-bold text-navy transition flex flex-col items-center gap-1"
                    >
                      <Mail className="w-4 h-4 text-orange-acc" />
                      <span>Email Brief</span>
                    </a>
                    <button
                      onClick={() => {
                        apiService.createVisit(selectedCustomer.id, 'RM Retention Meeting', new Date(Date.now() + 86400000).toISOString());
                        alert('Field Retention visit draft auto-scheduled for tomorrow.');
                      }}
                      className="p-2 border border-border-warm hover:border-yellow-acc bg-bg-warm/50 hover:bg-yellow-acc/10 rounded-xl text-center text-xs font-bold text-navy transition flex flex-col items-center gap-1"
                    >
                      <Calendar className="w-4 h-4 text-orange-acc" />
                      <span>Book Visit</span>
                    </button>
                  </div>

                  <button
                    onClick={() => router.push(`/customers/${selectedCustomer.id}`)}
                    className="w-full py-2 bg-navy hover:bg-navy/95 text-white text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <span>View Customer 360 profile</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-text-sub text-xs">
                <span>Select a customer in the quadrant matrix to load context.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Priority Actions lists desk */}
      <div className="premium-card bg-surface">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-border-warm mb-4">
          <div>
            <h3 className="font-extrabold text-navy text-sm uppercase tracking-wide">RM Portfolio Priority Tasks</h3>
            <p className="text-[11px] text-text-sub">System generated action items sequenced by urgency</p>
          </div>

          {/* Action Tabs */}
          <div className="flex bg-bg-warm border border-border-warm rounded-xl p-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('RETENTION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'RETENTION' ? 'bg-surface text-orange-acc shadow-xs' : 'text-text-sub hover:text-text-main'
              }`}
            >
              At-Risk Save ({retentionRiskList.length})
            </button>
            <button
              onClick={() => setActiveTab('DIGITAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'DIGITAL' ? 'bg-surface text-orange-acc shadow-xs' : 'text-text-sub hover:text-text-main'
              }`}
            >
              Digital Push ({digitalPushList.length})
            </button>
            <button
              onClick={() => setActiveTab('CROSSSELL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'CROSSSELL' ? 'bg-surface text-orange-acc shadow-xs' : 'text-text-sub hover:text-text-main'
              }`}
            >
              High Propensity ({crossSellList.length})
            </button>
          </div>
        </div>

        {/* Tab Lists */}
        {activeTab === 'RETENTION' && (
          <div className="divide-y divide-border-warm">
            {retentionRiskList.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-sub">No high risk churn alerts in portfolio.</div>
            ) : (
              retentionRiskList.map((cust) => (
                <div key={cust.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-extrabold text-navy">{cust.full_name}</div>
                    <div className="text-[10px] text-text-sub">
                      CID: {cust.customer_number} • Sentiment: <span className="font-bold text-danger-acc">{cust.sentiment}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-right text-[10px] text-text-sub">Risk score</div>
                      <div className="font-extrabold text-danger-acc text-right">{cust.churn_risk}% Risk</div>
                    </div>
                    <button
                      onClick={() => setSelectedCustId(cust.id)}
                      className="px-3 py-1.5 bg-navy text-white hover:bg-navy/90 font-bold rounded-xl transition text-[10px]"
                    >
                      Retention Check
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'DIGITAL' && (
          <div className="divide-y divide-border-warm">
            {digitalPushList.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-sub">All managed customers digitally onboarded.</div>
            ) : (
              digitalPushList.map((cust) => (
                <div key={cust.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-extrabold text-navy">{cust.full_name}</div>
                    <div className="text-[10px] text-text-sub">
                      CID: {cust.customer_number} • City: {cust.city}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-right text-[10px] text-text-sub">Engagement</div>
                      <div className="font-extrabold text-orange-acc text-right">{cust.digital_engagement_score}%</div>
                    </div>
                    <button
                      onClick={() => {
                        apiService.createVisit(cust.id, 'Digital QR Setup/Training run', new Date(Date.now() + 86400000).toISOString());
                        alert(`Mobilized ZRT setup visit scheduled for ${cust.full_name}`);
                      }}
                      className="px-3 py-1.5 bg-yellow-acc hover:bg-yellow-acc/90 text-navy font-bold rounded-xl transition text-[10px]"
                    >
                      Schedule QR Visit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'CROSSSELL' && (
          <div className="divide-y divide-border-warm">
            {crossSellList.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-sub">No pending high propensity cross-sells.</div>
            ) : (
              crossSellList.map((cust) => (
                <div key={cust.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-extrabold text-navy">{cust.full_name}</div>
                    <div className="text-[10px] text-text-sub">
                      CID: {cust.customer_number} • Segment: {cust.segment}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-right text-[10px] text-text-sub">Propensity</div>
                      <div className="font-extrabold text-success-acc text-right">{cust.lead_propensity}%</div>
                    </div>
                    <button
                      onClick={() => {
                        router.push(`/leads`);
                        // Simulation of direct lead adding
                      }}
                      className="px-3 py-1.5 bg-success-acc hover:bg-success-acc/90 text-white font-bold rounded-xl transition text-[10px]"
                    >
                      Pitch Product
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

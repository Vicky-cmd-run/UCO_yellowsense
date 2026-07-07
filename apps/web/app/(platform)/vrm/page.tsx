'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '../../../stores/demoStore';
import { apiService } from '../../../services/api';
import {
  Phone, PhoneCall, PhoneOff, MessageSquare, ShieldAlert, Sparkles,
  User, CheckCircle2, History, AlertCircle, Clock, Check,
  Search, Star, BookOpen, FileText, ChevronRight, CornerDownRight,
  TrendingUp, ArrowRight, Loader2
} from 'lucide-react';

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
  digital_engagement_score: number;
  sentiment: string;
  churn_risk: number;
  lead_propensity: number;
  assigned_rm_id: string | null;
  assigned_vrm_id: string | null;
}

interface QueueItem {
  id: string;
  customer: CustomerData;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'CONNECTED' | 'NO_ANSWER' | 'COMPLETED';
  notes?: string;
}

export default function VRMWorkspaceDesk() {
  const router = useRouter();
  const { activeUser } = useDemoStore();
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  
  // Call simulation states
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callOutcome, setCallOutcome] = useState('CONNECTED');
  const [callNotes, setCallNotes] = useState('');
  const [savingOutcome, setSavingOutcome] = useState(false);

  // Load Vikram's queue
  const loadQueue = async () => {
    setLoading(true);
    try {
      const customersData = await apiService.fetchCustomers();
      // Filter customers assigned to VRM Vikram Shah (id = '3')
      const vrmCustomers = customersData.filter((c: CustomerData) => {
        if (activeUser && activeUser.role === 'VRM') {
          return c.assigned_vrm_id === activeUser.id;
        }
        return c.assigned_vrm_id === '3' || !c.assigned_vrm_id;
      });

      // Map to contact queue reasons based on churn risk or lead propensity
      const mappedQueue: QueueItem[] = vrmCustomers.map((c: CustomerData, idx: number) => {
        let reason = 'Re-engagement check-in';
        let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
        
        if (c.churn_risk >= 65) {
          reason = 'High Churn Risk Retention Save';
          priority = 'HIGH';
        } else if (c.lead_propensity >= 70) {
          reason = 'Pre-Approved Cross-Sell Pitch';
          priority = 'HIGH';
        } else if (c.digital_engagement_score < 40) {
          reason = 'Digital App Activation Push';
          priority = 'LOW';
        } else if (idx % 3 === 0) {
          reason = 'Account Review & Birthday Greeting';
          priority = 'LOW';
        }
        
        return {
          id: `queue-${c.id}`,
          customer: c,
          reason,
          priority,
          status: 'PENDING'
        };
      });

      // Sort: HIGH priority first
      mappedQueue.sort((a, b) => {
        const priorityScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
      });

      setQueue(mappedQueue);
      if (mappedQueue.length > 0) {
        setSelectedQueueId(mappedQueue[0].id);
      }
    } catch (err) {
      console.error('Failed to load VRM queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [activeUser]);

  // Selected queue customer item
  const activeItem = queue.find(item => item.id === selectedQueueId) || null;
  const activeCustomer = activeItem?.customer || null;

  // Call timer simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (inCall) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [inCall]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Dial simulation triggers
  const handleStartCall = () => {
    setInCall(true);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    setInCall(false);
  };

  // Logging outcome details
  const handleSaveOutcome = async () => {
    if (!activeItem) return;
    setSavingOutcome(true);

    try {
      // Create a mock meeting register in apiService to persist this log
      if (activeCustomer && callNotes) {
        await apiService.createMeeting(
          activeCustomer.id,
          `VRM: ${activeItem.reason}`,
          new Date().toISOString(),
          `Call Transcript summary: Customer contacted via phone. Outcome: ${callOutcome}. Notes: ${callNotes}`
        );
      }

      // Update local queue item status
      setQueue(prev => prev.map(item => {
        if (item.id === activeItem.id) {
          return {
            ...item,
            status: callOutcome as any,
            notes: callNotes
          };
        }
        return item;
      }));

      alert('Call outcome successfully registered & logged in timeline!');
      
      // Auto move to the next pending item in queue
      const currentIndex = queue.findIndex(item => item.id === activeItem.id);
      const nextPendingItem = queue.slice(currentIndex + 1).find(item => item.status === 'PENDING');
      
      if (nextPendingItem) {
        setSelectedQueueId(nextPendingItem.id);
      }
      
      // Reset form states
      setCallNotes('');
      setCallOutcome('CONNECTED');
    } catch (err: any) {
      console.error(err);
      alert('Failed to log call outcome: ' + err.message);
    } finally {
      setSavingOutcome(false);
    }
  };

  // Mock AI Suggested Prep Brief matching customer parameters
  const getAIBrief = (cust: CustomerData, reason: string) => {
    if (cust.churn_risk >= 65) {
      return {
        situation: 'Customer sentiment is negative. Recently filed a complaint regarding loan disbursement delays.',
        objective: 'Apologize for operational delay. Offer processing fee waiver on their active accounts.',
        productPitch: 'Waiver & upgrade to Premium Current Account',
        toneGuide: 'Empathetic, apologetic, resolution-driven'
      };
    }
    if (cust.lead_propensity >= 70) {
      return {
        situation: 'High cash transactions in corporate account, business turnover is expanding.',
        objective: 'Pitch pre-approved Business Growth working capital loan of ₹15,00,000.',
        productPitch: 'Working Capital Term Loan',
        toneGuide: 'Consultative, premium, relationship-oriented'
      };
    }
    return {
      situation: 'Normal accounts management review. Low digital active score.',
      objective: 'Help onboard them to mobile banking app or deploy a quick QR merchant stand.',
      productPitch: 'Yellow QR stand & Mobile Activation',
      toneGuide: 'Helpful, instructional, supportive'
    };
  };

  // Mock interaction history logs
  const mockInteractions = [
    { type: 'SMS', date: '3 days ago', text: 'OTP for online banking verification sent.' },
    { type: 'EMAIL', date: '1 week ago', text: 'Monthly account statement statement dispatched.' },
    { type: 'SYSTEM', date: '2 weeks ago', text: 'GST filing transaction registered.' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy font-sans">VRM Contact Desk</h1>
        <p className="text-text-sub text-sm">
          Vikram Shah&apos;s queue. Engage assigned accounts, log call telemetry, and review AI briefs.
        </p>
      </div>

      {/* Main Double Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Contact Queue List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="premium-card bg-surface flex flex-col h-[580px]">
            <div className="pb-3 border-b border-border-warm">
              <h3 className="font-extrabold text-navy text-sm uppercase tracking-wide">Dialer Work Queue</h3>
              <p className="text-[11px] text-text-sub mt-0.5">
                {queue.filter(q => q.status === 'PENDING').length} calls pending out of {queue.length}
              </p>
            </div>

            {/* Search */}
            <div className="my-3 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" />
              <input
                type="text"
                placeholder="Search queue customer..."
                className="pl-8 pr-3 py-1.5 bg-bg-warm border border-border-warm rounded-xl text-xs focus:outline-none w-full text-text-main"
              />
            </div>

            {/* Queue scrollbox */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-text-sub text-xs gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-orange-acc" />
                <span>Loading Vikram&apos;s desk...</span>
              </div>
            ) : queue.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-text-sub text-xs">
                No active contacts in call queue.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {queue.map((item) => {
                  const isActive = item.id === selectedQueueId;
                  const isCompleted = item.status === 'COMPLETED' || item.status === 'CONNECTED';
                  const priorityColor = item.priority === 'HIGH' ? 'bg-danger-acc/10 text-danger-acc border-danger-acc/20' : (item.priority === 'MEDIUM' ? 'bg-yellow-acc/15 text-orange-acc border-yellow-acc/35' : 'bg-navy/5 text-navy border-border-warm');

                  return (
                    <div
                      key={item.id}
                      onClick={() => !inCall && setSelectedQueueId(item.id)}
                      className={`p-3 border rounded-2xl cursor-pointer transition text-left ${
                        isActive
                          ? 'bg-yellow-acc/10 border-yellow-acc shadow-xs ring-1 ring-yellow-acc/30'
                          : 'bg-surface border-border-warm hover:border-yellow-acc/30'
                      } ${inCall ? 'pointer-events-none opacity-60' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-extrabold text-navy text-xs truncate max-w-[130px]">
                          {item.customer.full_name}
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${priorityColor}`}>
                          {item.priority}
                        </span>
                      </div>

                      <div className="text-[10px] text-text-main font-semibold mt-1 truncate">
                        {item.reason}
                      </div>

                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border-warm/40 text-[9px] text-text-sub">
                        <span>CID: {item.customer.customer_number}</span>
                        <span>
                          {item.status === 'PENDING' ? (
                            <span className="text-orange-acc font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Call pending
                            </span>
                          ) : (
                            <span className="text-success-acc font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Logged
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Context and Dial Desk */}
        <div className="lg:col-span-8 space-y-4">
          {activeCustomer ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Mid column: Customer profile details & AI brief */}
              <div className="md:col-span-7 space-y-4">
                {/* AI Brief card */}
                <div className="premium-card bg-surface space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-yellow-acc/25 px-2 py-0.5 text-[9px] text-orange-acc font-extrabold uppercase rounded-bl-xl border-l border-b border-yellow-acc/30">
                    YellowSense Copilot
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-acc">
                    <Sparkles className="w-4.5 h-4.5" />
                    <span>AI Call Preparation Brief</span>
                  </div>

                  {(() => {
                    const brief = getAIBrief(activeCustomer, activeItem?.reason || '');
                    return (
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <div className="text-text-sub font-semibold">Active Situation Context</div>
                          <p className="text-navy font-medium mt-0.5">{brief.situation}</p>
                        </div>
                        <div>
                          <div className="text-text-sub font-semibold">Target Engagement Objective</div>
                          <p className="text-navy font-medium mt-0.5">{brief.objective}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="p-2 bg-bg-warm border border-border-warm rounded-xl">
                            <div className="text-[10px] text-text-sub font-bold uppercase">Pitch Product</div>
                            <div className="font-extrabold text-navy mt-0.5">{brief.productPitch}</div>
                          </div>
                          <div className="p-2 bg-bg-warm border border-border-warm rounded-xl">
                            <div className="text-[10px] text-text-sub font-bold uppercase">Recommended Tone</div>
                            <div className="font-extrabold text-navy mt-0.5">{brief.toneGuide}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Customer timeline / profile */}
                <div className="premium-card bg-surface space-y-3">
                  <h3 className="font-extrabold text-navy text-xs uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-border-warm">
                    <History className="w-4 h-4 text-orange-acc" />
                    <span>Recent Activity & Verification</span>
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    {mockInteractions.map((item, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <span className="px-1.5 py-0.5 rounded bg-bg-warm border border-border-warm text-[8px] font-bold text-text-sub shrink-0 uppercase mt-0.5">
                          {item.type}
                        </span>
                        <div>
                          <div className="text-[10px] text-text-sub">{item.date}</div>
                          <p className="text-navy font-medium mt-0.5">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => router.push(`/customers/${activeCustomer.id}`)}
                    className="w-full py-2 border border-dashed border-border-warm hover:border-yellow-acc hover:bg-yellow-acc/10 text-navy font-bold rounded-xl text-xs transition mt-2 flex items-center justify-center gap-1"
                  >
                    <span>Full Customer 360 overview</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right panel: Phone simulator & Log input */}
              <div className="md:col-span-5 space-y-4">
                {/* Active Phone Call Card */}
                <div className="premium-card bg-navy text-white text-center space-y-4 relative overflow-hidden h-[240px] flex flex-col justify-between">
                  <div className="absolute top-0 inset-x-0 h-1 bg-yellow-acc"></div>
                  
                  <div className="pt-2">
                    <div className="text-[10px] text-yellow-acc font-extrabold uppercase tracking-widest">
                      {inCall ? 'Call In Progress' : 'Connected to outbound line'}
                    </div>
                    <h4 className="text-lg font-extrabold mt-1 truncate">{activeCustomer.full_name}</h4>
                    <p className="text-xs text-zinc-300 mt-0.5">{activeCustomer.mobile}</p>
                  </div>

                  {inCall ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold font-mono tracking-widest">{formatTime(callDuration)}</div>
                      
                      <button
                        onClick={handleEndCall}
                        className="mx-auto w-12 h-12 rounded-full bg-danger-acc hover:bg-danger-acc/90 flex items-center justify-center transition shadow-lg"
                      >
                        <PhoneOff className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-zinc-300">Outbound queue item ready</div>
                      
                      <button
                        onClick={handleStartCall}
                        className="mx-auto w-14 h-14 rounded-full bg-success-acc hover:bg-success-acc/90 flex items-center justify-center transition shadow-lg animate-bounce"
                      >
                        <PhoneCall className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  )}

                  <div className="text-[10px] text-zinc-400 pb-1">
                    Call recording is enabled for automated quality assurance audits.
                  </div>
                </div>

                {/* Logging input form */}
                <div className="premium-card bg-surface space-y-3">
                  <h3 className="font-extrabold text-navy text-xs uppercase tracking-wide">Register Call Outcome</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">Status outcome</label>
                      <select
                        className="w-full px-3 py-2 bg-bg-warm border border-border-warm rounded-xl text-xs text-text-main font-semibold focus:outline-none"
                        value={callOutcome}
                        onChange={(e) => setCallOutcome(e.target.value)}
                      >
                        <option value="CONNECTED">Connected & Logged</option>
                        <option value="NO_ANSWER">No Answer / Busy</option>
                        <option value="COMPLETED">Callback Scheduled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">Call wrap-up comments</label>
                      <textarea
                        rows={2}
                        className="w-full p-2 bg-bg-warm border border-border-warm rounded-xl text-xs focus:outline-none"
                        placeholder="Write client commitment comments, lead pitch notes..."
                        value={callNotes}
                        onChange={(e) => setCallNotes(e.target.value)}
                      ></textarea>
                    </div>

                    <button
                      onClick={handleSaveOutcome}
                      disabled={savingOutcome || inCall}
                      className="w-full py-2 bg-navy hover:bg-navy/90 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      {savingOutcome ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Log Wrap-up & Advance</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="premium-card bg-surface h-full min-h-[400px] flex items-center justify-center text-text-sub text-xs">
              <span>Select outbound lead from the queue desk.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

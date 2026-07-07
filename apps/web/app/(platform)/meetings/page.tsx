'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api';
import {
  Calendar, Clock, User, Plus, RefreshCw, Sparkles, Brain,
  CheckSquare, Smile, Frown, Meh, AlertCircle, Send, CheckCircle2
} from 'lucide-react';

interface Meeting {
  id: string;
  customer_id: string;
  employee_id: string;
  scheduled_at: string;
  purpose: string;
  transcript: string | null;
  summary: string | null;
  sentiment: string;
  action_items: string | null;
  follow_up_date: string | null;
}

interface Customer {
  id: string;
  full_name: string;
  customer_number: string;
  segment: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerMap, setCustomerMap] = useState<Record<string, string>>({});
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // New Meeting Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState('');
  const [newPurpose, setNewPurpose] = useState('');
  const [newScheduledAt, setNewScheduledAt] = useState('');
  const [newTranscript, setNewTranscript] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [meetingsData, customersData] = await Promise.all([
          apiService.fetchMeetings(),
          apiService.fetchCustomers()
        ]);

        setMeetings(meetingsData);
        setCustomers(customersData);

        const cmap: Record<string, string> = {};
        customersData.forEach((c: Customer) => {
          cmap[c.id] = c.full_name;
        });
        setCustomerMap(cmap);

        // Auto-select first meeting if available
        if (meetingsData.length > 0) {
          // Keep current selection if refreshing, otherwise choose first
          setSelectedMeeting(prev => {
            const found = meetingsData.find((m: Meeting) => m.id === prev?.id);
            return found || meetingsData[0];
          });
        }
      } catch (err: any) {
        console.error('Failed to load meetings data', err);
        setError(err.message || 'Failed to retrieve meetings from service.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshTrigger]);

  const handleGenerateIntelligence = async (meetingId: string) => {
    setGenerating(true);
    try {
      const updated = await apiService.generateMeetingIntelligence(meetingId);
      setMeetings(prev => prev.map(m => m.id === meetingId ? updated : m));
      setSelectedMeeting(updated);
    } catch (err: any) {
      console.error(err);
      alert('Error generating meeting intelligence.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerId || !newPurpose || !newScheduledAt) {
      alert('Please fill out all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await apiService.createMeeting(
        newCustomerId,
        newPurpose,
        newScheduledAt,
        newTranscript || null
      );
      setShowCreateModal(false);
      setNewCustomerId('');
      setNewPurpose('');
      setNewScheduledAt('');
      setNewTranscript('');
      setRefreshTrigger(prev => prev + 1);
      setSelectedMeeting(created);
    } catch (err: any) {
      console.error(err);
      alert('Failed to schedule meeting: ' + (err.message || 'unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Pre-fill transcript for demo
  const loadShowcaseTranscript = () => {
    setNewPurpose('MSME Loan Discussion');
    setNewTranscript(
      `RM: Good morning Mr. Kumar, thanks for connecting today. How is the expansion planning coming along?\n` +
      `Customer: Yes Priya, we are finalized on the warehouse site in Coimbatore. The land acquisition is complete. We need about ₹25 Lakhs for the civil construction works to start next month.\n` +
      `RM: That is excellent progress. We can look at a Cash Credit limit or a term loan depending on the structure. Can you share the GST filings for the last 12 months?\n` +
      `Customer: Yes, I can have my accountant email the GST returns and audited financial statements for last year by Friday. What are the current rates for MSME expansion?\n` +
      `RM: Rates are starting from 8.85% for your credit profile, but I will confirm the exact terms once I review the cash flow. Let's touch base on Friday after you send the documents.`
    );
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toUpperCase()) {
      case 'POSITIVE':
        return <Smile className="w-4 h-4 text-success-acc" />;
      case 'NEGATIVE':
        return <Frown className="w-4 h-4 text-danger-acc" />;
      default:
        return <Meh className="w-4 h-4 text-warning-acc" />;
    }
  };

  const getSentimentClass = (sentiment: string) => {
    switch (sentiment?.toUpperCase()) {
      case 'POSITIVE':
        return 'bg-success-acc/10 text-success-acc';
      case 'NEGATIVE':
        return 'bg-danger-acc/10 text-danger-acc';
      default:
        return 'bg-warning-acc/10 text-warning-acc';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Meeting Intelligence Hub</h1>
          <p className="text-text-sub text-sm mt-1">
            Analyze relationship manager meeting transcripts, auto-extract action items, and detect customer sentiments.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="p-2 border border-border-warm hover:bg-surface text-navy rounded-xl transition bg-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-text-sub" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-yellow-acc hover:bg-yellow-acc/90 text-navy font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-1 h-[500px] bg-surface border border-border-warm rounded-2xl"></div>
          <div className="lg:col-span-2 h-[500px] bg-surface border border-border-warm rounded-2xl"></div>
        </div>
      ) : error ? (
        <div className="premium-card text-center p-8 max-w-lg mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-danger-acc mx-auto" />
          <h3 className="text-lg font-bold text-navy">Error Loading Meetings</h3>
          <p className="text-text-sub text-sm">{error}</p>
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="px-4 py-2 bg-yellow-acc hover:bg-yellow-acc/90 text-navy font-bold rounded-xl transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Meetings List */}
          <div className="lg:col-span-1 premium-card p-0 overflow-hidden flex flex-col max-h-[700px]">
            <div className="p-4 border-b border-border-warm bg-surface/50">
              <span className="text-xs font-bold text-text-sub uppercase tracking-wider">Scheduled & Completed ({meetings.length})</span>
            </div>
            <div className="divide-y divide-border-warm overflow-y-auto grow">
              {meetings.length === 0 ? (
                <div className="p-8 text-center text-text-sub text-xs">No meetings scheduled yet.</div>
              ) : (
                meetings.map(meeting => {
                  const isSelected = selectedMeeting?.id === meeting.id;
                  const customerName = customerMap[meeting.customer_id] || 'Loading customer...';
                  const dateStr = new Date(meeting.scheduled_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  return (
                    <button
                      key={meeting.id}
                      onClick={() => setSelectedMeeting(meeting)}
                      className={`w-full text-left p-4 transition flex flex-col gap-2 ${
                        isSelected ? 'bg-yellow-acc/10 border-l-4 border-l-orange-acc' : 'hover:bg-bg-warm/50'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="font-extrabold text-navy text-sm truncate max-w-[180px]">
                          {customerName}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSentimentClass(meeting.sentiment)} flex items-center gap-1`}>
                          {getSentimentIcon(meeting.sentiment)}
                          {meeting.sentiment}
                        </span>
                      </div>
                      <div className="text-text-main text-xs font-semibold truncate">
                        {meeting.purpose}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-text-sub font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateStr}
                        </span>
                        {meeting.summary ? (
                          <span className="text-success-acc flex items-center gap-1 font-bold">
                            <Brain className="w-3 h-3" />
                            Analyzed
                          </span>
                        ) : (
                          <span className="text-text-sub italic">Needs analysis</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Details / Analysis View */}
          <div className="lg:col-span-2 space-y-6">
            {selectedMeeting ? (
              <div className="premium-card space-y-6">
                {/* Meeting Meta Header */}
                <div className="pb-4 border-b border-border-warm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] text-text-sub font-bold uppercase tracking-wider">
                      Meeting details
                    </span>
                    <h2 className="text-xl font-extrabold text-navy mt-0.5">
                      {customerMap[selectedMeeting.customer_id] || 'Customer'}
                    </h2>
                    <p className="text-xs text-text-sub mt-1 flex items-center gap-3 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(selectedMeeting.scheduled_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span>•</span>
                      <span>Purpose: <strong className="text-navy">{selectedMeeting.purpose}</strong></span>
                    </p>
                  </div>

                  {!selectedMeeting.summary && selectedMeeting.transcript && (
                    <button
                      onClick={() => handleGenerateIntelligence(selectedMeeting.id)}
                      disabled={generating}
                      className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm hover:bg-navy/95 disabled:opacity-50 shrink-0"
                    >
                      {generating ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-yellow-acc" />
                      )}
                      <span>{generating ? 'Processing AI...' : 'Generate Intelligence'}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Transcript */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-navy text-sm flex items-center gap-1.5">
                      <User className="w-4 h-4 text-text-sub" />
                      <span>Meeting Transcript</span>
                    </h3>
                    <div className="p-4 bg-bg-warm/40 border border-border-warm rounded-2xl text-xs leading-relaxed max-h-[350px] overflow-y-auto whitespace-pre-line font-medium text-text-main">
                      {selectedMeeting.transcript || (
                        <div className="py-8 text-center text-text-sub italic">
                          No transcript was recorded for this meeting. Please record or paste one.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: AI Insights */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-navy text-sm flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-orange-acc" />
                      <span>AI Intelligence Report</span>
                    </h3>

                    {selectedMeeting.summary ? (
                      <div className="space-y-4">
                        {/* Summary */}
                        <div className="p-4 bg-surface border border-border-warm rounded-2xl space-y-1.5 shadow-sm">
                          <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider">Discussion Summary</span>
                          <p className="text-xs text-text-main font-semibold leading-relaxed">
                            {selectedMeeting.summary}
                          </p>
                        </div>

                        {/* Sentiment */}
                        <div className="p-4 bg-surface border border-border-warm rounded-2xl flex items-center justify-between shadow-sm">
                          <div>
                            <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider block">Customer Sentiment</span>
                            <span className="text-xs font-bold text-navy mt-0.5 block">Detected overall tone</span>
                          </div>
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold ${getSentimentClass(selectedMeeting.sentiment)} flex items-center gap-1.5`}>
                            {getSentimentIcon(selectedMeeting.sentiment)}
                            {selectedMeeting.sentiment}
                          </span>
                        </div>

                        {/* Action items */}
                        <div className="p-4 bg-surface border border-border-warm rounded-2xl space-y-2 shadow-sm">
                          <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5 text-orange-acc" />
                            Action Items
                          </span>
                          <div className="text-xs text-text-main font-semibold space-y-1.5 whitespace-pre-line leading-relaxed">
                            {selectedMeeting.action_items}
                          </div>
                        </div>

                        {/* Follow up date */}
                        {selectedMeeting.follow_up_date && (
                          <div className="p-4 bg-surface border border-border-warm rounded-2xl flex justify-between items-center shadow-sm text-xs">
                            <span className="font-bold text-navy">Recommended Follow Up Date</span>
                            <span className="font-extrabold text-orange-acc bg-orange-acc/10 px-2.5 py-1 rounded-lg">
                              {new Date(selectedMeeting.follow_up_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 border border-dashed border-border-warm rounded-2xl text-center space-y-3 bg-bg-warm/25">
                        <Sparkles className="w-8 h-8 text-yellow-acc mx-auto animate-pulse" />
                        <h4 className="font-bold text-navy text-xs">No intelligence generated yet</h4>
                        <p className="text-[11px] text-text-sub max-w-[220px] mx-auto">
                          Trigger the NLP parsing model to read the transcript, identify client sentiments, and generate action items.
                        </p>
                        {selectedMeeting.transcript ? (
                          <button
                            onClick={() => handleGenerateIntelligence(selectedMeeting.id)}
                            disabled={generating}
                            className="mt-2 px-3 py-1.5 bg-yellow-acc text-navy text-xs font-bold rounded-lg hover:bg-yellow-acc/90 transition flex items-center gap-1 mx-auto"
                          >
                            <Brain className="w-3.5 h-3.5" />
                            <span>{generating ? 'Processing...' : 'Analyze Now'}</span>
                          </button>
                        ) : (
                          <span className="text-text-sub text-[10px] italic">Transcript missing</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="premium-card text-center p-12 text-text-sub italic text-sm">
                Please select a meeting from the list to view its transcript and AI intelligence profile.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border-warm rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-border-warm bg-bg-warm/30 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-navy text-base">Schedule New RM Meeting</h3>
                <p className="text-[11px] text-text-sub mt-0.5">Log a customer meeting details or paste recorded transcripts.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-sub hover:text-navy font-bold text-sm px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                    Select Customer *
                  </label>
                  <select
                    className="w-full p-2 bg-bg-warm border border-border-warm rounded-xl text-xs focus:outline-none text-text-main font-semibold"
                    value={newCustomerId}
                    onChange={e => setNewCustomerId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Account --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.segment})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                    Scheduled At *
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 bg-bg-warm border border-border-warm rounded-xl text-xs focus:outline-none text-text-main font-semibold"
                    value={newScheduledAt}
                    onChange={e => setNewScheduledAt(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-navy uppercase tracking-wider">
                    Purpose / Meeting Title *
                  </label>
                  <button
                    type="button"
                    onClick={loadShowcaseTranscript}
                    className="text-[10px] font-bold text-orange-acc hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Load Showcase Demo
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. MSME Loan Discussion, Wealth Portfolio Advisory"
                  className="w-full p-2 bg-bg-warm border border-border-warm rounded-xl text-xs focus:outline-none text-text-main font-semibold"
                  value={newPurpose}
                  onChange={e => setNewPurpose(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                  Recorded Transcript (Optional)
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste dialogue transcripts here to trigger AI summary and action item discovery..."
                  className="w-full p-2 bg-bg-warm border border-border-warm rounded-xl text-xs focus:outline-none text-text-main leading-relaxed"
                  value={newTranscript}
                  onChange={e => setNewTranscript(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-warm">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-border-warm text-navy text-xs font-bold rounded-xl hover:bg-bg-warm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-yellow-acc text-navy text-xs font-bold rounded-xl hover:bg-yellow-acc/90 transition flex items-center gap-1"
                >
                  {submitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

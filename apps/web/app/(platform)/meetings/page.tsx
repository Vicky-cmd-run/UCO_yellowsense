'use client';

import React, { useState } from 'react';
import { DEMO_MEETINGS, DEMO_CUSTOMERS } from '@/services/DEMO_DATA';
import {
  Calendar, Clock, User, Plus, Sparkles, Brain,
  CheckSquare, Smile, Frown, Meh, AlertCircle, X, ChevronRight,
  FileText, MessageSquare, CheckCircle2, Mic
} from 'lucide-react';

const SENTIMENT_ICONS: Record<string, any> = {
  POSITIVE: Smile,
  NEGATIVE: Frown,
  NEUTRAL: Meh,
};

const SENTIMENT_STYLES: Record<string, string> = {
  POSITIVE: 'text-emerald-600 bg-emerald-50',
  NEGATIVE: 'text-red-500 bg-red-50',
  NEUTRAL: 'text-amber-600 bg-amber-50',
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>(DEMO_MEETINGS);
  const [selected, setSelected] = useState<any>(DEMO_MEETINGS[0]);
  const [generating, setGenerating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newPurpose, setNewPurpose] = useState('');
  const [newCustomerId, setNewCustomerId] = useState(DEMO_CUSTOMERS[0].id);
  const [newTranscript, setNewTranscript] = useState('');

  const customerMap = Object.fromEntries(DEMO_CUSTOMERS.map(c => [c.id, c.full_name]));

  const generateIntelligence = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2200));
    // Simulate intelligence being populated on the selected meeting
    setMeetings(prev => prev.map(m => {
      if (m.id !== selected.id) return m;
      return {
        ...m,
        summary: m.summary || 'AI-generated summary: Key discussion points captured during the meeting. Customer expressed interest in product expansion. Follow-up required within 7 days.',
        action_items: m.action_items || JSON.stringify(['Follow up with customer within 7 days', 'Submit required documentation', 'Schedule credit assessment meeting']),
      };
    }));
    setSelected((prev: any) => ({
      ...prev,
      summary: prev.summary || 'AI-generated summary: Key discussion points captured during the meeting. Customer expressed interest in product expansion. Follow-up required within 7 days.',
      action_items: prev.action_items || JSON.stringify(['Follow up with customer within 7 days', 'Submit required documentation', 'Schedule credit assessment meeting']),
    }));
    setGenerating(false);
  };

  const handleCreate = () => {
    const newMeeting = {
      id: `m${Date.now()}`,
      customer_id: newCustomerId,
      customer_name: customerMap[newCustomerId] || 'Unknown',
      employee_id: 'u002',
      employee_name: 'Priya Nair',
      scheduled_at: new Date().toISOString(),
      purpose: newPurpose,
      duration_mins: 30,
      transcript: newTranscript || null,
      summary: null,
      action_items: null,
      sentiment: 'NEUTRAL',
      follow_up_date: null,
    };
    setMeetings(prev => [newMeeting, ...prev]);
    setSelected(newMeeting);
    setShowCreate(false);
    setNewPurpose('');
    setNewTranscript('');
  };

  const actionItems = selected.action_items ? JSON.parse(selected.action_items) : [];
  const SentimentIcon = SENTIMENT_ICONS[selected.sentiment] || Meh;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16263A] tracking-tight">Meeting Intelligence</h1>
          <p className="text-[#6B7076] text-sm mt-1">AI-powered transcript analysis — summaries, action items & sentiment</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#16263A] hover:bg-[#16263A]/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Log Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting List */}
        <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-4 space-y-2 h-fit">
          <p className="text-xs font-extrabold text-[#6B7076] uppercase tracking-wider mb-3">
            {meetings.length} Meetings
          </p>
          {meetings.map(m => {
            const SI = SENTIMENT_ICONS[m.sentiment] || Meh;
            return (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selected.id === m.id ? 'border-[#16263A] bg-[#16263A]/5' : 'border-[#E8DAAE] hover:border-[#F4A623]'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-extrabold text-[#16263A] leading-snug line-clamp-2">{m.purpose}</p>
                  <SI className={`w-3.5 h-3.5 shrink-0 ${SENTIMENT_STYLES[m.sentiment]?.split(' ')[0]}`} />
                </div>
                <p className="text-[10px] text-[#6B7076] font-semibold">{m.customer_name || customerMap[m.customer_id]}</p>
                <p className="text-[10px] text-[#6B7076]">{new Date(m.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {m.duration_mins} min</p>
                {m.summary && <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full mt-1"><Brain className="w-2.5 h-2.5" /> Intelligence Ready</span>}
              </button>
            );
          })}
        </div>

        {/* Meeting Detail */}
        <div className="lg:col-span-2 bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6 space-y-5">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-extrabold text-[#16263A] text-base">{selected.purpose}</h2>
              <p className="text-xs text-[#6B7076] mt-0.5">
                {customerMap[selected.customer_id] || selected.customer_name} · {selected.employee_name} · {new Date(selected.scheduled_at).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {selected.duration_mins} min
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${SENTIMENT_STYLES[selected.sentiment]}`}>
              <SentimentIcon className="w-3.5 h-3.5" />
              {selected.sentiment}
            </div>
          </div>

          {/* Transcript */}
          {selected.transcript && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-3.5 h-3.5 text-[#6B7076]" />
                <p className="text-xs font-extrabold text-[#6B7076] uppercase tracking-wider">Transcript</p>
              </div>
              <div className="bg-[#FFF9ED] border border-[#E8DAAE] rounded-xl p-4 max-h-48 overflow-y-auto">
                <pre className="text-xs text-[#29313A] whitespace-pre-wrap leading-relaxed font-sans">{selected.transcript}</pre>
              </div>
            </div>
          )}

          {/* AI Intelligence Button */}
          {!selected.summary && (
            <button
              onClick={generateIntelligence}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#16263A] to-[#16263A]/80 hover:from-[#16263A]/90 text-white text-sm font-bold py-3 rounded-xl transition-all disabled:opacity-60"
            >
              {generating ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating intelligence...</>
              ) : (
                <><Sparkles className="w-4 h-4 text-[#FFD51F]" /> Generate Meeting Intelligence</>
              )}
            </button>
          )}

          {/* Summary */}
          {selected.summary && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-3.5 h-3.5 text-[#F4A623]" />
                <p className="text-xs font-extrabold text-[#6B7076] uppercase tracking-wider">AI Summary</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-[#29313A] leading-relaxed">{selected.summary}</p>
              </div>
            </div>
          )}

          {/* Action Items */}
          {actionItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-xs font-extrabold text-[#6B7076] uppercase tracking-wider">Action Items ({actionItems.length})</p>
              </div>
              <div className="space-y-2">
                {actionItems.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-[#29313A] font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow up */}
          {selected.follow_up_date && (
            <div className="flex items-center gap-2 p-3 bg-[#FFF9ED] border border-[#E8DAAE] rounded-xl text-xs font-semibold text-[#16263A]">
              <Calendar className="w-4 h-4 text-[#F4A623]" />
              Follow-up scheduled: {new Date(selected.follow_up_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}
            </div>
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-[#16263A]">Log New Meeting</h3>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full hover:bg-[#E8DAAE] flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6B7076] block mb-1">Customer</label>
                <select value={newCustomerId} onChange={e => setNewCustomerId(e.target.value)} className="w-full p-2.5 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-semibold text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]">
                  {DEMO_CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B7076] block mb-1">Purpose / Agenda</label>
                <input value={newPurpose} onChange={e => setNewPurpose(e.target.value)} placeholder="e.g. Working Capital Enhancement Discussion" className="w-full p-2.5 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-medium text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F]" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B7076] block mb-1">Transcript (optional — paste or type)</label>
                <textarea value={newTranscript} onChange={e => setNewTranscript(e.target.value)} rows={4} placeholder="Paste meeting transcript here for AI intelligence generation..." className="w-full p-2.5 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-medium text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F] resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-[#E8DAAE] text-xs font-bold text-[#6B7076] hover:bg-[#E8DAAE]/30 transition-all">Cancel</button>
                <button onClick={handleCreate} disabled={!newPurpose} className="flex-1 py-2.5 rounded-xl bg-[#16263A] text-white text-xs font-bold hover:bg-[#16263A]/90 disabled:opacity-50 transition-all">Log Meeting</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

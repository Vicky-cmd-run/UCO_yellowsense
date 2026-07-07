'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api';
import {
  MessageSquare, Mail, AlertTriangle, ArrowRight, RefreshCw,
  Sparkles, Filter, Search, Send, Clock, Layers, ShieldCheck
} from 'lucide-react';

interface QueryItem {
  id: string;
  customer_id: string;
  source_channel: string;
  raw_text: string;
  detected_intent: string | null;
  urgency: string;
  routed_team: string | null;
  status: string;
}

interface Customer {
  id: string;
  full_name: string;
  customer_number: string;
  segment: string;
}

export default function QueriesQueuePage() {
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerMap, setCustomerMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<QueryItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Simulation Form State
  const [simCustomerId, setSimCustomerId] = useState('');
  const [simChannel, setSimChannel] = useState('EMAIL');
  const [simText, setSimText] = useState('');
  const [simulating, setSimulating] = useState(false);

  // Filters
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [queriesData, customersData] = await Promise.all([
          apiService.fetchQueries(),
          apiService.fetchCustomers()
        ]);
        setQueries(queriesData);
        setCustomers(customersData);

        const cmap: Record<string, string> = {};
        customersData.forEach((c: Customer) => {
          cmap[c.id] = c.full_name;
        });
        setCustomerMap(cmap);

        if (queriesData.length > 0) {
          setSelectedQuery(prev => {
            const found = queriesData.find((q: QueryItem) => q.id === prev?.id);
            return found || queriesData[0];
          });
        }
      } catch (err: any) {
        console.error('Failed to load queries', err);
        setError(err.message || 'Failed to retrieve inbound query routing queue.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshTrigger]);

  const handleSimulateQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simCustomerId || !simText) {
      alert('Please select a customer and enter the message text.');
      return;
    }
    setSimulating(true);
    try {
      const created = await apiService.createQuery(simCustomerId, simChannel, simText);
      setSimText('');
      setRefreshTrigger(prev => prev + 1);
      setSelectedQuery(created);
    } catch (err: any) {
      console.error(err);
      alert('Failed to simulate inbound query.');
    } finally {
      setSimulating(false);
    }
  };

  // Pre-fill query suggestions for demonstration
  const handleLoadSuggestion = (text: string, title: string) => {
    setSimText(text);
    if (title.includes('EMI')) {
      setSimChannel('WHATSAPP');
    } else {
      setSimChannel('EMAIL');
    }
  };

  const suggestions = [
    { title: 'EMI Issue', text: 'My home loan EMI was debited twice this month. Please refund the double deduction immediately.' },
    { title: 'POS Terminal', text: 'Merchant card reader displays Error 404 connection failure on our primary POS terminal.' },
    { title: 'Rates Advisory', text: 'Interested in current business expansion FD rates and interest benefits for premium clients.' }
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel?.toUpperCase()) {
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-success-acc" />;
    }
  };

  const getUrgencyClass = (urgency: string) => {
    switch (urgency?.toUpperCase()) {
      case 'HIGH':
        return 'bg-danger-acc/10 text-danger-acc border border-danger-acc/20';
      case 'MEDIUM':
        return 'bg-warning-acc/15 text-navy border border-warning-acc/30';
      default:
        return 'bg-navy/5 text-text-sub border border-border-warm';
    }
  };

  const filteredQueries = queries.filter(q => {
    const matchesChannel = channelFilter === 'ALL' || q.source_channel === channelFilter;
    const matchesUrgency = urgencyFilter === 'ALL' || q.urgency === urgencyFilter;
    return matchesChannel && matchesUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Query Routing Queue</h1>
          <p className="text-text-sub text-sm mt-1">
            Real-time NLP intent classification and automated team dispatching for incoming client communication.
          </p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-4 py-2 border border-border-warm hover:bg-surface text-navy font-bold rounded-xl transition flex items-center gap-2 shadow-sm bg-white"
        >
          <RefreshCw className="w-4 h-4 text-text-sub" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-1 h-[550px] bg-surface border border-border-warm rounded-2xl"></div>
          <div className="lg:col-span-2 h-[550px] bg-surface border border-border-warm rounded-2xl"></div>
        </div>
      ) : error ? (
        <div className="premium-card text-center p-8 max-w-lg mx-auto space-y-4">
          <AlertTriangle className="w-12 h-12 text-danger-acc mx-auto" />
          <h3 className="text-lg font-bold text-navy">Error Loading Queries</h3>
          <p className="text-text-sub text-sm">{error}</p>
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="px-4 py-2 bg-yellow-acc text-navy font-bold rounded-xl"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Queries list panel */}
          <div className="lg:col-span-1 premium-card p-0 overflow-hidden flex flex-col max-h-[650px]">
            <div className="p-4 border-b border-border-warm bg-surface/50 flex justify-between items-center flex-wrap gap-2">
              <span className="text-xs font-bold text-text-sub uppercase tracking-wider">Inbound Queue ({filteredQueries.length})</span>
              <div className="flex gap-2">
                <select
                  className="p-1 bg-bg-warm border border-border-warm rounded text-[10px] font-bold focus:outline-none"
                  value={channelFilter}
                  onChange={e => setChannelFilter(e.target.value)}
                >
                  <option value="ALL">All Channels</option>
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
                <select
                  className="p-1 bg-bg-warm border border-border-warm rounded text-[10px] font-bold focus:outline-none"
                  value={urgencyFilter}
                  onChange={e => setUrgencyFilter(e.target.value)}
                >
                  <option value="ALL">All Urgencies</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-border-warm overflow-y-auto grow">
              {filteredQueries.length === 0 ? (
                <div className="p-8 text-center text-text-sub text-xs">No active queries found.</div>
              ) : (
                filteredQueries.map(query => {
                  const isSelected = selectedQuery?.id === query.id;
                  return (
                    <button
                      key={query.id}
                      onClick={() => setSelectedQuery(query)}
                      className={`w-full text-left p-4 transition flex flex-col gap-2 ${
                        isSelected ? 'bg-yellow-acc/10 border-l-4 border-l-orange-acc' : 'hover:bg-bg-warm/50'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-extrabold text-navy text-sm truncate max-w-[170px]">
                          {customerMap[query.customer_id] || 'Client Account'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getUrgencyClass(query.urgency)}`}>
                          {query.urgency}
                        </span>
                      </div>
                      <p className="text-text-main text-xs font-semibold line-clamp-2 leading-relaxed">
                        {query.raw_text}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-text-sub font-bold mt-1">
                        <span className="flex items-center gap-1 uppercase">
                          {getChannelIcon(query.source_channel)}
                          {query.source_channel}
                        </span>
                        <span className="text-orange-acc truncate max-w-[120px]">
                          {query.detected_intent || 'Unclassified'}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Details / NLP parsing detail / Simulator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected query insights */}
            {selectedQuery ? (
              <div className="premium-card space-y-5">
                <div className="pb-4 border-b border-border-warm flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider">Inbound routing report</span>
                    <h2 className="text-lg font-extrabold text-navy mt-0.5">
                      {customerMap[selectedQuery.customer_id] || 'Client Query'}
                    </h2>
                    <div className="flex items-center gap-3 text-[10px] text-text-sub font-semibold mt-1">
                      <span className="flex items-center gap-1 uppercase">
                        {getChannelIcon(selectedQuery.source_channel)}
                        Channel: {selectedQuery.source_channel}
                      </span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.5 rounded uppercase ${getUrgencyClass(selectedQuery.urgency)}`}>
                        Urgency: {selectedQuery.urgency}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-success-acc/10 text-success-acc text-xs font-bold rounded-lg border border-success-acc/20 uppercase tracking-wide">
                    {selectedQuery.status}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Message body */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider block">Raw Message Text</span>
                    <div className="p-4 bg-bg-warm/40 border border-border-warm rounded-2xl text-xs font-semibold text-text-main leading-relaxed">
                      "{selectedQuery.raw_text}"
                    </div>
                  </div>

                  {/* NLP classification results */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-surface border border-border-warm rounded-2xl space-y-1 shadow-sm">
                      <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider block flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-acc" />
                        Classified Intent
                      </span>
                      <span className="text-sm font-extrabold text-navy block">
                        {selectedQuery.detected_intent || 'General inquiry'}
                      </span>
                      <span className="text-[10px] text-text-sub font-medium block mt-1">
                        Determined via semantic matching
                      </span>
                    </div>

                    <div className="p-4 bg-surface border border-border-warm rounded-2xl space-y-1 shadow-sm">
                      <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider block flex items-center gap-1">
                        <ArrowRight className="w-3.5 h-3.5 text-orange-acc" />
                        Routed Endpoint Team
                      </span>
                      <span className="text-sm font-extrabold text-navy block">
                        {selectedQuery.routed_team || 'Customer Support Ops'}
                      </span>
                      <span className="text-[10px] text-text-sub font-medium block mt-1">
                        Auto-dispatched target queue
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="premium-card text-center p-8 text-text-sub italic text-xs">
                Select a message from the queue to inspect NLP dispatching logs.
              </div>
            )}

            {/* Simulation console */}
            <div className="premium-card space-y-4">
              <div className="pb-3 border-b border-border-warm flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-navy text-sm">NLP Routing Simulation Console</h3>
                  <p className="text-[10px] text-text-sub mt-0.5">Post an incoming message to check intent classifier dispatching rules.</p>
                </div>
                <Layers className="w-4 h-4 text-text-sub" />
              </div>

              {/* suggestions */}
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => handleLoadSuggestion(s.text, s.title)}
                    className="px-2.5 py-1 bg-yellow-acc/10 hover:bg-yellow-acc/25 border border-yellow-acc/30 text-navy font-bold text-[10px] rounded-lg transition"
                  >
                    💡 {s.title}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSimulateQuery} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-navy uppercase tracking-wider mb-1">
                      Choose Customer Account
                    </label>
                    <select
                      className="w-full p-2 bg-bg-warm border border-border-warm rounded-xl text-xs font-semibold focus:outline-none"
                      value={simCustomerId}
                      onChange={e => setSimCustomerId(e.target.value)}
                      required
                    >
                      <option value="">-- Select account --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.full_name} ({c.segment})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-navy uppercase tracking-wider mb-1">
                      Inbound Channel
                    </label>
                    <select
                      className="w-full p-2 bg-bg-warm border border-border-warm rounded-xl text-xs font-semibold focus:outline-none"
                      value={simChannel}
                      onChange={e => setSimChannel(e.target.value)}
                    >
                      <option value="EMAIL">Email</option>
                      <option value="WHATSAPP">WhatsApp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-navy uppercase tracking-wider mb-1">
                    Incoming Message Body Text
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Type raw incoming message. Try including key tokens like 'EMI', 'interest', 'card reader'..."
                    className="w-full p-2.5 bg-bg-warm border border-border-warm rounded-xl text-xs focus:outline-none text-text-main font-semibold leading-relaxed"
                    value={simText}
                    onChange={e => setSimText(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-border-warm">
                  <button
                    type="submit"
                    disabled={simulating}
                    className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy/95 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {simulating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{simulating ? 'Simulating...' : 'Dispatch Inbound Query'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

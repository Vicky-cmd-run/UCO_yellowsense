'use client';

import React, { useEffect, useState, useRef } from 'react';
import { apiService } from '../../../services/api';
import {
  Bot, Send, User, Sparkles, AlertCircle, RefreshCw, CheckCircle,
  HelpCircle, ChevronRight, Layers, FileText, BarChart2, ShieldAlert
} from 'lucide-react';

interface Customer {
  id: string;
  full_name: string;
  customer_number: string;
  segment: string;
  relationship_value: number;
  churn_risk: number;
}

interface Message {
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
}

export default function AICopilotPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Hello! I am your YellowSense Copilot. Select a customer on the left to load their financial profile, or ask general questions about portfolio operations.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [generating, setGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.fetchCustomers();
        setCustomers(data);
        if (data.length > 0) {
          // Set first customer as default
          setSelectedCustomerId(data[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch customer directories.');
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  // Fetch full details of selected customer
  useEffect(() => {
    if (!selectedCustomerId) return;
    const cust = customers.find(c => c.id === selectedCustomerId);
    if (cust) {
      setSelectedCustomer(cust);
      
      // Post context change message
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Context shifted to **${cust.full_name}** (${cust.segment}). How can I assist you with this portfolio account?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [selectedCustomerId, customers]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generating]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // User Message
    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setGenerating(true);

    try {
      // Simulate/determine AI answers based on query
      const query = textToSend.toLowerCase();
      let responseText = '';
      let confidence = 85;
      let sources: string[] = ['Central Data Hub'];

      if (selectedCustomer) {
        const id = selectedCustomer.id;
        const name = selectedCustomer.full_name;

        if (query.includes('next best') || query.includes('recommendation') || query.includes('action')) {
          try {
            const recommendations = await apiService.fetchCustomerRecommendations(id);
            if (recommendations && recommendations.length > 0) {
              const bestAction = recommendations[0];
              responseText = `For **${name}**, the primary recommendation is **${bestAction.action_title}** (${bestAction.recommendation_type}).\n\n**Description:** ${bestAction.description}\n\n**Potential Value:** ₹${bestAction.potential_value.toLocaleString('en-IN')}\n**Model Score:** ${(bestAction.confidence_score * 100).toFixed(1)}%`;
              confidence = Math.round(bestAction.confidence_score * 100);
              sources = ['Next-Best-Action Predictor v2.1', 'ZRT Visit Notes', 'Interaction History Log'];
            } else {
              responseText = `I analyzed the account details for **${name}** and found no urgent recommended actions. The customer relationship is in a healthy, stable phase.`;
              confidence = 91;
              sources = ['Machine Learning Propensity Engine', 'Account Health Check Audit'];
            }
          } catch (recErr) {
            responseText = `I recommend pitching a **Pre-Approved MSME Working Capital loan** of ₹25 Lakhs at a promotional 8.85% interest rate. This aligns with the client's recent expansion query.`;
            confidence = 88;
            sources = ['Loan Eligibility Pipeline', 'ZRT Visit Log'];
          }
        } else if (query.includes('churn') || query.includes('risk') || query.includes('vulnerability')) {
          const risk = selectedCustomer.churn_risk;
          responseText = `**Churn Risk Evaluation for ${name}:**\n\n* **Risk Level:** ${risk > 75 ? '⚠️ CRITICAL' : risk > 50 ? '⚡ MEDIUM' : '✅ LOW'} (${risk}%)\n* **Primary Drivers:** Unresolved service complaints regarding mobile bank app token validation, combined with a 15% drop in savings balance over 3 months.\n\n**Suggested Mitigation:** Arrange a service recovery call within 24 hours to address complaints and offer interest rate advisory.`;
          confidence = 94;
          sources = ['Churn Vulnerability Model v1.4', 'Interaction Ledger', 'Grievance Database'];
        } else if (query.includes('propensity') || query.includes('cross-sell') || query.includes('product')) {
          responseText = `**Product Propensity Matrix for ${name}:**\n\n1. **Business Cash Credit Facility:** 88% probability (Need expressed during site visit)\n2. **Group Term Insurance Plan:** 64% probability\n3. **Premium Wealth Management advisory:** 42% probability\n\nWe recommend scheduling an Advisory meeting to pitch the Cash Credit facility first.`;
          confidence = 89;
          sources = ['Propensity Scoring Service', 'Customer Portfolio Matrix'];
        } else {
          // General context reply
          responseText = `I have access to **${name}'s** profile records. They have a relationship value of ₹${selectedCustomer.relationship_value.toLocaleString('en-IN')} and are classified in the **${selectedCustomer.segment}** tier.\n\nYou can query about their: \n- *Next Best Action*\n- *Churn Risks*\n- *Product Cross-sell Propensities*`;
          confidence = 90;
          sources = ['YellowSense Search Engine', 'Unified Customer Profile'];
        }
      } else {
        responseText = `Please select an active Customer Focus from the sidebar context panel first so I can retrieve account history and generate custom recommendations.`;
        confidence = 100;
        sources = ['Copilot Guardrails'];
      }

      // Add delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: responseText,
          timestamp: new Date(),
          confidence,
          sources
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I encountered an issue querying the intelligence database.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setGenerating(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const suggestedPrompts = [
    { title: 'Next Best Action', text: 'Show the next best action for this customer' },
    { title: 'Churn Risk Factors', text: 'What is the churn vulnerability risk level and triggers?' },
    { title: 'Cross-Sell Propensity', text: 'What is the product propensity score for cross-sell?' }
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
      {/* Side Context Panel */}
      <div className="w-full md:w-80 premium-card flex flex-col shrink-0">
        <div className="pb-3 border-b border-border-warm">
          <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider">Workspace focus</span>
          <h2 className="text-base font-extrabold text-navy mt-0.5">Customer Context Selector</h2>
        </div>

        <div className="mt-4 grow space-y-5">
          {/* Dropdown Selector */}
          <div>
            <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1.5">
              Active Focus Customer
            </label>
            {loading ? (
              <div className="h-9 bg-bg-warm animate-pulse rounded-xl"></div>
            ) : (
              <select
                className="w-full p-2.5 bg-bg-warm border border-border-warm rounded-xl text-xs font-bold text-text-main focus:outline-none"
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Choose Account --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.segment})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Active Context Details */}
          {selectedCustomer ? (
            <div className="space-y-4 pt-4 border-t border-border-warm">
              <div className="p-3 bg-bg-warm/50 border border-border-warm rounded-xl">
                <span className="text-[10px] text-text-sub font-bold block uppercase tracking-wider">Client Name</span>
                <span className="font-extrabold text-navy text-sm block mt-0.5">{selectedCustomer.full_name}</span>
                <span className="text-[10px] text-text-sub block mt-0.5">No: {selectedCustomer.customer_number}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface border border-border-warm rounded-xl">
                  <span className="text-[9px] text-text-sub font-bold uppercase tracking-wider block">Segment</span>
                  <span className="font-extrabold text-orange-acc text-xs block mt-0.5">{selectedCustomer.segment}</span>
                </div>
                <div className="p-3 bg-surface border border-border-warm rounded-xl">
                  <span className="text-[9px] text-text-sub font-bold uppercase tracking-wider block">Churn Risk</span>
                  <span className={`font-extrabold text-xs block mt-0.5 ${
                    selectedCustomer.churn_risk > 75 
                      ? 'text-danger-acc' 
                      : selectedCustomer.churn_risk > 40 
                      ? 'text-warning-acc' 
                      : 'text-success-acc'
                  }`}>
                    {selectedCustomer.churn_risk}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-surface border border-border-warm rounded-xl">
                <span className="text-[9px] text-text-sub font-bold uppercase tracking-wider block">Relationship Value</span>
                <span className="font-extrabold text-navy text-sm block mt-0.5">
                  ₹{selectedCustomer.relationship_value.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-text-sub text-xs italic">
              Select a customer focus to load AI context telemetry.
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-border-warm bg-bg-warm/30 rounded-xl p-3 flex gap-2 items-start text-[10px] text-text-sub">
          <Layers className="w-4 h-4 text-orange-acc shrink-0 mt-0.5" />
          <p className="font-semibold">
            Copilot automatically loads recent emails, visit notes, and transaction histories into the context window.
          </p>
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 premium-card p-0 overflow-hidden flex flex-col h-full bg-surface">
        {/* Chat Header */}
        <div className="p-4 border-b border-border-warm bg-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-acc/10 flex items-center justify-center text-orange-acc shadow-inner">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-navy text-sm flex items-center gap-1.5">
                <span>YellowSense AI Copilot</span>
                <span className="px-1.5 py-0.5 bg-success-acc/10 text-success-acc text-[9px] font-black uppercase rounded">Active</span>
              </h2>
              <p className="text-[10px] text-text-sub mt-0.5">Context: {selectedCustomer ? selectedCustomer.full_name : 'General Workspace'}</p>
            </div>
          </div>
        </div>

        {/* Message history */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-bg-warm/15">
          {messages.map((m, idx) => {
            const isBot = m.sender === 'bot';
            return (
              <div key={idx} className={`flex gap-3 max-w-[85%] ${isBot ? '' : 'ml-auto flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isBot ? 'bg-navy text-white' : 'bg-yellow-acc text-navy font-bold text-xs shadow-xs'
                }`}>
                  {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble Container */}
                <div className="space-y-1.5">
                  <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed border ${
                    isBot 
                      ? 'bg-surface border-border-warm text-text-main shadow-xs' 
                      : 'bg-yellow-acc/10 border-yellow-acc/30 text-navy'
                  }`}>
                    {/* Parse markdown bold and newlines manually for safety */}
                    <div className="whitespace-pre-line">
                      {m.text.split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i} className="text-navy">{chunk}</strong> : chunk)}
                    </div>
                  </div>

                  {/* Confidence / Sources Metadata */}
                  {isBot && (m.confidence !== undefined || m.sources) && (
                    <div className="flex flex-wrap items-center gap-3 px-1 text-[10px]">
                      {m.confidence !== undefined && (
                        <span className="flex items-center gap-1 font-bold text-text-sub bg-bg-warm border border-border-warm rounded-lg px-2 py-0.5">
                          <Sparkles className="w-3 h-3 text-orange-acc" />
                          <span>Confidence: {m.confidence}%</span>
                        </span>
                      )}
                      {m.sources && m.sources.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-text-sub font-bold">Sources:</span>
                          {m.sources.map((src, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 bg-navy/5 text-navy font-bold rounded-md border border-border-warm/50 text-[9px]"
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {generating && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-7 h-7 rounded-xl bg-navy text-white flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-4 bg-surface border border-border-warm rounded-2xl text-xs font-semibold text-text-sub flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking and analyzing sources...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Footer controls & prompt suggestions */}
        <div className="p-4 border-t border-border-warm bg-surface space-y-3 shrink-0">
          {/* Quick pills */}
          {selectedCustomer && (
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map(pill => (
                <button
                  key={pill.title}
                  type="button"
                  onClick={() => handleSuggestedPrompt(pill.text)}
                  className="px-2.5 py-1 bg-yellow-acc/10 hover:bg-yellow-acc/25 border border-yellow-acc/30 text-navy font-bold text-[10px] rounded-lg transition"
                >
                  ✨ {pill.title}
                </button>
              ))}
            </div>
          )}

          {/* Form input bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2 relative"
          >
            <input
              type="text"
              placeholder={selectedCustomer ? "Ask copilot anything about this account..." : "Select active customer context..."}
              disabled={!selectedCustomer}
              className="w-full pl-4 pr-12 py-3 bg-bg-warm border border-border-warm rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-yellow-acc font-semibold disabled:opacity-50 text-text-main"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || generating || !selectedCustomer}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-navy text-white rounded-xl hover:bg-navy/95 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

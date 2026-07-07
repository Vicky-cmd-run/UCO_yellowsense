'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DEMO_CUSTOMERS, COPILOT_RESPONSES } from '@/services/DEMO_DATA';
import { Bot, Send, User, Sparkles, ChevronRight, Layers, BarChart2, ShieldAlert, MessageSquare } from 'lucide-react';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
}

const SUGGESTED_PROMPTS = [
  'Which customers are at highest churn risk?',
  'What are the top Next Best Actions for my portfolio?',
  'Show me the lead pipeline status',
  'Tell me about Kumar Textiles',
  'Which customers have low digital engagement scores?',
  'What is the analytics performance this quarter?',
];

function simulateResponse(input: string): { text: string; confidence: number; sources: string[] } {
  const lower = input.toLowerCase();
  for (const resp of COPILOT_RESPONSES) {
    if (resp.keywords.some(kw => lower.includes(kw))) {
      return { text: resp.response, confidence: resp.confidence, sources: resp.sources };
    }
  }
  return {
    text: `I've analyzed your query about "${input.slice(0, 60)}${input.length > 60 ? '...' : ''}". Based on the current portfolio data, I recommend reviewing the Customer 360 profiles for specific context. You can navigate to any customer profile for AI-powered next-best-action recommendations tailored to that relationship.`,
    confidence: 71,
    sources: ['Customer 360 Engine', 'Portfolio Analytics'],
  };
}

function formatMarkdown(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-[#16263A]">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function AICopilotPage() {
  const [selectedId, setSelectedId] = useState(DEMO_CUSTOMERS[0].id);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: `Hello! I'm your YellowSense AI Copilot. I have real-time context on your entire customer portfolio. Select a customer from the panel to focus my context, or ask me anything about leads, churn risk, product recommendations, or customer intelligence.`,
      timestamp: new Date(),
      confidence: 98,
      sources: ['YellowSense Intelligence Engine'],
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const selectedCustomer = DEMO_CUSTOMERS.find(c => c.id === selectedId)!;

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    // Simulate "thinking" delay
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const resp = simulateResponse(text);
    setMessages(prev => [...prev, {
      sender: 'bot',
      text: resp.text,
      timestamp: new Date(),
      confidence: resp.confidence,
      sources: resp.sources,
    }]);
    setThinking(false);
  };

  const handleCustomerSelect = (id: string) => {
    setSelectedId(id);
    const cust = DEMO_CUSTOMERS.find(c => c.id === id)!;
    setMessages(prev => [...prev, {
      sender: 'bot',
      text: `Context loaded: **${cust.full_name}** (${cust.segment}). Relationship value: **₹${(cust.relationship_value / 100000).toFixed(1)}L**. Churn risk: **${cust.churn_risk}%**. Lead propensity: **${cust.lead_propensity}%**. How can I assist you with this portfolio account?`,
      timestamp: new Date(),
      confidence: 95,
      sources: ['Customer 360 Profile', 'Risk Engine'],
    }]);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Left Panel — Customer Selector */}
      <div className="w-64 shrink-0 flex flex-col bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#E8DAAE]">
          <h2 className="text-xs font-extrabold text-[#16263A] uppercase tracking-wider">Customer Context</h2>
          <p className="text-[10px] text-[#6B7076] mt-0.5">Select to inject profile into AI context</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {DEMO_CUSTOMERS.map(c => (
            <button
              key={c.id}
              onClick={() => handleCustomerSelect(c.id)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all ${selectedId === c.id ? 'border-[#16263A] bg-[#16263A]/5' : 'border-transparent hover:border-[#E8DAAE] hover:bg-[#FFF9ED]'}`}
            >
              <p className="text-xs font-bold text-[#16263A] line-clamp-1">{c.full_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-[#6B7076]">{c.segment}</span>
                <span className={`text-[10px] font-bold ${c.churn_risk >= 70 ? 'text-red-500' : c.churn_risk >= 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {c.churn_risk}% risk
                </span>
              </div>
            </button>
          ))}
        </div>
        {/* Active Context Card */}
        <div className="p-3 border-t border-[#E8DAAE] bg-[#FFF9ED]">
          <p className="text-[10px] font-bold text-[#6B7076] uppercase mb-1">Active Context</p>
          <p className="text-xs font-extrabold text-[#16263A] line-clamp-1">{selectedCustomer.full_name}</p>
          <p className="text-[10px] text-[#6B7076]">{selectedCustomer.segment} · {selectedCustomer.city}</p>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col bg-[#FFFDF7] border border-[#E8DAAE] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#E8DAAE] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16263A] to-[#16263A]/70 flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#FFD51F]" />
          </div>
          <div>
            <h1 className="font-extrabold text-[#16263A] text-sm">YellowSense AI Copilot</h1>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" /> Online · Context: {selectedCustomer.full_name}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.sender === 'bot' ? 'bg-[#16263A]' : 'bg-[#F4A623]'}`}>
                {msg.sender === 'bot' ? <Bot className="w-4 h-4 text-[#FFD51F]" /> : <User className="w-4 h-4 text-white" />}
              </div>
              <div className={`max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'bot' ? 'bg-white border border-[#E8DAAE] text-[#29313A]' : 'bg-[#16263A] text-white'}`}>
                  {msg.sender === 'bot' ? formatMarkdown(msg.text) : msg.text}
                </div>
                {msg.sender === 'bot' && msg.confidence && (
                  <div className="flex items-center gap-2 px-1">
                    <Sparkles className="w-3 h-3 text-[#F4A623]" />
                    <span className="text-[10px] text-[#6B7076] font-semibold">{msg.confidence}% confidence</span>
                    {msg.sources?.map(s => (
                      <span key={s} className="text-[10px] bg-[#E8DAAE] text-[#16263A] px-1.5 py-0.5 rounded-full font-bold">{s}</span>
                    ))}
                  </div>
                )}
                <span className="text-[10px] text-[#6B7076] px-1">{msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {thinking && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#16263A] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[#FFD51F]" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-[#E8DAAE] flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#16263A] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-[#16263A] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-[#16263A] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {SUGGESTED_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="shrink-0 text-[10px] font-bold bg-[#FFF9ED] border border-[#E8DAAE] text-[#16263A] hover:border-[#F4A623] px-3 py-1.5 rounded-full transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#E8DAAE]">
          <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about leads, churn risk, customer profiles, next best actions..."
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-[#E8DAAE] bg-[#FFF9ED] font-medium text-[#16263A] focus:outline-none focus:ring-2 focus:ring-[#FFD51F] placeholder:text-[#6B7076]"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="w-10 h-10 rounded-xl bg-[#16263A] hover:bg-[#16263A]/90 text-white flex items-center justify-center disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

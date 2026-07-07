'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api';
import {
  Search, SlidersHorizontal, User, Phone, Mail, MapPin,
  TrendingUp, AlertTriangle, ShieldAlert, Award, ArrowUpDown, ChevronRight,
  FilterX, HelpCircle, RefreshCw
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

export default function CustomersDirectory() {
  const [q, setQ] = useState('');
  const [segment, setSegment] = useState('');
  const [stage, setStage] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sorting states
  const [sortBy, setSortBy] = useState('relationship_value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounced/triggered fetch
  const [triggerFetch, setTriggerFetch] = useState(0);

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.fetchCustomers(q, segment, stage, sentiment);
        if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          setCustomers([]);
        }
      } catch (err: any) {
        console.error('Failed to load customers directory', err);
        setError(err.message || 'Something went wrong while retrieving customer records.');
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, [triggerFetch, segment, stage, sentiment]);

  // Handle manual search submit (or key press)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTriggerFetch(prev => prev + 1);
  };

  const handleClearFilters = () => {
    setQ('');
    setSegment('');
    setStage('');
    setSentiment('');
    setTriggerFetch(prev => prev + 1);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Client-side sort applied on fetched results
  const sortedCustomers = [...customers].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    // Handle null or undefined values
    if (valA === undefined || valA === null) valA = '';
    if (valB === undefined || valB === null) valB = '';

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    } else {
      return sortOrder === 'asc'
        ? (valA > valB ? 1 : -1)
        : (valB > valA ? 1 : -1);
    }
  });

  return (
    <div className="space-y-6">
      {/* Directory Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">Customer Directory Search</h1>
        <p className="text-text-sub text-sm mt-1 font-medium">
          Search and query customer files, analyze digital engagement, review risk thresholds, and check relationship values.
        </p>
      </div>

      {/* Search and Filters panel */}
      <div className="premium-card bg-surface space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
            <input
              type="text"
              placeholder="Search by customer name, customer number (e.g. CUST001), phone, or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-acc text-text-main"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-navy hover:bg-navy/95 text-white font-bold rounded-xl text-sm transition shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Filter controls */}
        <div className="pt-2 border-t border-border-warm flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Segment Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-text-sub uppercase">Segment:</span>
              <select
                className="bg-bg-warm border border-border-warm px-2 py-1.5 rounded-lg text-xs font-semibold text-text-main focus:outline-none focus:ring-1 focus:ring-yellow-acc"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
              >
                <option value="">All Segments</option>
                <option value="RETAIL">Retail</option>
                <option value="PREMIUM">Premium</option>
                <option value="MSME">MSME</option>
                <option value="EMERGING">Emerging</option>
              </select>
            </div>

            {/* Lifecycle Stage Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-text-sub uppercase">Stage:</span>
              <select
                className="bg-bg-warm border border-border-warm px-2 py-1.5 rounded-lg text-xs font-semibold text-text-main focus:outline-none focus:ring-1 focus:ring-yellow-acc"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              >
                <option value="">All Stages</option>
                <option value="PROSPECT">Prospect</option>
                <option value="ONBOARDED">Onboarded</option>
                <option value="ACTIVE">Active</option>
                <option value="CHURNED">Churned</option>
                <option value="DORMANT">Dormant</option>
              </select>
            </div>

            {/* Sentiment Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-text-sub uppercase">Sentiment:</span>
              <select
                className="bg-bg-warm border border-border-warm px-2 py-1.5 rounded-lg text-xs font-semibold text-text-main focus:outline-none focus:ring-1 focus:ring-yellow-acc"
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
              >
                <option value="">All Sentiment</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEUTRAL">Neutral</option>
                <option value="NEGATIVE">Negative</option>
              </select>
            </div>
          </div>

          {(q || segment || stage || sentiment) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-orange-acc hover:text-orange-acc/95 font-bold flex items-center gap-1.5 transition"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Directory Grid / Table List */}
      <div className="premium-card bg-surface overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-acc" />
            <p className="text-text-sub font-semibold text-sm">Querying YellowSense vaults...</p>
          </div>
        ) : error ? (
          <div className="py-12 flex flex-col items-center gap-3 text-center">
            <AlertTriangle className="w-10 h-10 text-danger-acc" />
            <h4 className="font-bold text-navy text-sm">Search Failed</h4>
            <p className="text-xs text-text-sub max-w-sm">{error}</p>
            <button
              onClick={() => setTriggerFetch(prev => prev + 1)}
              className="mt-2 px-4 py-1.5 bg-yellow-acc hover:bg-yellow-acc/90 text-navy font-bold rounded-xl text-xs transition"
            >
              Retry Search
            </button>
          </div>
        ) : sortedCustomers.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-center">
            <FilterX className="w-12 h-12 text-border-warm" />
            <h4 className="font-extrabold text-navy text-base mt-2">No Customers Found</h4>
            <p className="text-xs text-text-sub max-w-xs">
              No customer profiles matched the keyword query or search filters. Try adjusting your parameters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl transition"
            >
              View All Records
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-warm text-text-sub text-[10px] font-bold uppercase tracking-wider bg-bg-warm/30">
                  <th className="py-3 px-4 font-extrabold">Customer ID & Name</th>
                  <th className="py-3 px-4 font-extrabold">Contact Info</th>
                  <th className="py-3 px-4 font-extrabold">Region</th>
                  <th 
                    className="py-3 px-4 font-extrabold cursor-pointer hover:text-navy transition"
                    onClick={() => toggleSort('relationship_value')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Relationship Value</span>
                      <ArrowUpDown className="w-3 h-3 text-text-sub" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-extrabold">Segment & Stage</th>
                  <th 
                    className="py-3 px-4 font-extrabold cursor-pointer hover:text-navy transition"
                    onClick={() => toggleSort('churn_risk')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Churn Risk</span>
                      <ArrowUpDown className="w-3 h-3 text-text-sub" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-extrabold">Sentiment</th>
                  <th className="py-3 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-warm/60">
                {sortedCustomers.map((cust) => {
                  // Determine Segment tag colors
                  const segmentColors: Record<string, string> = {
                    RETAIL: 'bg-slate-100 text-slate-700 border-slate-200',
                    PREMIUM: 'bg-amber-100 text-amber-800 border-amber-200',
                    MSME: 'bg-blue-100 text-blue-800 border-blue-200',
                    EMERGING: 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  };

                  // Determine Sentiment emoji
                  const sentimentDetails: Record<string, { label: string, color: string }> = {
                    POSITIVE: { label: 'Positive', color: 'bg-success-acc text-white' },
                    NEUTRAL: { label: 'Neutral', color: 'bg-gold text-navy' },
                    NEGATIVE: { label: 'Negative', color: 'bg-danger-acc text-white' }
                  };

                  const activeSentiment = sentimentDetails[cust.sentiment] || { label: 'Neutral', color: 'bg-gold text-navy' };

                  return (
                    <tr 
                      key={cust.id} 
                      className="hover:bg-bg-warm/40 transition group cursor-pointer"
                    >
                      {/* Name and Customer ID */}
                      <td className="py-4 px-4">
                        <Link href={`/customers/${cust.id}`} className="block">
                          <div className="font-extrabold text-navy text-sm group-hover:text-orange-acc transition">
                            {cust.full_name}
                          </div>
                          <div className="text-[10px] text-text-sub font-semibold mt-0.5">
                            {cust.customer_number} • {cust.customer_type}
                          </div>
                        </Link>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 text-xs font-semibold text-text-main">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-text-sub" />
                          <span>{cust.mobile}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-text-sub font-medium">
                          <Mail className="w-3.5 h-3.5 text-text-sub" />
                          <span>{cust.email}</span>
                        </div>
                      </td>

                      {/* Region */}
                      <td className="py-4 px-4 text-xs font-semibold text-navy">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-text-sub" />
                          <span>{cust.city}, {cust.state}</span>
                        </div>
                      </td>

                      {/* Relationship Value */}
                      <td className="py-4 px-4 font-bold text-sm text-navy">
                        {formatINR(cust.relationship_value)}
                      </td>

                      {/* Segment & Life Cycle Stage */}
                      <td className="py-4 px-4 text-xs font-bold space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black border uppercase ${
                          segmentColors[cust.segment] || 'bg-bg-warm text-text-sub border-border-warm'
                        }`}>
                          {cust.segment}
                        </span>
                        <span className="block text-[10px] text-text-sub font-semibold tracking-wide uppercase">
                          {cust.lifecycle_stage}
                        </span>
                      </td>

                      {/* Churn Risk */}
                      <td className="py-4 px-4">
                        <div className="w-24">
                          <div className="flex justify-between text-[10px] font-bold text-text-main mb-1">
                            <span>Risk Score</span>
                            <span className={
                              cust.churn_risk >= 80 
                                ? 'text-danger-acc' 
                                : cust.churn_risk >= 50 
                                ? 'text-warning-acc' 
                                : 'text-success-acc'
                            }>
                              {cust.churn_risk}%
                            </span>
                          </div>
                          <div className="w-full bg-bg-warm rounded-full h-1.5 overflow-hidden border border-border-warm/30">
                            <div 
                              className={`h-full rounded-full ${
                                cust.churn_risk >= 80 
                                  ? 'bg-danger-acc' 
                                  : cust.churn_risk >= 50 
                                  ? 'bg-warning-acc' 
                                  : 'bg-success-acc'
                              }`} 
                              style={{ width: `${cust.churn_risk}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Sentiment */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${activeSentiment.color}`}>
                          {activeSentiment.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <Link 
                          href={`/customers/${cust.id}`}
                          className="inline-flex p-1.5 rounded-lg border border-border-warm hover:border-yellow-acc bg-white hover:bg-yellow-acc/10 text-text-sub hover:text-orange-acc transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

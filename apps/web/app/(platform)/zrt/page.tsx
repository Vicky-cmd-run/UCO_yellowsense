'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '../../../stores/demoStore';
import { apiService } from '../../../services/api';
import { db } from '../../../services/db';
import {
  MapPin, Calendar, Clock, Navigation, CheckCircle, DollarSign,
  Search, Plus, Filter, RefreshCw, X, AlertTriangle, ChevronRight,
  TrendingUp, Compass, Map, CheckCircle2, Loader2
} from 'lucide-react';

interface CustomerData {
  id: string;
  full_name: string;
  segment: string;
  lifecycle_stage: string;
  mobile: string;
  city: string;
  relationship_value: number;
}

export default function ZRTCommandCenter() {
  const router = useRouter();
  const { networkStatus, activeUser } = useDemoStore();
  const [visits, setVisits] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Record<string, CustomerData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Schedule Visit modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [allCustomersList, setAllCustomersList] = useState<CustomerData[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [visitPurpose, setVisitPurpose] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load data
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch visits
      const visitsData = await apiService.fetchVisits();
      
      // 2. Fetch customers to display their names/details
      const customersData = await apiService.fetchCustomers();
      const customerMap: Record<string, CustomerData> = {};
      customersData.forEach((c: CustomerData) => {
        customerMap[c.id] = c;
      });
      
      setVisits(visitsData);
      setCustomers(customerMap);
      setAllCustomersList(customersData);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load ZRT visits. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [networkStatus]);

  // Sync / Refresh handler
  const handleRefresh = () => {
    loadData();
  };

  // Submit visit scheduling
  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !visitPurpose || !visitDate || !visitTime) {
      alert('Please fill out all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const scheduledDateTime = `${visitDate}T${visitTime}:00`;
      await apiService.createVisit(selectedCustomerId, visitPurpose, scheduledDateTime);
      setShowScheduleModal(false);
      setSelectedCustomerId('');
      setVisitPurpose('');
      setVisitDate('');
      setVisitTime('');
      // Reload list
      loadData();
    } catch (err: any) {
      console.error(err);
      alert('Failed to schedule visit: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Search visits
  const filteredVisits = visits.filter((visit) => {
    const customer = customers[visit.customer_id];
    const customerName = customer?.full_name?.toLowerCase() || '';
    const purpose = visit.purpose?.toLowerCase() || '';
    const matchesSearch = customerName.includes(searchQuery.toLowerCase()) || purpose.includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return visit.status === statusFilter && matchesSearch;
  });

  // KPI calculations
  const totalVisitsCount = visits.length;
  const scheduledCount = visits.filter(v => v.status === 'SCHEDULED').length;
  const inProgressCount = visits.filter(v => v.status === 'IN_PROGRESS').length;
  const completedCount = visits.filter(v => v.status === 'COMPLETED').length;

  // Mock travel and opportunity details
  // In a real system, these would map from geolocations or dynamic computations
  const mockTravelTimes: Record<string, { dist: string; time: string; delay?: string }> = {
    '1': { dist: '3.4 km', time: '12 min' },
    '2': { dist: '7.8 km', time: '22 min', delay: 'Slow traffic' },
    '3': { dist: '1.2 km', time: '5 min' },
    '4': { dist: '12.1 km', time: '35 min' },
    '5': { dist: '5.6 km', time: '18 min' },
  };

  const getTravelDetails = (visitId: string, index: number) => {
    // Return mock coordinate distances
    const key = (index % 5 + 1).toString();
    return mockTravelTimes[key] || { dist: '4.5 km', time: '15 min' };
  };

  // Total opportunities potential locked in the active visits
  const totalOpportunityLocked = filteredVisits.reduce((acc, v) => {
    const cust = customers[v.customer_id];
    // Opportunity value estimation: 8% of their relationship value, minimum ₹25,000
    const val = cust ? Math.max(cust.relationship_value * 0.08, 25000) : 35000;
    return acc + val;
  }, 0);

  // Total estimated travel distance
  const totalDistanceKm = filteredVisits
    .filter(v => v.status !== 'COMPLETED')
    .reduce((acc, v, idx) => {
      const details = getTravelDetails(v.id, idx);
      const val = parseFloat(details.dist.split(' ')[0]);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

  // Total estimated travel time in minutes
  const totalTimeMin = filteredVisits
    .filter(v => v.status !== 'COMPLETED')
    .reduce((acc, v, idx) => {
      const details = getTravelDetails(v.id, idx);
      const val = parseInt(details.time.split(' ')[0]);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

  // Formatter for Currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">ZRT Field Command Center</h1>
          <p className="text-text-sub text-sm">
            Optimize paths, execute geo-verified checklist runs, and schedule visits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2.5 border border-border-warm bg-surface hover:bg-bg-warm text-text-main rounded-xl transition duration-150 flex items-center gap-2 text-sm font-semibold"
            title="Refresh visits data"
          >
            <RefreshCw className="w-4 h-4 text-text-sub" />
            <span>Sync</span>
          </button>
          
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 bg-navy hover:bg-navy/90 text-white font-bold rounded-xl transition duration-150 flex items-center gap-2 text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Visit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="premium-card bg-surface flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-acc/10 flex items-center justify-center text-orange-acc shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-text-sub uppercase font-extrabold tracking-wide">Visits Planned</div>
            <div className="text-2xl font-extrabold text-navy">{totalVisitsCount}</div>
            <div className="text-[10px] text-success-acc font-semibold flex items-center gap-1 mt-0.5">
              <span>{scheduledCount} scheduled • {inProgressCount} active</span>
            </div>
          </div>
        </div>

        <div className="premium-card bg-surface flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-acc/10 flex items-center justify-center text-orange-acc shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-text-sub uppercase font-extrabold tracking-wide">Total Distance</div>
            <div className="text-2xl font-extrabold text-navy">
              {totalDistanceKm.toFixed(1)} km
            </div>
            <div className="text-[10px] text-text-sub font-semibold mt-0.5">
              Est. Travel: ~{totalTimeMin} minutes
            </div>
          </div>
        </div>

        <div className="premium-card bg-surface flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-acc/10 flex items-center justify-center text-success-acc shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-text-sub uppercase font-extrabold tracking-wide">Opp Potential</div>
            <div className="text-2xl font-extrabold text-success-acc">
              {formatCurrency(totalOpportunityLocked)}
            </div>
            <div className="text-[10px] text-text-sub font-semibold mt-0.5">
              Based on lifecycle profiles
            </div>
          </div>
        </div>

        <div className="premium-card bg-surface flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-acc/10 flex items-center justify-center text-navy shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-text-sub uppercase font-extrabold tracking-wide">Runs Completed</div>
            <div className="text-2xl font-extrabold text-navy">
              {completedCount} / {totalVisitsCount}
            </div>
            <div className="text-[10px] text-text-sub font-semibold mt-0.5">
              {totalVisitsCount > 0 ? Math.round((completedCount / totalVisitsCount) * 100) : 0}% Completion Rate
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scheduled Visit Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="premium-card bg-surface">
            {/* List Header controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-border-warm">
              <h3 className="font-extrabold text-navy text-sm uppercase tracking-wide">Visits Checklist & Queue</h3>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" />
                  <input
                    type="text"
                    placeholder="Search customer..."
                    className="pl-9 pr-3 py-1.5 bg-bg-warm border border-border-warm rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-yellow-acc text-text-main w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <select
                  className="bg-bg-warm border border-border-warm rounded-xl px-2.5 py-1.5 text-xs text-text-main font-semibold focus:outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* Visit Items List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-sub gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-orange-acc" />
                <span className="text-xs font-semibold">Fetching ZRT desk schedules...</span>
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-sub gap-2 text-center">
                <AlertTriangle className="w-8 h-8 text-warm-gold" />
                <span className="text-xs font-semibold">No visits found matching filters.</span>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="text-xs text-orange-acc font-bold hover:underline mt-1"
                >
                  Create one now
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border-warm mt-2">
                {filteredVisits.map((visit, idx) => {
                  const cust = customers[visit.customer_id];
                  const travel = getTravelDetails(visit.id, idx);
                  const scheduledTimeStr = new Date(visit.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const scheduledDateStr = new Date(visit.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  
                  // Estimate value
                  const optValue = cust ? Math.max(cust.relationship_value * 0.08, 25000) : 35000;

                  return (
                    <div key={visit.id} className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row gap-4 justify-between items-start">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-navy text-sm hover:underline cursor-pointer" onClick={() => router.push(`/customers/${visit.customer_id}`)}>
                            {cust ? cust.full_name : `Customer ID: ${visit.customer_id.substring(0, 8)}...`}
                          </span>
                          {cust && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-yellow-acc/10 text-orange-acc border border-yellow-acc/20">
                              {cust.segment}
                            </span>
                          )}
                          
                          {visit.sync_status === 'PENDING' && (
                            <span className="px-1.5 py-0.5 rounded bg-orange-acc/10 border border-orange-acc/20 text-orange-acc text-[8px] font-bold">
                              Draft
                            </span>
                          )}
                        </div>

                        {/* Purpose of visit */}
                        <div className="text-xs text-text-main font-semibold flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-text-sub shrink-0" />
                          <span>{visit.purpose}</span>
                        </div>

                        {/* Scheduled time info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-sub">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>{scheduledDateStr}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{scheduledTimeStr}</span>
                          </div>
                          {visit.status !== 'COMPLETED' && (
                            <div className="flex items-center gap-1 text-navy font-semibold">
                              <Navigation className="w-3.5 h-3.5 text-orange-acc shrink-0 animate-pulse" />
                              <span>{travel.dist} away ({travel.time})</span>
                            </div>
                          )}
                        </div>

                        {/* Value / Location details */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1 font-semibold text-success-acc">
                            <DollarSign className="w-3.5 h-3.5 shrink-0" />
                            <span>Opp Value: {formatCurrency(optValue)}</span>
                          </div>
                          {cust && (
                            <div className="text-text-sub">
                              Location: <span className="font-semibold text-navy">{cust.city}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badge & Action buttons */}
                      <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto">
                        {/* Status Badge */}
                        <div>
                          {visit.status === 'SCHEDULED' && (
                            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-yellow-acc/10 text-orange-acc border border-yellow-acc/30">
                              Scheduled
                            </span>
                          )}
                          {visit.status === 'IN_PROGRESS' && (
                            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-orange-acc/10 text-orange-acc border border-orange-acc/30 animate-pulse">
                              In Progress
                            </span>
                          )}
                          {visit.status === 'COMPLETED' && (
                            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-success-acc/10 text-success-acc border border-success-acc/30">
                              Completed
                            </span>
                          )}
                        </div>

                        {/* Execution Action Button */}
                        {visit.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => router.push(`/zrt/visits/${visit.id}`)}
                            className={`w-full sm:w-auto px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 ${
                              visit.status === 'IN_PROGRESS'
                                ? 'bg-orange-acc hover:bg-orange-acc/90 text-white'
                                : 'bg-navy hover:bg-navy/90 text-white'
                            }`}
                          >
                            <span>{visit.status === 'IN_PROGRESS' ? 'Resume Execution' : 'Check-In & Execute'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="text-xs text-text-sub font-bold flex items-center gap-1 mt-1">
                            <CheckCircle className="w-4 h-4 text-success-acc" />
                            <span>Run Finished</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Abstract Map Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="premium-card bg-surface orbital-motif flex flex-col justify-between h-[520px]">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-navy text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-orange-acc" />
                    <span>Officer Mobilization Route</span>
                  </h3>
                  <p className="text-[11px] text-text-sub">Real-time mock GPS telemetry & route layout</p>
                </div>
                <div className="px-2 py-0.5 rounded-full text-[9px] bg-success-acc/15 text-success-acc font-extrabold tracking-wider uppercase border border-success-acc/20">
                  GPS Active
                </div>
              </div>

              {/* Simulated Map Visual panel */}
              <div className="relative w-full h-[320px] bg-bg-warm border border-border-warm rounded-2xl mt-4 overflow-hidden shadow-inner">
                {/* SVG representing streets and nodes */}
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  <defs>
                    <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFD51F" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#FFD51F" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Grid Lines */}
                  <g stroke="#E8DAAE" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.6">
                    <line x1="50" y1="0" x2="50" y2="300" />
                    <line x1="100" y1="0" x2="100" y2="300" />
                    <line x1="150" y1="0" x2="150" y2="300" />
                    <line x1="200" y1="0" x2="200" y2="300" />
                    <line x1="250" y1="0" x2="250" y2="300" />
                    <line x1="300" y1="0" x2="300" y2="300" />
                    <line x1="350" y1="0" x2="350" y2="300" />
                    <line x1="0" y1="50" x2="400" y2="50" />
                    <line x1="0" y1="100" x2="400" y2="100" />
                    <line x1="0" y1="150" x2="400" y2="150" />
                    <line x1="0" y1="200" x2="400" y2="200" />
                    <line x1="0" y1="250" x2="400" y2="250" />
                  </g>

                  {/* Streets representation lines */}
                  <g stroke="#E8DAAE" strokeWidth="2" opacity="0.8">
                    {/* Ring circles */}
                    <circle cx="200" cy="150" r="120" fill="none" strokeWidth="1.5" strokeDasharray="4,4" />
                    <circle cx="200" cy="150" r="70" fill="none" strokeWidth="1" />
                    {/* Intersecting roads */}
                    <line x1="40" y1="40" x2="360" y2="260" />
                    <line x1="360" y1="40" x2="40" y2="260" />
                    <line x1="200" y1="0" x2="200" y2="300" />
                    <line x1="0" y1="150" x2="400" y2="150" />
                  </g>

                  {/* Highlight Path connecting Scheduled visits */}
                  {filteredVisits.length >= 2 && (
                    <polyline
                      points="200,150 110,90 290,100 240,220 90,210"
                      fill="none"
                      stroke="#FF8A16"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="6,4"
                    />
                  )}

                  {/* Center Node: RM/ZRT Hub (Current Location) */}
                  <circle cx="200" cy="150" r="18" fill="url(#hubGrad)" />
                  <circle cx="200" cy="150" r="6" fill="#16263A" />
                  <circle cx="200" cy="150" r="3" fill="#FFD51F" />
                  <text x="200" y="138" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#16263A">RM Hub</text>

                  {/* Scheduled Customer Pins */}
                  {filteredVisits.map((visit, idx) => {
                    const cust = customers[visit.customer_id];
                    // Static quadrant positions
                    const positions = [
                      { x: 110, y: 90 },
                      { x: 290, y: 100 },
                      { x: 240, y: 220 },
                      { x: 90, y: 210 },
                      { x: 310, y: 230 }
                    ];
                    const pos = positions[idx % positions.length];
                    const isCompleted = visit.status === 'COMPLETED';
                    const isActive = visit.status === 'IN_PROGRESS';
                    const color = isCompleted ? '#2F8467' : (isActive ? '#FF8A16' : '#F4A623');

                    return (
                      <g key={visit.id} className="cursor-pointer" onClick={() => router.push(`/zrt/visits/${visit.id}`)}>
                        {/* Outer Glow */}
                        <circle cx={pos.x} cy={pos.y} r="10" fill={color} fillOpacity="0.25" className="animate-pulse" />
                        {/* Pin Dot */}
                        <circle cx={pos.x} cy={pos.y} r="5" fill={color} />
                        {/* Label name */}
                        <text x={pos.x} y={pos.y - 8} fontSize="7" fontWeight="extrabold" textAnchor="middle" fill="#16263A">
                          {cust ? cust.full_name.split(' ')[0] : 'Visit'}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-2.5 left-2.5 bg-surface/90 border border-border-warm rounded-xl p-2 text-[10px] space-y-1">
                  <div className="font-bold text-navy pb-1">Legend</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-navy"></span>
                    <span className="text-text-main font-semibold">Your Location</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold"></span>
                    <span className="text-text-main">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-acc"></span>
                    <span className="text-text-main">In Progress</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-success-acc"></span>
                    <span className="text-text-main">Completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel stats footer */}
            <div className="bg-bg-warm border border-border-warm rounded-2xl p-3 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-acc" />
                <div>
                  <div className="font-bold text-navy">Optimal Path Loaded</div>
                  <div className="text-[10px] text-text-sub">Sequenced for minimal fuel/time</div>
                </div>
              </div>
              
              <div className="text-right">
                <span className="font-extrabold text-navy">{filteredVisits.filter(v => v.status !== 'COMPLETED').length} active runs</span>
                <div className="text-[10px] text-text-sub">Next check-in pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Visit Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border-warm rounded-2xl p-6 max-w-md w-full shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-bg-warm text-text-sub hover:text-text-main transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-navy mb-4">Schedule Customer Visit</h3>
            
            <form onSubmit={handleScheduleVisit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">Select Customer</label>
                <select
                  required
                  className="w-full px-3 py-2 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-acc text-text-main"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">-- Choose Customer --</option>
                  {allCustomersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.segment}) - {c.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Need Assessment & Lead Generation"
                  className="w-full px-3 py-2 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-acc text-text-main"
                  value={visitPurpose}
                  onChange={(e) => setVisitPurpose(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-acc text-text-main"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">Time</label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 bg-bg-warm border border-border-warm rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-acc text-text-main"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-navy hover:bg-navy/90 text-white font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <span>Schedule Field Run</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

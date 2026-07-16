'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/stores/demoStore';
import { apiService } from '@/services/api';
import { db } from '@/services/db';
import {
  MapPin, CheckCircle, Navigation, ChevronLeft, ChevronRight,
  Shield, CheckSquare, Plus, FileText, ArrowLeft, Bot,
  Award, Loader2, Sparkles, Phone, User, AlertCircle
} from 'lucide-react';
import { DEMO_VISITS, DEMO_CUSTOMERS } from '@/services/DEMO_DATA';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface PageProps {
  params: Promise<{ visitId: string }>;
}

interface VisitData {
  id: string;
  customer_id: string;
  zrt_officer_id: string;
  purpose: string;
  scheduled_at: string;
  check_in_at?: string;
  check_out_at?: string;
  latitude?: number;
  longitude?: number;
  geo_verified?: boolean;
  status: string;
  notes?: string;
}

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
}

export default function VisitExecutionWizard({ params }: PageProps) {
  const router = useRouter();
  const { visitId } = use(params);
  const { networkStatus, activeUser } = useDemoStore();

  // Loaders & Details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visit, setVisit] = useState<VisitData | null>(null);
  const [customer, setCustomer] = useState<CustomerData | null>(null);

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  // Wizard Form States
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const [needAssessment, setNeedAssessment] = useState({
    working_capital_need: false,
    term_loan_need: false,
    pos_qr_need: false,
    salary_account_need: false,
    insurance_need: false,
  });

  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [ocrLoading, setOcrLoading] = useState<string | null>(null);
  const [ocrResults, setOcrResults] = useState<Record<string, any>>({});
  
  // Travel claim inputs
  const [declaredRoute, setDeclaredRoute] = useState('');
  const [claimedDistance, setClaimedDistance] = useState('');
  const [claimedDuration, setClaimedDuration] = useState('');
  
  const [newLeadCreated, setNewLeadCreated] = useState(false);
  const [leadProduct, setLeadProduct] = useState('');
  const [leadValue, setLeadValue] = useState('');
  const [creatingLead, setCreatingLead] = useState(false);
  const [submittingComplete, setSubmittingComplete] = useState(false);

  // Fetch visit & customer
  useEffect(() => {
    async function loadVisitAndCustomer() {
      setLoading(true);
      setError('');
      // try {
      //   const visits = await apiService.fetchVisits();
      //   const foundVisit = visits.find((v: any) => v.id === visitId);
        
      //   if (!foundVisit) {
      //     setError('Scheduled visit not found.');
      //     setLoading(false);
      //     return;
      //   }
        
      //   setVisit(foundVisit);
        
      //   // Fetch customer details
      //   const custData = await apiService.fetchCustomerById(foundVisit.customer_id);
      //   setCustomer(custData);
      try {
        // Sourced from the same DEMO_VISITS dataset the Field Desk list uses,
        // so ids always match. The live /visits API is seeded with unrelated
        // UUIDs and will never contain these demo visit ids.
        const foundVisit = DEMO_VISITS.find((v: any) => v.id === visitId);

        if (!foundVisit) {
          setError('Scheduled visit not found.');
          setLoading(false);
          return;
        }

        // DEMO_VISITS stores coords as `coordinates: { lat, lng }`, but the
        // rest of this component (handleCheckIn, handleCompleteVisit, the
        // geoCoords UI) expects flat latitude/longitude — normalize once here.
        const normalizedVisit: VisitData = {
          ...(foundVisit as any),
          latitude: (foundVisit as any).latitude ?? (foundVisit as any).coordinates?.lat,
          longitude: (foundVisit as any).longitude ?? (foundVisit as any).coordinates?.lng,
        };
        setVisit(normalizedVisit);

        const custData = DEMO_CUSTOMERS.find((c: any) => c.id === foundVisit.customer_id) || (foundVisit as any).customer;
        setCustomer(custData as CustomerData);

        // Map status changes if already checked in
        if (normalizedVisit.status === 'IN_PROGRESS' || normalizedVisit.check_in_at) {
          setCheckedIn(true);
          setGeoCoords({ lat: normalizedVisit.latitude || 12.9716, lng: normalizedVisit.longitude || 77.5946 });
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch details: ' + (err.message || 'Connection error.'));
      } finally {
        setLoading(false);
      }
    }

    loadVisitAndCustomer();
  }, [visitId]);

  // // Step 1: Check In Execution
  // const handleCheckIn = async () => {
  //   setCheckingIn(true);
  //   try {
  //     // Simulate geolocation retrieval
  //     const lat = 12.9716 + (Math.random() - 0.5) * 0.005;
  //     const lng = 77.5946 + (Math.random() - 0.5) * 0.005;
      
  //     const updatedVisit = await apiService.checkInVisit(visitId, lat, lng);
  //     setGeoCoords({ lat, lng });
  //     setCheckedIn(true);
  //     if (visit) {
  //       setVisit({ ...visit, status: 'IN_PROGRESS', check_in_at: new Date().toISOString() });
  //     }
      
  //     // Auto advance step
  //     setTimeout(() => setCurrentStep(2), 1200);
  //   } catch (err: any) {
  //     console.error(err);
  //     alert('Failed to register check-in: ' + err.message);
  //   } finally {
  //     setCheckingIn(false);
  //   }
  // };
  // Step 1: Check In Execution
  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      // Simulate geolocation retrieval + a network round-trip. Demo visits
      // (v001-v005) aren't persisted server-side, so this stays local
      // instead of calling apiService.checkInVisit — that endpoint 404s on
      // any id it doesn't recognize.
      const lat = 12.9716 + (Math.random() - 0.5) * 0.005;
      const lng = 77.5946 + (Math.random() - 0.5) * 0.005;
      await new Promise(r => setTimeout(r, 700));

      setGeoCoords({ lat, lng });
      setCheckedIn(true);
      if (visit) {
        setVisit({
          ...visit,
          status: 'IN_PROGRESS',
          check_in_at: new Date().toISOString(),
          latitude: lat,
          longitude: lng,
          geo_verified: true,
        });
      }
      
      // Auto advance step
      setTimeout(() => setCurrentStep(2), 1200);
    } catch (err: any) {
      console.error(err);
      alert('Failed to register check-in: ' + err.message);
    } finally {
      setCheckingIn(false);
    }
  };

  // Step 2: Verification
  const handleSendOTP = () => {
    setOtpSent(true);
    alert('Mock verification code sent to customer phone: ' + (customer?.mobile || 'XXXX'));
  };

  const handleVerifyOTP = () => {
    if (otpCode === '1234' || otpCode.length >= 4) {
      setOtpVerified(true);
      setTimeout(() => setCurrentStep(3), 800);
    } else {
      alert('Invalid OTP. Please enter code "1234" for mock test.');
    }
  };

  // Step 4: Toggle Need Assessment fields
  const handleChecklistToggle = (key: keyof typeof needAssessment) => {
    setNeedAssessment(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Step 5: Toggle Sugesstions
  const handleSuggestionToggle = (prod: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(prod) ? prev.filter(p => p !== prod) : [...prev, prod]
    );
  };

  // Step 6: Mock Document upload and OCR eKYC scan simulation
  const handleUploadMockDoc = async (docType: string) => {
    if (!customer) return;
    if (uploadedDocs.includes(docType)) {
      setUploadedDocs(prev => prev.filter(d => d !== docType));
      const nextResults = { ...ocrResults };
      delete nextResults[docType];
      setOcrResults(nextResults);
      return;
    }

    setOcrLoading(docType);
    try {
      const fileName = `${docType.toLowerCase().replace(/ /g, '_')}_uco_2026.pdf`;
      const ocrData = await apiService.scanDocumentOCR(customer.id, docType, fileName);
      setOcrResults(prev => ({ ...prev, [docType]: ocrData }));
      
      // Visual feedback
      if (ocrData.status === 'FRAUD_ALERT') {
        alert(`⚠ OCR Security Alert: Document validation flagged a security warning!\nReason: Filename or content keywords match regulatory alert rules.`);
      } else {
        alert(`✓ OCR eKYC Extraction Completed Successfully!\nExtracted fields:\n${Object.entries(ocrData.extracted_fields).map(([k, v]) => `${k}: ${v}`).join('\n')}`);
      }
    } catch (err: any) {
      console.error('OCR Extraction failed', err);
      alert('OCR Extraction service error: ' + err.message);
    } finally {
      setOcrLoading(null);
      setUploadedDocs(prev => [...prev, docType]);
    }
  };

  // // Step 7: Create Lead helper
  // const handleCreateLead = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!customer) return;
  //   if (!leadProduct || !leadValue) {
  //     alert('Provide both product and value.');
  //     return;
  //   }

  //   setCreatingLead(true);
  //   try {
  //     const val = parseFloat(leadValue);
  //     await apiService.createLead(customer.id, 'FIELD_VISIT', leadProduct, isNaN(val) ? 50000 : val, activeUser?.id || null);
  //     setNewLeadCreated(true);
  //     alert('Lead successfully queued / created for ' + leadProduct);
  //     setCurrentStep(8);
  //   } catch (err: any) {
  //     console.error(err);
  //     alert('Failed to generate lead: ' + err.message);
  //   } finally {
  //     setCreatingLead(false);
  //   }
  // };
  // Step 7: Create Lead helper
  // Step 7: Create Lead helper
      const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;
        if (!leadProduct || !leadValue) {
          alert('Provide both product and value.');
          return;
        }

        setCreatingLead(true);
        try {
          // Simulated lead creation — demo customers (c001, etc.) don't exist as
          // rows in the live database, so apiService.createLead would 404.
          // Stays local, matching how the Field Desk simulates scheduling.
          await new Promise(r => setTimeout(r, 900));

          // Persist to localStorage so the RM's /leads pipeline can pick this up
          // after the demo persona switch (which does a full page reload and
          // would otherwise wipe any in-memory state).
          const newLead = {
            id: `zrt-${Date.now()}`,
            customer_id: customer.id,
            customer_name: customer.full_name,
            source: 'ZRT',
            product: leadProduct,
            potential_value: parseFloat(leadValue) || 50000,
            stage: 'New',
            priority: 'HIGH',
            conversion_probability: 84,
            owner_id: 'u002',
            owner_name: 'Priya Nair',
            created_at: new Date().toISOString(),
            follow_up_date: new Date(Date.now() + 86400000).toISOString(),
            segment: customer.segment,
          };
          const existing = JSON.parse(localStorage.getItem('demo_zrt_created_leads') || '[]');
          localStorage.setItem('demo_zrt_created_leads', JSON.stringify([newLead, ...existing]));

          setNewLeadCreated(true);
          alert('Lead successfully queued / created for ' + leadProduct);
          setCurrentStep(8);
        } catch (err: any) {
          console.error(err);
          alert('Failed to generate lead: ' + err.message);
        } finally {
          setCreatingLead(false);
        }
      };

  // // Step 8: Complete Visit submission
  // const handleCompleteVisit = async () => {
  //   setSubmittingComplete(true);
  //   try {
  //     // Simulate checkout coordinates by offsetting check-in coordinates slightly
  //     const checkoutLat = visit?.latitude ? visit.latitude + 0.008 : 12.9796;
  //     const checkoutLng = visit?.longitude ? visit.longitude + 0.008 : 77.6026;
      
  //     const claimedDist = parseFloat(claimedDistance) || 0.0;
  //     const claimedDur = parseFloat(claimedDuration) || 0.0;
      
  //     const res = await apiService.completeVisit(
  //       visitId, 
  //       needAssessment, 
  //       notes, 
  //       checkoutLat, 
  //       checkoutLng, 
  //       claimedDist, 
  //       claimedDur, 
  //       declaredRoute || 'Unspecified Direct Route'
  //     );
      
  //     if (res.variance_flag) {
  //       alert('⚠ Audit Warning: Travel claims variance detected! Your claimed distance/duration exceeds the system GPS-tracked calculations by more than 20%. This has been logged in the cryptographic ledger for audit review.');
  //     } else {
  //       alert('✓ Field visit and travel claims validated successfully! Saved to cryptographic audit ledger.');
  //     }
  //     router.push('/zrt');
  //   } catch (err: any) {
  //     console.error(err);
  //     alert('Could not complete visit sync: ' + err.message);
  //   } finally {
  //     setSubmittingComplete(false);
  //   }
  // };
  // Step 8: Complete Visit submission
  const handleCompleteVisit = async () => {
    setSubmittingComplete(true);
    try {
      // Simulate checkout coordinates by offsetting check-in coordinates slightly
      const checkoutLat = visit?.latitude ? visit.latitude + 0.008 : 12.9796;
      const checkoutLng = visit?.longitude ? visit.longitude + 0.008 : 77.6026;
      
      const claimedDist = parseFloat(claimedDistance) || 0.0;
      const claimedDur = parseFloat(claimedDuration) || 0.0;

      await new Promise(r => setTimeout(r, 900));

      // Replicate the backend's travel-claim variance check locally, since
      // demo visits aren't persisted server-side and completeVisit() would 404.
      const systemDistKm = visit?.latitude && visit?.longitude
        ? haversineKm(visit.latitude, visit.longitude, checkoutLat, checkoutLng)
        : 0;
      const durationMins = visit?.check_in_at
        ? (Date.now() - new Date(visit.check_in_at).getTime()) / 60000
        : 0;
      const varianceFlag =
        (claimedDist > 0 && claimedDist > systemDistKm * 1.2) ||
        (claimedDur > 0 && claimedDur > durationMins * 1.2);

      if (visit) {
        setVisit({ ...visit, status: 'COMPLETED', check_out_at: new Date().toISOString(), notes });
      }
      const overrides = JSON.parse(localStorage.getItem('demo_zrt_visit_overrides') || '{}');
      overrides[visitId] = { status: 'COMPLETED', check_out_at: new Date().toISOString(), notes };
      localStorage.setItem('demo_zrt_visit_overrides', JSON.stringify(overrides));

      if (varianceFlag) {
        alert('⚠ Audit Warning: Travel claims variance detected! Your claimed distance/duration exceeds the system GPS-tracked calculations by more than 20%. This has been logged in the cryptographic ledger for audit review.');
      } else {
        alert('✓ Field visit and travel claims validated successfully! Saved to cryptographic audit ledger.');
      }
      router.push('/zrt');
    } catch (err: any) {
      console.error(err);
      alert('Could not complete visit sync: ' + err.message);
    } finally {
      setSubmittingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-acc" />
        <p className="text-sm font-semibold text-text-sub">Loading mobile visit cockpit...</p>
      </div>
    );
  }

  if (error || !visit || !customer) {
    return (
      <div className="max-w-md mx-auto p-6 bg-surface border border-border-warm rounded-2xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger-acc mx-auto" />
        <h3 className="text-lg font-extrabold text-navy">Error Loading Visit</h3>
        <p className="text-xs text-text-sub">{error || 'Unknown initialization error.'}</p>
        <button
          onClick={() => router.push('/zrt')}
          className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl"
        >
          Back to Field Desk
        </button>
      </div>
    );
  }

  const stepsLabel = [
    'Check In',
    'Verify',
    'Profile',
    'Checklist',
    'Offers',
    'Notes',
    'Lead Gen',
    'Finish'
  ];

  return (
    <div className="max-w-md mx-auto flex flex-col h-[720px] bg-surface border border-border-warm rounded-[28px] overflow-hidden shadow-2xl relative">      {/* Smartphone Top Notch indicator */}
      <div className="w-full h-6 bg-navy text-white flex justify-between items-center px-6 text-[10px] font-bold select-none">
        <span>9:41 AM</span>
        <div className="w-20 h-4 bg-navy rounded-b-xl mx-auto absolute left-1/2 -translate-x-1/2 top-0 flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
        </div>
        <div className="flex items-center gap-1.5">
          {networkStatus === 'Offline' ? (
            <span className="text-danger-acc">Offline Cache</span>
          ) : (
            <span className="text-success-acc">5G Active</span>
          )}
        </div>
      </div>

      {/* Smartphone Header */}
      <header className="px-4 py-3 bg-surface border-b border-border-warm flex items-center justify-between">
        <button
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            } else {
              router.push('/zrt');
            }
          }}
          className="p-1 hover:bg-bg-warm rounded-xl text-text-sub transition"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div className="text-center">
          <h2 className="font-extrabold text-navy text-sm truncate max-w-[200px]">
            {customer.full_name}
          </h2>
          <p className="text-[10px] text-text-sub font-semibold tracking-wide uppercase">
            Step {currentStep} of {totalSteps}: {stepsLabel[currentStep - 1]}
          </p>
        </div>
        <div className="w-7"></div> {/* Spacer */}
      </header>

      {/* Top Wizard Steps Dot Bar */}
      <div className="flex bg-bg-warm/60 px-4 py-2 gap-1 justify-between items-center border-b border-border-warm">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx + 1 === currentStep
                ? 'w-6 bg-orange-acc'
                : idx + 1 < currentStep
                ? 'w-3 bg-success-acc'
                : 'w-2 bg-border-warm'
            }`}
          ></div>
        ))}
      </div>

      {/* Main Form Content Scrollable */}
      <main className="flex-1 flex flex-col p-5 overflow-y-auto">
        <div className="m-auto w-full space-y-4">
        {/* STEP 1: CHECK IN */}
        {currentStep === 1 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-yellow-acc/10 flex items-center justify-center mx-auto text-orange-acc animate-pulse">
              <MapPin className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-navy">Geo-Location Checklist Check-In</h3>
              <p className="text-xs text-text-sub px-2">
                We must verify your GPS proximity to customer address in <span className="font-semibold text-navy">{customer.city}</span> before capturing assessment checklist.
              </p>
            </div>

            {checkedIn ? (
              <div className="bg-success-acc/10 border border-success-acc/20 rounded-2xl p-4 space-y-2">
                <CheckCircle className="w-6 h-6 text-success-acc mx-auto" />
                <div className="font-extrabold text-success-acc text-xs">Geo-Verification Confirmed</div>
                {geoCoords && (
                  <div className="text-[10px] text-text-sub font-mono">
                    Lat: {geoCoords.lat.toFixed(5)}, Lng: {geoCoords.lng.toFixed(5)}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="w-full py-3 bg-navy hover:bg-navy/90 text-white font-bold rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2"
                >
                  {checkingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Reading GPS coordinates...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 text-yellow-acc" />
                      <span>Check In & Verify Location</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-text-sub font-semibold">
                  (Required to unlock profile audit reviews offline)
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CUSTOMER VERIFICATION */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <Shield className="w-12 h-12 text-navy mx-auto mb-2" />
              <h3 className="text-base font-extrabold text-navy">Customer Multi-Factor Verification</h3>
              <p className="text-xs text-text-sub">
                Authenticate customer via OTP sent to recorded mobile.
              </p>
            </div>

            <div className="bg-bg-warm border border-border-warm rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <div className="text-text-sub font-semibold">Mobile number</div>
                  <div className="font-bold text-navy">{customer.mobile}</div>
                </div>
                {!otpSent && (
                  <button
                    onClick={handleSendOTP}
                    className="px-3 py-1.5 bg-yellow-acc hover:bg-yellow-acc/90 text-navy font-bold rounded-xl text-[10px] transition"
                  >
                    Send code
                  </button>
                )}
              </div>

              {otpSent && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                      Enter 4-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 1234"
                      className="w-full text-center py-2.5 bg-surface border border-border-warm rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-acc text-text-main font-mono tracking-widest font-extrabold"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    className="w-full py-2 bg-navy hover:bg-navy/90 text-white font-bold rounded-xl text-xs transition"
                  >
                    Confirm & Proceed
                  </button>
                </div>
              )}

              {otpVerified && (
                <div className="bg-success-acc/10 border border-success-acc/25 rounded-xl p-2.5 text-center text-success-acc text-xs font-bold">
                  Verification Success
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: CUSTOMER PROFILE REVIEW */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-bg-warm border border-border-warm rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-sm shrink-0">
                {customer.full_name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-navy text-sm truncate">{customer.full_name}</div>
                <div className="text-[10px] text-text-sub font-semibold">
                  CID: {customer.customer_number} • {customer.segment}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-navy uppercase tracking-wider">Demographics Info</h4>
              
              <div className="bg-surface border border-border-warm rounded-2xl p-4 divide-y divide-border-warm space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 first:pt-0">
                  <span className="text-text-sub">Lifecycle Stage</span>
                  <span className="font-bold text-navy uppercase">{customer.lifecycle_stage}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-text-sub">Mobile</span>
                  <span className="font-bold text-navy">{customer.mobile}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-text-sub">Email Address</span>
                  <span className="font-bold text-navy truncate max-w-[200px]">{customer.email}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-text-sub">State / Hub</span>
                  <span className="font-bold text-navy">{customer.state} ({customer.city})</span>
                </div>
                <div className="flex justify-between items-center py-1 last:pb-0">
                  <span className="text-text-sub">Portfolio Value</span>
                  <span className="font-extrabold text-success-acc">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(customer.relationship_value)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: NEED ASSESSMENT CHECKLIST */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-navy uppercase tracking-wider">Needs Assessment Checklist</h3>
              <p className="text-[11px] text-text-sub mt-0.5">Toggle customer capital requirements discussed:</p>
            </div>

            <div className="space-y-2.5">
              {(Object.keys(needAssessment) as Array<keyof typeof needAssessment>).map((key) => {
                const label = key
                  .replace(/_/g, ' ')
                  .replace('need', '')
                  .trim()
                  .replace(/^\w/, c => c.toUpperCase());
                
                const checked = needAssessment[key];

                return (
                  <button
                    key={key}
                    onClick={() => handleChecklistToggle(key)}
                    className={`w-full flex items-center justify-between p-3.5 border rounded-2xl transition text-left ${
                      checked
                        ? 'bg-yellow-acc/10 border-yellow-acc/60'
                        : 'bg-surface border-border-warm hover:border-yellow-acc/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        checked ? 'bg-orange-acc border-orange-acc text-white' : 'border-border-warm'
                      }`}>
                        {checked && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-bold text-navy">{label} Capital</span>
                    </div>
                    
                    <span className="text-[10px] text-text-sub uppercase font-semibold">
                      {checked ? 'Requested' : 'No need'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: AI PRODUCT SUGGESTIONS */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="bg-yellow-acc/10 border border-yellow-acc/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-acc">
                <Sparkles className="w-4 h-4" />
                <span>AI Propensity Recommendations</span>
              </div>
              <p className="text-[11px] text-navy">
                YellowSense AI calculated active product affinities matching this segment lifecycle:
              </p>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Business Expansion Term Loan', score: 94, reason: 'High GST filings' },
                { name: 'Yellow QR Merchant Merchant Account', score: 88, reason: 'High cash handling' },
                { name: 'Corporate Group Insurance Plan', score: 72, reason: 'Employee count is > 10' },
                { name: 'Employee Salary Premium Account bundle', score: 65, reason: 'Payroll consolidation opportunity' }
              ].map((prod) => {
                const selected = selectedSuggestions.includes(prod.name);
                return (
                  <div
                    key={prod.name}
                    onClick={() => handleSuggestionToggle(prod.name)}
                    className={`p-3.5 border rounded-2xl cursor-pointer transition flex justify-between items-center ${
                      selected ? 'bg-yellow-acc/15 border-yellow-acc' : 'bg-surface border-border-warm'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-navy text-xs truncate">{prod.name}</div>
                      <div className="text-[10px] text-text-sub font-semibold mt-0.5">
                        Trigger: {prod.reason}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-success-acc">{prod.score}% Match</div>
                      <div className="text-[9px] text-text-sub mt-0.5">
                        {selected ? 'Added to brief' : 'Tap to add'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: CAPTURE NOTES & DOCUMENTS */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-navy uppercase tracking-wider mb-1.5">
                Visit Officer Notes
              </label>
              <textarea
                rows={4}
                className="w-full p-3 bg-bg-warm border border-border-warm rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-yellow-acc text-text-main"
                placeholder="Write summary notes of conversation, issues raised by customer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-navy uppercase tracking-wider">Upload Verification Docs</h4>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  'GST Certificate Photo',
                  'Office Signboard Photo',
                  'Business PAN Card',
                  'Customer Signature Seal'
                ].map((docType) => {
                  const uploaded = uploadedDocs.includes(docType);
                  const scanning = ocrLoading === docType;
                  const ocrData = ocrResults[docType];
                  
                  return (
                    <div key={docType} className="flex flex-col gap-1 border border-border-warm/50 p-2 rounded-2xl bg-bg-warm/10">
                      <button
                        onClick={() => !scanning && handleUploadMockDoc(docType)}
                        disabled={scanning}
                        className={`w-full p-3 border rounded-xl text-center text-xs transition font-semibold flex flex-col items-center justify-center gap-1.5 ${
                          scanning
                            ? 'bg-orange-acc/10 border-orange-acc text-orange-acc animate-pulse cursor-wait'
                            : uploaded
                              ? ocrData?.status === 'FRAUD_ALERT'
                                ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100/50'
                                : 'bg-success-acc/10 border-success-acc text-success-acc'
                              : 'bg-surface border-border-warm hover:border-yellow-acc text-text-sub hover:text-navy'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span className="truncate max-w-full text-[10px]">{docType}</span>
                        <span className="text-[8px] tracking-wide uppercase font-extrabold mt-0.5">
                          {scanning ? 'OCR Scanning...' : uploaded ? 'Scanned' : 'Upload'}
                        </span>
                      </button>
                      
                      {ocrData && (
                        <div className={`p-1.5 text-[9px] rounded-lg border font-mono ${
                          ocrData.status === 'FRAUD_ALERT' 
                            ? 'bg-red-50 border-red-200 text-red-700' 
                            : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                        }`}>
                          <div className="font-extrabold text-[8px] uppercase flex justify-between mb-0.5">
                            <span>OCR Readout</span>
                            <span>{ocrData.status}</span>
                          </div>
                          {Object.entries(ocrData.extracted_fields).map(([k, v]) => (
                            <div key={k} className="truncate">
                              {k}: {v as string}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: CREATE OPPORTUNITY LEAD */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <Bot className="w-12 h-12 text-orange-acc mx-auto mb-1 animate-bounce" />
              <h3 className="text-base font-extrabold text-navy">Direct Lead Pipeline Ingestion</h3>
              <p className="text-xs text-text-sub">
                Ingest high-propensity opportunities directly to RM pipeline desk.
              </p>
            </div>

            {newLeadCreated ? (
              <div className="bg-success-acc/10 border border-success-acc/20 rounded-2xl p-4 text-center space-y-2">
                <CheckCircle className="w-6 h-6 text-success-acc mx-auto" />
                <div className="font-extrabold text-success-acc text-xs">Opportunity Lead Queued!</div>
                <p className="text-[10px] text-text-sub">
                  Will appear on Kanban board immediately upon syncing.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateLead} className="bg-bg-warm border border-border-warm rounded-2xl p-4 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                    Select Cross-Sell Product
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-surface border border-border-warm rounded-xl text-xs text-text-main font-semibold focus:outline-none"
                    value={leadProduct}
                    onChange={(e) => setLeadProduct(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Product --</option>
                    <option value="Working Capital Loan">Working Capital Loan</option>
                    <option value="Term Loan - Business Expansion">Term Loan - Business Expansion</option>
                    <option value="POS QR Payment Terminal">POS QR Payment Terminal</option>
                    <option value="Salary Premium Savings Account">Salary Premium Savings Account</option>
                    <option value="Commercial Fire & Theft Insurance">Commercial Fire & Theft Insurance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                    Potential Opportunity Value (INR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    required
                    className="w-full px-3 py-2 bg-surface border border-border-warm rounded-xl text-xs focus:outline-none text-text-main font-semibold"
                    value={leadValue}
                    onChange={(e) => setLeadValue(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingLead}
                  className="w-full py-2 bg-navy hover:bg-navy/90 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  {creatingLead ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      <span>Ingesting Lead...</span>
                    </>
                  ) : (
                    <span>Create RM Opportunity Lead</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 8: SUMMARY & COMPLETE */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <div className="text-center py-4 space-y-2">
              <Award className="w-16 h-16 text-success-acc mx-auto mb-1 animate-pulse" />
              <h3 className="text-base font-extrabold text-navy">Ready to Finalize Visit</h3>
              <p className="text-xs text-text-sub px-4">
                Verify summarized indicators. Completed runs are audited for performance incentives.
              </p>
            </div>

            {/* Travel Reimbursement Claims Section */}
            <div className="bg-surface border border-border-warm rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-extrabold text-navy uppercase tracking-wider flex justify-between">
                <span>Travel Reimbursement Claim</span>
                <span className="text-[9px] text-orange-acc font-extrabold">GPS Audited</span>
              </h4>
              
              <div>
                <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                  Declared Route Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chennai Central -> Ambattur Office"
                  className="w-full px-3 py-2 bg-[#FFFDF7] border border-border-warm rounded-xl text-xs text-text-main font-semibold focus:outline-none focus:ring-1 focus:ring-yellow-acc"
                  value={declaredRoute}
                  onChange={(e) => setDeclaredRoute(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                    Claimed Distance (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5.4"
                    className="w-full px-3 py-2 bg-[#FFFDF7] border border-border-warm rounded-xl text-xs text-text-main font-semibold focus:outline-none focus:ring-1 focus:ring-yellow-acc"
                    value={claimedDistance}
                    onChange={(e) => setClaimedDistance(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-navy uppercase tracking-wider mb-1">
                    Claimed Duration (mins)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    className="w-full px-3 py-2 bg-[#FFFDF7] border border-border-warm rounded-xl text-xs text-text-main font-semibold focus:outline-none focus:ring-1 focus:ring-yellow-acc"
                    value={claimedDuration}
                    onChange={(e) => setClaimedDuration(e.target.value)}
                    required
                  />
                </div>
              </div>
              <p className="text-[10px] text-text-sub leading-normal">
                Note: UCO Bank policy enforces GPS validation. Claims with variance &gt;20% compared to check-in/out telemetry will trigger audit flag overrides.
              </p>
            </div>

            <div className="bg-bg-warm border border-border-warm rounded-2xl p-4 divide-y divide-border-warm text-xs space-y-2">
              <div className="flex justify-between items-center py-1 first:pt-0">
                <span className="text-text-sub">Checked-In GPS</span>
                <span className="font-semibold text-success-acc flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-sub">Needs Checked</span>
                <span className="font-bold text-navy">
                  {Object.values(needAssessment).filter(Boolean).length} points
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-sub">Cross-Sell Opportunity</span>
                <span className="font-bold text-navy">
                  {newLeadCreated ? 'Lead generated' : 'None generated'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 last:pb-0">
                <span className="text-text-sub">Notes Written</span>
                <span className="font-bold text-navy truncate max-w-[160px]">
                  {notes ? `${notes.substring(0, 20)}...` : 'None'}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleCompleteVisit}
                disabled={submittingComplete}
                className="w-full py-3 bg-success-acc hover:bg-success-acc/90 text-white font-extrabold rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2 shadow-md"
              >
                {submittingComplete ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Run...</span>
                  </>
                ) : (
                  <span>Submit Completed Execution</span>
                )}
              </button>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Smartphone Bottom Actions footer (Step Navigator) */}
      <footer className="px-4 py-3 bg-surface border-t border-border-warm flex justify-between items-center">
        <button
          onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
          disabled={currentStep === 1}
          className="px-3.5 py-1.5 border border-border-warm hover:bg-bg-warm text-navy text-xs font-bold rounded-xl disabled:opacity-40 transition flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <span className="text-[10px] text-text-sub font-extrabold tracking-widest uppercase">
          Step {currentStep} of {totalSteps}
        </span>

        {currentStep < totalSteps ? (
          <button
            onClick={() => {
              // Enforce check in for advancing past step 1
              if (currentStep === 1 && !checkedIn) {
                alert('Please Check-In using GPS first.');
                return;
              }
              // Enforce OTP verification for advancing past step 2
              if (currentStep === 2 && !otpVerified) {
                alert('Verify customer identity via OTP first.');
                return;
              }
              setCurrentStep(currentStep + 1);
            }}
            className="px-3.5 py-1.5 bg-navy hover:bg-navy/90 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="w-14"></div> // Spacer to keep layout balanced
        )}
      </footer>
    </div>
  );
}

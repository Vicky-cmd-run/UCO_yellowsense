/**
 * DEMO_DATA.ts
 * Full simulation dataset for YellowSense Customer 360 POC.
 * This data is used as fallback when the backend API is unavailable,
 * ensuring the demo always runs with rich, realistic content.
 */

// ─── USERS ───────────────────────────────────────────────────────────────────
export const DEMO_USERS = [
  { id: 'u001', name: 'Arjun Rao', employee_id: 'ZRT001', role: 'ZRT_OFFICER', branch_id: 'Chennai Central', region_id: 'South', email: 'arjun.rao@yellowsensebank.com', status: 'ACTIVE' },
  { id: 'u002', name: 'Priya Nair', employee_id: 'RM001', role: 'RM', branch_id: 'Chennai Central', region_id: 'South', email: 'priya.nair@yellowsensebank.com', status: 'ACTIVE' },
  { id: 'u003', name: 'Vikram Shah', employee_id: 'VRM001', role: 'VRM', branch_id: 'National', region_id: 'National', email: 'vikram.shah@yellowsensebank.com', status: 'ACTIVE' },
  { id: 'u004', name: 'Meera Iyer', employee_id: 'BM001', role: 'BRANCH_MANAGER', branch_id: 'Chennai Central', region_id: 'South', email: 'meera.iyer@yellowsensebank.com', status: 'ACTIVE' },
  { id: 'u005', name: 'Rahul Menon', employee_id: 'RH001', role: 'REGIONAL_HEAD', branch_id: 'Regional HO', region_id: 'South', email: 'rahul.menon@yellowsensebank.com', status: 'ACTIVE' },
  { id: 'u006', name: 'Ananya Kapoor', employee_id: 'HO001', role: 'HEAD_OFFICE', branch_id: 'Head Office', region_id: 'National', email: 'ananya.kapoor@yellowsensebank.com', status: 'ACTIVE' },
];

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────
export const DEMO_CUSTOMERS = [
  {
    id: 'c001', customer_number: 'UCO2024001', full_name: 'Kumar Textiles Pvt Ltd',
    customer_type: 'CORPORATE', segment: 'MSME', lifecycle_stage: 'ACTIVE',
    mobile: '9841234567', email: 'contact@kumartextiles.in',
    city: 'Chennai', state: 'Tamil Nadu', branch_id: 'Chennai Central',
    relationship_value: 25000000, relationship_tenure_months: 48,
    digital_engagement_score: 84, sentiment: 'POSITIVE',
    churn_risk: 18, lead_propensity: 87,
    gst_number: '33AABCK1234A1ZX', turnover: 120000000,
    assigned_rm_id: 'u002', assigned_zrt_id: 'u001',
    msme_scheme_qualified: 'CGTMSE Collateral-Free Scheme',
    kcc_eligible: false,
    fraud_check_status: 'PASSED',
    security_alerts_count: 0,
    accounts: [
      { id: 'a001', account_number: 'CC2024001001', account_type: 'CURRENT', balance: 4200000, status: 'ACTIVE', branch: 'Chennai Central', ifsc: 'UCOB0001234' },
      { id: 'a002', account_number: 'OD2024001002', account_type: 'OVERDRAFT', balance: -1500000, limit: 5000000, status: 'ACTIVE', branch: 'Chennai Central', ifsc: 'UCOB0001234' },
    ],
    holdings: [
      { id: 'h001', product: 'Cash Credit', amount: 12000000, interest_rate: 9.5, status: 'ACTIVE' },
      { id: 'h002', product: 'Term Loan', amount: 8000000, interest_rate: 10.2, status: 'ACTIVE' },
      { id: 'h001d', product: 'Mobile Banking', amount: 0, interest_rate: 0, status: 'ACTIVE', category: 'DIGITAL' },
      { id: 'h002d', product: 'UPI Merchant QR', amount: 0, interest_rate: 0, status: 'PENDING', category: 'DIGITAL' },
    ],
  },
  {
    id: 'c002', customer_number: 'UCO2024002', full_name: 'Anita Sharma',
    customer_type: 'INDIVIDUAL', segment: 'HNI', lifecycle_stage: 'AT_RISK',
    mobile: '9912345678', email: 'anita.sharma@email.com',
    city: 'Chennai', state: 'Tamil Nadu', branch_id: 'Chennai Central',
    relationship_value: 18500000, relationship_tenure_months: 72,
    digital_engagement_score: 15, sentiment: 'NEGATIVE',
    churn_risk: 82, lead_propensity: 32,
    assigned_rm_id: 'u002', assigned_zrt_id: 'u001',
    msme_scheme_qualified: null,
    kcc_eligible: false,
    fraud_check_status: 'FAILED',
    security_alerts_count: 1,
    accounts: [
      { id: 'a003', account_number: 'SB2024002001', account_type: 'SAVINGS', balance: 320000, status: 'ACTIVE', branch: 'Chennai Central', ifsc: 'UCOB0001234' },
    ],
    holdings: [
      { id: 'h003', product: 'Fixed Deposit', amount: 15000000, interest_rate: 7.2, status: 'ACTIVE' },
    ],
  },
  {
    id: 'c003', customer_number: 'UCO2024003', full_name: 'Sri Balaji Engineering Works',
    customer_type: 'CORPORATE', segment: 'MSME', lifecycle_stage: 'ACTIVE',
    mobile: '9876543210', email: 'accounts@sribalaji.co.in',
    city: 'Coimbatore', state: 'Tamil Nadu', branch_id: 'Coimbatore Main',
    relationship_value: 12000000, relationship_tenure_months: 36,
    digital_engagement_score: 72, sentiment: 'NEUTRAL',
    churn_risk: 25, lead_propensity: 74,
    gst_number: '33AABCS5678B2ZY', turnover: 65000000,
    assigned_rm_id: 'u002', assigned_zrt_id: 'u001',
    msme_scheme_qualified: 'Mudra Loan Scheme',
    kcc_eligible: false,
    fraud_check_status: 'WARNING',
    security_alerts_count: 1,
    accounts: [
      { id: 'a004', account_number: 'CC2024003001', account_type: 'CURRENT', balance: 2100000, status: 'ACTIVE', branch: 'Coimbatore Main', ifsc: 'UCOB0005678' },
    ],
    holdings: [
      { id: 'h004', product: 'Working Capital Loan', amount: 8000000, interest_rate: 9.8, status: 'ACTIVE' },
    ],
  },
  {
    id: 'c004', customer_number: 'UCO2024004', full_name: 'Rajesh Khanna & Sons',
    customer_type: 'CORPORATE', segment: 'SME', lifecycle_stage: 'ACTIVE',
    mobile: '9443112233', email: 'rajesh@khannatraders.com',
    city: 'Chennai', state: 'Tamil Nadu', branch_id: 'Chennai Central',
    relationship_value: 8500000, relationship_tenure_months: 24,
    digital_engagement_score: 91, sentiment: 'POSITIVE',
    churn_risk: 8, lead_propensity: 92,
    gst_number: '33AABCR9012C3ZZ', turnover: 42000000,
    assigned_rm_id: 'u002', assigned_zrt_id: 'u001',
    accounts: [
      { id: 'a005', account_number: 'CC2024004001', account_type: 'CURRENT', balance: 1800000, status: 'ACTIVE', branch: 'Chennai Central', ifsc: 'UCOB0001234' },
    ],
    holdings: [
      { id: 'h005', product: 'MSME Loan', amount: 5000000, interest_rate: 10.5, status: 'ACTIVE' },
    ],
  },
  {
    id: 'c005', customer_number: 'UCO2024005', full_name: 'Lakshmi Precision Tools Ltd',
    customer_type: 'CORPORATE', segment: 'MSME', lifecycle_stage: 'DORMANT',
    mobile: '9566778899', email: 'lpt@lakshmiprecision.in',
    city: 'Bengaluru', state: 'Karnataka', branch_id: 'Bengaluru Indiranagar',
    relationship_value: 5200000, relationship_tenure_months: 60,
    digital_engagement_score: 22, sentiment: 'NEUTRAL',
    churn_risk: 68, lead_propensity: 55,
    gst_number: '29AABCL3456D4ZW', turnover: 28000000,
    assigned_rm_id: 'u002', assigned_zrt_id: 'u001',
    accounts: [
      { id: 'a006', account_number: 'CC2024005001', account_type: 'CURRENT', balance: 450000, status: 'DORMANT', branch: 'Bengaluru Indiranagar', ifsc: 'UCOB0009012' },
    ],
    holdings: [],
  },
  {
    id: 'c006', customer_number: 'UCO2024006', full_name: 'Meenakshi Traders',
    customer_type: 'CORPORATE', segment: 'MICRO', lifecycle_stage: 'ACTIVE',
    mobile: '9944556677', email: 'meenakshi.traders@gmail.com',
    city: 'Madurai', state: 'Tamil Nadu', branch_id: 'Madurai North',
    relationship_value: 3800000, relationship_tenure_months: 18,
    digital_engagement_score: 65, sentiment: 'POSITIVE',
    churn_risk: 22, lead_propensity: 80,
    gst_number: '33AABCM7890E5ZV', turnover: 18000000,
    assigned_rm_id: 'u002', assigned_zrt_id: 'u001',
    accounts: [
      { id: 'a007', account_number: 'CC2024006001', account_type: 'CURRENT', balance: 780000, status: 'ACTIVE', branch: 'Madurai North', ifsc: 'UCOB0003456' },
    ],
    holdings: [],
  },
  {
    id: 'c007', customer_number: 'UCO2024007', full_name: 'Suresh Packing Solutions',
    customer_type: 'CORPORATE', segment: 'MSME', lifecycle_stage: 'ACTIVE',
    mobile: '9600123456', email: 'suresh@sureshpacking.com',
    city: 'Chennai', state: 'Tamil Nadu', branch_id: 'Chennai Central',
    relationship_value: 14000000, relationship_tenure_months: 42,
    digital_engagement_score: 58, sentiment: 'NEUTRAL',
    churn_risk: 35, lead_propensity: 68,
    gst_number: '33AABCS1122F6ZU', turnover: 72000000,
    assigned_rm_id: 'u002', assigned_zrt_id: 'u001',
    accounts: [
      { id: 'a008', account_number: 'CC2024007001', account_type: 'CURRENT', balance: 3100000, status: 'ACTIVE', branch: 'Chennai Central', ifsc: 'UCOB0001234' },
    ],
    holdings: [
      { id: 'h006', product: 'Cash Credit', amount: 8000000, interest_rate: 9.25, status: 'ACTIVE' },
    ],
  },
  {
    id: 'c008', customer_number: 'UCO2024008', full_name: 'Dr. Vijaya Lakshmi',
    customer_type: 'INDIVIDUAL', segment: 'HNI', lifecycle_stage: 'ACTIVE',
    mobile: '9894567890', email: 'dr.vijaya@hospitalmail.com',
    city: 'Hyderabad', state: 'Telangana', branch_id: 'Hyderabad Gachibowli',
    relationship_value: 22000000, relationship_tenure_months: 96,
    digital_engagement_score: 78, sentiment: 'POSITIVE',
    churn_risk: 12, lead_propensity: 81,
    assigned_rm_id: 'u002', assigned_zrt_id: 'u001',
    accounts: [
      { id: 'a009', account_number: 'SB2024008001', account_type: 'SAVINGS', balance: 8500000, status: 'ACTIVE', branch: 'Hyderabad Gachibowli', ifsc: 'UCOB0007890' },
    ],
    holdings: [
      { id: 'h007', product: 'Fixed Deposit', amount: 10000000, interest_rate: 7.5, status: 'ACTIVE' },
      { id: 'h008', product: 'Mutual Fund', amount: 3000000, interest_rate: 0, status: 'ACTIVE' },
    ],
  },
];

// ─── VISITS ──────────────────────────────────────────────────────────────────
export const DEMO_VISITS = [
  {
    id: 'v001', customer_id: 'c001', zrt_officer_id: 'u001',
    purpose: 'Monthly account review + expansion requirement discussion',
    scheduled_at: new Date(Date.now() + 1 * 3600000).toISOString(),
    status: 'SCHEDULED', geo_verified: false,
    priority_score: 89, distance_km: 4.2, travel_mins: 18,
    opportunity_value: 25000000,
    customer: DEMO_CUSTOMERS[0],
    coordinates: { lat: 13.0827, lng: 80.2707 },
    address: '14, Anna Salai, T.Nagar, Chennai - 600017',
  },
  {
    id: 'v002', customer_id: 'c002', zrt_officer_id: 'u001',
    purpose: 'Service recovery — address unresolved complaint, retain FD',
    scheduled_at: new Date(Date.now() + 2.5 * 3600000).toISOString(),
    status: 'SCHEDULED', geo_verified: false,
    priority_score: 94, distance_km: 6.8, travel_mins: 28,
    opportunity_value: 18500000,
    customer: DEMO_CUSTOMERS[1],
    coordinates: { lat: 13.0600, lng: 80.2496 },
    address: '7, Nungambakkam High Road, Chennai - 600034',
  },
  {
    id: 'v003', customer_id: 'c007', zrt_officer_id: 'u001',
    purpose: 'Cross-sell POS QR merchant terminal + GST credit review',
    scheduled_at: new Date(Date.now() + 4 * 3600000).toISOString(),
    status: 'SCHEDULED', geo_verified: false,
    priority_score: 72, distance_km: 2.1, travel_mins: 12,
    opportunity_value: 14000000,
    customer: DEMO_CUSTOMERS[6],
    coordinates: { lat: 13.0900, lng: 80.2850 },
    address: '102, Mount Road, Guindy, Chennai - 600032',
  },
  {
    id: 'v004', customer_id: 'c004', zrt_officer_id: 'u001',
    purpose: 'Collect signed MSME enhancement documents, discuss next tranche',
    scheduled_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    status: 'COMPLETED', geo_verified: true,
    check_in_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    check_out_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    priority_score: 88, distance_km: 3.5, travel_mins: 15,
    opportunity_value: 8500000,
    customer: DEMO_CUSTOMERS[3],
    coordinates: { lat: 13.0780, lng: 80.2000 },
    address: '45, Vadapalani, Chennai - 600026',
    notes: 'Customer confirmed need for ₹50L expansion loan. Submitted financials. Strong cash flows. Recommend fast-track approval.',
  },
  {
    id: 'v005', customer_id: 'c006', zrt_officer_id: 'u001',
    purpose: 'Digital activation: UPI QR, net banking onboarding',
    scheduled_at: new Date(Date.now() + 5.5 * 3600000).toISOString(),
    status: 'SCHEDULED', geo_verified: false,
    priority_score: 65, distance_km: 8.4, travel_mins: 35,
    opportunity_value: 3800000,
    customer: DEMO_CUSTOMERS[5],
    coordinates: { lat: 13.0450, lng: 80.2300 },
    address: '23, GST Road, Chromepet, Chennai - 600044',
  },
];

// ─── LEADS ───────────────────────────────────────────────────────────────────
export const DEMO_LEADS = [
  { id: 'l001', customer_id: 'c001', customer_name: 'Kumar Textiles Pvt Ltd', source: 'ZRT', product: 'MSME Expansion Loan', potential_value: 25000000, stage: 'In Progress', priority: 'HIGH', conversion_probability: 87, owner_id: 'u002', owner_name: 'Priya Nair', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), follow_up_date: new Date(Date.now() + 1 * 86400000).toISOString(), segment: 'MSME' },
  { id: 'l002', customer_id: 'c004', customer_name: 'Rajesh Khanna & Sons', source: 'RM', product: 'Working Capital Loan', potential_value: 8000000, stage: 'Proposal', priority: 'HIGH', conversion_probability: 92, owner_id: 'u002', owner_name: 'Priya Nair', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), follow_up_date: new Date(Date.now() + 2 * 86400000).toISOString(), segment: 'SME' },
  { id: 'l003', customer_id: 'c003', customer_name: 'Sri Balaji Engineering Works', source: 'ZRT', product: 'POS QR Terminal Bundle', potential_value: 500000, stage: 'Contacted', priority: 'MEDIUM', conversion_probability: 74, owner_id: 'u003', owner_name: 'Vikram Shah', created_at: new Date(Date.now() - 7 * 86400000).toISOString(), follow_up_date: new Date(Date.now() + 3 * 86400000).toISOString(), segment: 'MSME' },
  { id: 'l004', customer_id: 'c007', customer_name: 'Suresh Packing Solutions', source: 'VRM', product: 'GST Credit Line Enhancement', potential_value: 12000000, stage: 'New', priority: 'MEDIUM', conversion_probability: 68, owner_id: 'u003', owner_name: 'Vikram Shah', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), follow_up_date: new Date(Date.now() + 4 * 86400000).toISOString(), segment: 'MSME' },
  { id: 'l005', customer_id: 'c008', customer_name: 'Dr. Vijaya Lakshmi', source: 'RM', product: 'Wealth Management – Mutual Funds', potential_value: 5000000, stage: 'Proposal', priority: 'HIGH', conversion_probability: 81, owner_id: 'u002', owner_name: 'Priya Nair', created_at: new Date(Date.now() - 10 * 86400000).toISOString(), follow_up_date: new Date(Date.now() + 1 * 86400000).toISOString(), segment: 'HNI' },
  { id: 'l006', customer_id: 'c006', customer_name: 'Meenakshi Traders', source: 'ZRT', product: 'MUDRA Loan – Shishu', potential_value: 500000, stage: 'Contacted', priority: 'LOW', conversion_probability: 80, owner_id: 'u001', owner_name: 'Arjun Rao', created_at: new Date(Date.now() - 4 * 86400000).toISOString(), segment: 'MICRO' },
  { id: 'l007', customer_id: 'c005', customer_name: 'Lakshmi Precision Tools Ltd', source: 'Campaign', product: 'Account Reactivation + OD Facility', potential_value: 3000000, stage: 'New', priority: 'MEDIUM', conversion_probability: 55, owner_id: 'u003', owner_name: 'Vikram Shah', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), segment: 'MSME' },
  { id: 'l008', customer_id: 'c001', customer_name: 'Kumar Textiles Pvt Ltd', source: 'RM', product: 'Trade Finance – LC', potential_value: 10000000, stage: 'Converted', priority: 'HIGH', conversion_probability: 100, owner_id: 'u002', owner_name: 'Priya Nair', created_at: new Date(Date.now() - 20 * 86400000).toISOString(), segment: 'MSME' },
  { id: 'l009', customer_id: 'c002', customer_name: 'Anita Sharma', source: 'VRM', product: 'FD Renewal + Flexi Deposit', potential_value: 15000000, stage: 'Contacted', priority: 'HIGH', conversion_probability: 32, owner_id: 'u003', owner_name: 'Vikram Shah', created_at: new Date(Date.now() - 6 * 86400000).toISOString(), segment: 'HNI' },
  { id: 'l010', customer_id: 'c004', customer_name: 'Rajesh Khanna & Sons', source: 'Campaign', product: 'Business Credit Card', potential_value: 200000, stage: 'Lost', priority: 'LOW', conversion_probability: 0, owner_id: 'u002', owner_name: 'Priya Nair', created_at: new Date(Date.now() - 15 * 86400000).toISOString(), segment: 'SME' },
];

// ─── MEETINGS ─────────────────────────────────────────────────────────────────
export const DEMO_MEETINGS = [
  {
    id: 'm001', customer_id: 'c001', customer_name: 'Kumar Textiles Pvt Ltd',
    employee_id: 'u002', employee_name: 'Priya Nair',
    scheduled_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    purpose: 'MSME Expansion Loan – Initial Assessment',
    duration_mins: 45,
    transcript: `Priya: Good afternoon Mr. Kumar. Thanks for having us.
Kumar: Thank you Priya. We've been very happy with UCO for the past 4 years. We are planning a major warehouse expansion in Ambattur SIDCO.
Priya: That's exciting. What's the total investment you're envisaging?
Kumar: Around 2.5 crores for the land purchase, building, and machinery. We want 60-70% as bank finance.
Priya: Our MSME expansion product can go up to 80% LTV at 9.5% for eligible customers. Your track record is excellent. Our ZRT officer Arjun did a field verification last week and filed a very strong note.
Kumar: Yes, Arjun is very proactive. He helped us with the POS terminal last year too.
Priya: Right. One concern I noted was the POS complaint that's been pending for 6 weeks. Can we close that first before the loan disbursal?
Kumar: Yes, the machine keeps giving network errors. Your team said they'd replace it.
Priya: I'll personally escalate that today. Let me also share the MSME loan checklist. We need your GST returns for the last 2 years, CA certified financials, and property documents.
Kumar: We have all of that ready. When can we expect approval?
Priya: If documents are complete, we can do in-principle approval in 10 working days. Final disbursement in 21 days.`,
    summary: 'Kumar Textiles planning ₹2.5Cr warehouse expansion in Ambattur SIDCO. Seeking 70% LTV (≈₹1.75Cr) as MSME Expansion Loan. Strong banking track record over 4 years. Open POS terminal complaint needs resolution before loan disbursal. Customer ready with all documents (GST returns, CA financials, property docs). In-principle approval in 10 days, disbursement in 21 days.',
    action_items: JSON.stringify(['Escalate POS terminal complaint (Ticket #UCO-COMP-0012) to tech team — close within 3 days', 'Share MSME Expansion Loan checklist with Kumar', 'Collect GST returns (2022-23, 2023-24), CA certified P&L, Balance Sheet, Property documents', 'Submit loan appraisal note to credit by Friday']),
    sentiment: 'POSITIVE',
    follow_up_date: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
  {
    id: 'm002', customer_id: 'c002', customer_name: 'Anita Sharma',
    employee_id: 'u003', employee_name: 'Vikram Shah',
    scheduled_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    purpose: 'FD Maturity Advisory — Renewal Options',
    duration_mins: 30,
    transcript: `Vikram: Hello Ma'am, this is Vikram from UCO Bank. Is this a good time?
Anita: I suppose. But I'm quite disappointed with the bank actually. My FD matured 3 weeks ago and nobody reached out.
Vikram: I sincerely apologize for that, Ma'am. That's completely unacceptable. I'm calling to personally handle this now.
Anita: I've already moved half the amount to another bank. They gave me 7.8% which is better than what I was getting here.
Vikram: I understand. We currently have a 444-day special deposit scheme at 7.55% and we can offer a loyalty premium of 0.25% for long-standing customers like you, making it 7.8%. Would that work?
Anita: Maybe for a smaller amount. I'm not moving everything back. I've also had issues with the mobile app — it never works properly.
Vikram: I'll personally register a tech complaint for your app issues and ensure it's resolved in 48 hours. For the FD, how much would you consider placing with us?
Anita: Perhaps 50 lakhs for now. Let's see if things improve.`,
    summary: 'Anita Sharma at risk of churning 50%+ of FD corpus (₹1.5Cr+ already moved out). Dissatisfied due to (1) no proactive outreach at FD maturity, (2) persistent mobile app login issues. Agreed to retain ₹50L at 7.8% (loyalty rate). App complaint to be registered and resolved in 48 hours. Risk: further outflow likely if service issues persist.',
    action_items: JSON.stringify(['Register mobile app complaint — escalate to digital team, 48-hour SLA', 'Process ₹50L FD renewal at 7.8% loyalty rate — 444-day tenor', 'Schedule 30-day follow-up call to assess satisfaction', 'Discuss wealth management products in next interaction']),
    sentiment: 'NEGATIVE',
    follow_up_date: new Date(Date.now() + 14 * 86400000).toISOString(),
  },
  {
    id: 'm003', customer_id: 'c004', customer_name: 'Rajesh Khanna & Sons',
    employee_id: 'u002', employee_name: 'Priya Nair',
    scheduled_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    purpose: 'Working Capital Enhancement Discussion',
    duration_mins: 25,
    transcript: `Priya: Hi Rajesh, thanks for meeting at such short notice.
Rajesh: Of course, Priya. Our business has really scaled up this year — we've added 3 new distribution clients.
Priya: That's great to hear. I noticed your average CC utilization has jumped from 45% to 92% in the last quarter. You're clearly at capacity.
Rajesh: Yes, we're turning down orders because we don't have working capital to stock up before the festive season. We need the limit enhanced from 50 lakhs to 1 crore.
Priya: Our digital score for your account is 91 — excellent. Your repayment track is clean for 2 years. I think this is very doable. Would you like to apply formally this week?
Rajesh: Absolutely. What documents do you need?
Priya: Just the latest 6-month bank statement and a brief note on the new client contracts. Your existing CIBIL and financials are on file.
Rajesh: Done. I'll send by tomorrow.`,
    summary: 'Rajesh Khanna & Sons requesting WC limit enhancement from ₹50L to ₹1Cr. Business growth validated — 3 new distribution clients, CC utilization at 92%. Clean 2-year repayment record, CIBIL score in file. Documents needed: 6-month bank statement + client contract note. Strong approval candidate.',
    action_items: JSON.stringify(['Collect 6-month bank statement and client contract note from Rajesh by tomorrow EOD', 'Initiate CC enhancement application — target ₹1Cr limit', 'Submit credit note for fast-track review']),
    sentiment: 'POSITIVE',
    follow_up_date: new Date(Date.now() + 3 * 86400000).toISOString(),
  },
];

// ─── COMPLAINTS ────────────────────────────────────────────────────────────────
export const DEMO_COMPLAINTS = [
  { id: 'comp001', customer_id: 'c001', customer_name: 'Kumar Textiles Pvt Ltd', category: 'POS / Merchant Terminal', description: 'POS terminal (MID: UCO8823441) giving network error E402 for last 6 weeks. Unable to process card payments. Affecting business operations.', severity: 'HIGH', status: 'OPEN', sla_hours: 48, sla_breach_at: new Date(Date.now() - 5 * 86400000).toISOString(), assigned_team: 'Digital Channels Team', escalation_level: 2, created_at: new Date(Date.now() - 6 * 86400000).toISOString(), ticket_id: 'UCO-COMP-0012' },
  { id: 'comp002', customer_id: 'c002', customer_name: 'Anita Sharma', category: 'Mobile Banking', description: 'Mobile app (iOS 17.4) fails at biometric login. OTP screen shows error code 504. Unable to access account for 2 weeks.', severity: 'MEDIUM', status: 'IN_PROGRESS', sla_hours: 72, sla_breach_at: new Date(Date.now() + 1 * 86400000).toISOString(), assigned_team: 'App Support Team', escalation_level: 1, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), ticket_id: 'UCO-COMP-0047' },
  { id: 'comp003', customer_id: 'c005', customer_name: 'Lakshmi Precision Tools Ltd', category: 'Account Statement', description: 'Transaction dated 14-Jun-2026 for ₹2,45,000 shows incorrect debit description. Need rectification and revised statement for GST filing.', severity: 'LOW', status: 'OPEN', sla_hours: 120, sla_breach_at: new Date(Date.now() + 3 * 86400000).toISOString(), assigned_team: 'Operations Team', escalation_level: 0, created_at: new Date(Date.now() - 1 * 86400000).toISOString(), ticket_id: 'UCO-COMP-0053' },
  { id: 'comp004', customer_id: 'c007', customer_name: 'Suresh Packing Solutions', category: 'Cheque Dishonour', description: 'Inward cheque of ₹3.8L dishonoured twice citing "Exceeds Arrangement" though OD limit is sufficient. Causing vendor relations issue.', severity: 'HIGH', status: 'RESOLVED', sla_hours: 24, sla_breach_at: new Date(Date.now() - 10 * 86400000).toISOString(), assigned_team: 'Branch Operations', escalation_level: 1, created_at: new Date(Date.now() - 12 * 86400000).toISOString(), ticket_id: 'UCO-COMP-0038', resolved_at: new Date(Date.now() - 10 * 86400000).toISOString(), resolution: 'OD marking was incorrectly tagged. Corrected. Cheque reprocessed and cleared.' },
];

// ─── QUERIES ──────────────────────────────────────────────────────────────────
export const DEMO_QUERIES = [
  { id: 'q001', customer_id: 'c001', customer_name: 'Kumar Textiles Pvt Ltd', source_channel: 'EMAIL', raw_text: 'When will the ₹12 lakh cash credit limit be available after the renewal? I need it for raw material purchase by 15th July.', detected_intent: 'CC_RENEWAL_STATUS', urgency: 'HIGH', status: 'OPEN', routed_to: 'Credit Team', created_at: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: 'q002', customer_id: 'c003', customer_name: 'Sri Balaji Engineering Works', source_channel: 'PHONE', raw_text: 'My EMI of ₹45,000 was deducted twice this month from my account ending 1001. Please reverse the duplicate.', detected_intent: 'DUPLICATE_EMI_DEBIT', urgency: 'HIGH', status: 'IN_PROGRESS', routed_to: 'Loan Servicing', created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'q003', customer_id: 'c008', customer_name: 'Dr. Vijaya Lakshmi', source_channel: 'BRANCH', raw_text: 'How do I add my son as a joint holder to my savings account? He is an NRI.', detected_intent: 'JOINT_ACCOUNT_ADDITION', urgency: 'LOW', status: 'OPEN', routed_to: 'Branch Operations', created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'q004', customer_id: 'c006', customer_name: 'Meenakshi Traders', source_channel: 'WHATSAPP', raw_text: 'I want to apply for a small business loan. My shop turnover is around 18 lakhs per year. What documents are needed?', detected_intent: 'MUDRA_LOAN_INQUIRY', urgency: 'MEDIUM', status: 'OPEN', routed_to: 'MSME Lending', created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'q005', customer_id: 'c002', customer_name: 'Anita Sharma', source_channel: 'EMAIL', raw_text: 'My FD of Rs 10 lakh matured on 1st July. I have not received the maturity proceeds or renewal confirmation. Please check.', detected_intent: 'FD_MATURITY_QUERY', urgency: 'HIGH', status: 'RESOLVED', routed_to: 'Deposits Team', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), resolution: 'FD renewed for 444 days at 7.8% as per customer request. SMS and email sent.' },
];

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const DEMO_NOTIFICATIONS = [
  { id: 'n001', type: 'CHURN_ALERT', message: 'Anita Sharma — Churn risk jumped to 82%. FD maturity missed. Immediate action required.', priority: 'HIGH', created_at: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: 'n002', type: 'LEAD_HOT', message: 'Kumar Textiles lead score 87% — Documents collected. Ready for credit submission.', priority: 'HIGH', created_at: new Date(Date.now() - 2 * 3600000).toISOString(), read: false },
  { id: 'n003', type: 'SLA_BREACH', message: 'Complaint UCO-COMP-0012 (Kumar Textiles POS) — SLA breached by 5 days. Escalate immediately.', priority: 'CRITICAL', created_at: new Date(Date.now() - 30 * 60000).toISOString(), read: false },
  { id: 'n004', type: 'VISIT_DUE', message: 'Visit to Kumar Textiles Pvt Ltd in 1 hour. Review AI prep brief now.', priority: 'MEDIUM', created_at: new Date(Date.now() - 4 * 3600000).toISOString(), read: true },
  { id: 'n005', type: 'LEAD_CONVERTED', message: 'Rajesh Khanna & Sons — Trade Finance LC ₹1Cr converted successfully!', priority: 'LOW', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), read: true },
];

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
// export const DEMO_ANALYTICS = {
//   executive: {
//     kpis: {
//       relationship_value: { value: 108000000, trend: '+12.4%', comparison: 'vs last quarter' },
//       active_customers: { value: 312, trend: '+3.1%', comparison: 'vs last month' },
//       high_priority_opportunities: { value: 24, trend: '+8.2%', comparison: 'vs last week' },
//       conversion_rate: { value: 64.2, trend: '+2.1%', comparison: 'vs last month' },
//       business_mobilized: { value: 48000000, trend: '+18.5%', comparison: 'vs last quarter' },
//       customers_at_risk: { value: 18, trend: '-1.2%', comparison: 'vs last week' },
//     },
//     business_mobilization_trend: [
//       { date: 'Jan 26', mobilized: 5200000, target: 4000000 },
//       { date: 'Feb 26', mobilized: 6800000, target: 5000000 },
//       { date: 'Mar 26', mobilized: 9500000, target: 7000000 },
//       { date: 'Apr 26', mobilized: 8200000, target: 8000000 },
//       { date: 'May 26', mobilized: 11400000, target: 9000000 },
//       { date: 'Jun 26', mobilized: 13000000, target: 10000000 },
//       { date: 'Jul 26', mobilized: 48000000, target: 42000000 },
//     ],
//     lead_funnel: [
//       { stage: 'New', count: 28, value: 52000000 },
//       { stage: 'Contacted', count: 19, value: 38000000 },
//       { stage: 'In Progress', count: 12, value: 26000000 },
//       { stage: 'Proposal', count: 8, value: 18000000 },
//       { stage: 'Converted', count: 5, value: 11000000 },
//     ],
//     regional_performance: [
//       { region: 'Chennai Central', value: 43200000, rank: 1, customers: 145, leads: 38 },
//       { region: 'Coimbatore Main', value: 27000000, rank: 2, customers: 89, leads: 22 },
//       { region: 'Bengaluru Indiranagar', value: 21600000, rank: 3, customers: 67, leads: 18 },
//       { region: 'Hyderabad Gachibowli', value: 16200000, rank: 4, customers: 51, leads: 14 },
//     ],
//   },
// };
// ─── ANALYTICS (role/branch/region scoped) ────────────────────────────────────
export const BRANCH_REGION_MAP: Record<string, string> = {
  'Chennai Central': 'South',
  'Coimbatore Main': 'South',
  'Madurai North': 'South',
  'Bengaluru Indiranagar': 'West',
  'Hyderabad Gachibowli': 'West',
};

export function getExecutiveAnalytics(scope: { role?: string; branchId?: string | null; regionId?: string | null }) {
  const inScope = (c: typeof DEMO_CUSTOMERS[number]) => {
    if (scope.role === 'BRANCH_MANAGER') return c.branch_id === scope.branchId;
    // if (scope.role === 'REGIONAL_HEAD') return BRANCH_REGION_MAP[c.branch_id] === scope.regionId;
    if (scope.role === 'REGIONAL_MANAGER') return BRANCH_REGION_MAP[c.branch_id] === scope.regionId;
    return true; // HEAD_OFFICE = national
  };

  const customers = DEMO_CUSTOMERS.filter(inScope);
  const leads = DEMO_LEADS.filter(l => {
    const cust = DEMO_CUSTOMERS.find(c => c.id === l.customer_id);
    return cust ? inScope(cust) : false;
  });

  const relationship_value = customers.reduce((s, c) => s + c.relationship_value, 0);
  const active_customers = customers.filter(c => c.lifecycle_stage === 'ACTIVE').length;
  const customers_at_risk = customers.filter(c => c.churn_risk >= 60).length;
  const high_priority_opportunities = leads.filter(l => l.priority === 'HIGH').length;
  const converted = leads.filter(l => l.stage === 'Converted').length;
  const lost = leads.filter(l => l.stage === 'Lost').length;
  const conversion_rate = (converted + lost) ? Math.round((converted / (converted + lost)) * 1000) / 10 : 0;
  const business_mobilized = leads.filter(l => l.stage === 'Converted').reduce((s, l) => s + l.potential_value, 0);

  const nationalTotal = DEMO_CUSTOMERS.reduce((s, c) => s + c.relationship_value, 0);
  const scopeShare = nationalTotal ? relationship_value / nationalTotal : 1;
  const NATIONAL_TREND = [
    { date: 'Jan 26', mobilized: 5200000, target: 4000000 },
    { date: 'Feb 26', mobilized: 6800000, target: 5000000 },
    { date: 'Mar 26', mobilized: 9500000, target: 7000000 },
    { date: 'Apr 26', mobilized: 8200000, target: 8000000 },
    { date: 'May 26', mobilized: 11400000, target: 9000000 },
    { date: 'Jun 26', mobilized: 13000000, target: 10000000 },
    { date: 'Jul 26', mobilized: 48000000, target: 42000000 },
  ];
  const business_mobilization_trend = NATIONAL_TREND.map(p => ({
    date: p.date,
    mobilized: Math.round(p.mobilized * scopeShare),
    target: Math.round(p.target * scopeShare),
  }));

  const STAGES = ['New', 'Contacted', 'In Progress', 'Proposal', 'Converted'];
  const lead_funnel = STAGES.map(stage => {
    const inStage = leads.filter(l => l.stage === stage);
    return { stage, count: inStage.length, value: inStage.reduce((s, l) => s + l.potential_value, 0) };
  });

  const regional_performance = Object.entries(
    customers.reduce((acc: Record<string, { value: number; customers: number }>, c) => {
      acc[c.branch_id] = acc[c.branch_id] || { value: 0, customers: 0 };
      acc[c.branch_id].value += c.relationship_value;
      acc[c.branch_id].customers += 1;
      return acc;
    }, {})
  )
    .map(([region, v]) => ({
      region, value: v.value, customers: v.customers,
      leads: leads.filter(l => DEMO_CUSTOMERS.find(c => c.id === l.customer_id)?.branch_id === region).length,
    }))
    .sort((a, b) => b.value - a.value)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const last = business_mobilization_trend[business_mobilization_trend.length - 1];
  const vsTarget = last.target ? Math.round(((last.mobilized - last.target) / last.target) * 1000) / 10 : 0;

  return {
    kpis: {
      relationship_value: { value: relationship_value, trend: '+12.4%', comparison: 'vs last quarter' },
      active_customers: { value: active_customers, trend: '+3.1%', comparison: 'vs last month' },
      high_priority_opportunities: { value: high_priority_opportunities, trend: '+8.2%', comparison: 'vs last week' },
      conversion_rate: { value: conversion_rate, trend: '+2.1%', comparison: 'vs last month' },
      business_mobilized: { value: Math.round(business_mobilized), trend: '+18.5%', comparison: 'vs last quarter' },
      customers_at_risk: { value: customers_at_risk, trend: '-1.2%', comparison: 'vs last week' },
    },
    business_mobilization_trend,
    lead_funnel,
    regional_performance,
    vsTargetLabel: `${vsTarget >= 0 ? '+' : ''}${vsTarget}% vs Target`,
    atRiskCustomers: customers.filter(c => c.churn_risk >= 60).sort((a, b) => b.churn_risk - a.churn_risk).slice(0, 5),
  };
}

// ─── AUDIT EVENTS ─────────────────────────────────────────────────────────────
export const DEMO_AUDIT_EVENTS = [
  { id: 'ae001', actor_id: 'u002', actor_name: 'Priya Nair', action: 'LEAD_CREATED', entity_type: 'Lead', entity_id: 'l001', description: 'Created MSME Expansion Loan lead for Kumar Textiles — ₹2.5Cr', before: null, after: { stage: 'New', value: 25000000 }, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'ae002', actor_id: 'u001', actor_name: 'Arjun Rao', action: 'VISIT_CHECKED_IN', entity_type: 'Visit', entity_id: 'v004', description: 'Geo-verified check-in at Kumar Textiles (13.0827, 80.2707)', before: { status: 'SCHEDULED' }, after: { status: 'IN_PROGRESS', geo_verified: true }, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'ae003', actor_id: 'u002', actor_name: 'Priya Nair', action: 'LEAD_STAGE_CHANGED', entity_type: 'Lead', entity_id: 'l001', description: 'Lead stage moved from New → In Progress', before: { stage: 'New' }, after: { stage: 'In Progress' }, created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 'ae004', actor_id: 'u003', actor_name: 'Vikram Shah', action: 'MEETING_CREATED', entity_type: 'Meeting', entity_id: 'm002', description: 'Call meeting with Anita Sharma — FD maturity advisory', before: null, after: { purpose: 'FD Renewal Advisory', duration: 30 }, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'ae005', actor_id: 'u002', actor_name: 'Priya Nair', action: 'NBA_ACCEPTED', entity_type: 'Recommendation', entity_id: 'rec001', description: 'AI recommendation accepted — "Resolve POS complaint before loan discussion"', before: null, after: { status: 'ACCEPTED' }, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'ae006', actor_id: 'u004', actor_name: 'Meera Iyer', action: 'COMPLAINT_ESCALATED', entity_type: 'Complaint', entity_id: 'comp001', description: 'POS complaint escalated to Level 2 — SLA breach', before: { escalation_level: 1 }, after: { escalation_level: 2 }, created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'ae007', actor_id: 'u001', actor_name: 'Arjun Rao', action: 'VISIT_COMPLETED', entity_type: 'Visit', entity_id: 'v004', description: 'Visit completed — need assessment captured, lead created', before: { status: 'IN_PROGRESS' }, after: { status: 'COMPLETED', notes: 'Expansion loan confirmed' }, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'ae008', actor_id: 'u002', actor_name: 'Priya Nair', action: 'CUSTOMER_PROFILE_VIEWED', entity_type: 'Customer', entity_id: 'c001', description: 'Accessed full Customer 360 profile — Kumar Textiles', before: null, after: null, created_at: new Date(Date.now() - 30 * 60000).toISOString() },
];

// ─── AI RECOMMENDATIONS ────────────────────────────────────────────────────────
export const DEMO_RECOMMENDATIONS: Record<string, any[]> = {
  c001: [
    { id: 'r001', action: 'Resolve open POS complaint (UCO-COMP-0012) before MSME loan disbursement', category: 'Service Recovery', confidence: 94, priority: 'CRITICAL', rationale: 'Customer explicitly mentioned POS issue as blockers. Resolving it before disbursal will significantly improve trust and speed up loan closure.' },
    { id: 'r002', action: 'Offer Trade Finance LC facility — Customer has 3 new import clients', category: 'Cross-sell', confidence: 87, priority: 'HIGH', rationale: 'New distribution client additions signal trade finance need. CC utilization at 92% confirms working capital strain. LC can reduce cash cycle by 45 days.' },
    { id: 'r003', action: 'Enroll on UCO Vyapaar app — Enable GST invoice financing', category: 'Digital Engagement', confidence: 78, priority: 'MEDIUM', rationale: 'Digital score 84% — ready for GST-linked credit product. Invoice discounting can provide instant liquidity against outstanding invoices.' },
  ],
  c002: [
    { id: 'r004', action: 'Schedule service recovery call within 24 hours — High churn risk (82%)', category: 'Retention', confidence: 96, priority: 'CRITICAL', rationale: 'FD not renewed at maturity and ₹1.5Cr already moved to competitor. App complaint unresolved for 2 weeks. Immediate intervention required to prevent further outflow.' },
    { id: 'r005', action: 'Offer loyalty FD at 7.8% (444-day special scheme)', category: 'Retention Product', confidence: 72, priority: 'HIGH', rationale: 'Customer price-sensitive — competitor offered 7.8%. UCO can match with loyalty premium. Likely to retain ₹50L if matched.' },
  ],
  c004: [
    { id: 'r006', action: 'Fast-track WC limit enhancement from ₹50L to ₹1Cr — Documents ready', category: 'Upsell', confidence: 92, priority: 'HIGH', rationale: 'CC utilization hit 92% in peak season. 3 new clients confirmed. Clean 2-year repayment. Pre-approved candidate.' },
  ],
};

// ─── COPILOT Q&A SIMULATION ────────────────────────────────────────────────────
export const COPILOT_RESPONSES: Array<{keywords: string[], response: string, confidence: number, sources: string[]}> = [
  {
    keywords: ['churn', 'risk', 'at risk', 'losing customer'],
    response: 'Based on the portfolio analysis, **18 customers** are currently at elevated churn risk (score ≥75). The top 3 are: **Anita Sharma** (82% — FD maturity missed), **Lakshmi Precision Tools** (68% — dormant account), and **Sri Balaji Engineering Works** (25% — rising). Immediate action recommended on the top 2.',
    confidence: 91,
    sources: ['Churn Risk Engine v2', 'Interaction History', 'Account Telemetry'],
  },
  {
    keywords: ['next best action', 'nba', 'recommend', 'what should i do'],
    response: 'For your current priority queue: (1) **Kumar Textiles** — Escalate POS complaint today, then submit MSME loan appraisal. (2) **Anita Sharma** — Call within 24 hours, offer 7.8% loyalty FD rate. (3) **Rajesh Khanna** — Collect bank statement, initiate WC enhancement application.',
    confidence: 89,
    sources: ['Next Best Action Engine', 'Lead Pipeline', 'SLA Monitor'],
  },
  {
    keywords: ['lead', 'pipeline', 'opportunity', 'conversion'],
    response: 'Current pipeline: **10 active leads** with combined potential of **₹7.4Cr**. Conversion rate this quarter: **64.2%** (+2.1pp vs last month). Top conversion-ready leads: Rajesh Khanna (92% probability), Kumar Textiles MSME Loan (87%). 2 leads are at risk of going cold — Anita Sharma FD (32%) needs service recovery first.',
    confidence: 87,
    sources: ['Lead Scoring Engine', 'CRM Pipeline', 'Historical Conversion Data'],
  },
  {
    keywords: ['kumar', 'textiles', 'textile'],
    response: '**Kumar Textiles Pvt Ltd** (UCO2024001) — MSME, ₹2.5Cr relationship value, 4 years tenure. Churn risk: 18% (LOW). Lead propensity: 87% (HIGH). Active MSME expansion loan in progress (₹2.5Cr). **Immediate action:** Resolve POS complaint before loan disbursal. Next visit scheduled in 1 hour by Arjun Rao.',
    confidence: 95,
    sources: ['Customer 360 Profile', 'Visit Schedule', 'AI Recommendations'],
  },
  {
    keywords: ['anita', 'sharma', 'hni'],
    response: '**Anita Sharma** (UCO2024002) — HNI segment, ₹1.85Cr relationship value, 6 years tenure. **ALERT: Churn risk 82% (CRITICAL)**. FD of ₹1.5Cr partially moved to competitor at 7.8%. Open mobile app complaint (2 weeks). Vikram Shah has scheduled a call. Recommend: Match 7.8% loyalty rate + resolve app complaint urgently.',
    confidence: 93,
    sources: ['Customer 360 Profile', 'Risk Engine', 'Complaint Log'],
  },
  {
    keywords: ['msme', 'loan', 'small business', 'expansion'],
    response: 'UCO MSME Expansion products available: (1) **MSME Expansion Loan** — up to ₹5Cr, 9.5-10.5% p.a., LTV up to 80%. (2) **Working Capital CC** — up to ₹2Cr, 9.25% p.a. (3) **MUDRA Loans** — Tarun up to ₹10L at priority sector rates. Key eligibility: 2+ years in business, GST registered, clean CIBIL >700.',
    confidence: 82,
    sources: ['Product Catalogue', 'MSME Policy 2024', 'Rate Sheet July 2026'],
  },
  {
    keywords: ['digital', 'score', 'app', 'upi', 'net banking'],
    response: 'Portfolio digital engagement: Average score **58/100**. **High digital (>75):** Kumar Textiles (84), Rajesh Khanna (91), Dr. Vijaya Lakshmi (78). **Low digital (<30):** Anita Sharma (15), Lakshmi Precision Tools (22). Recommendation: Focus UPI QR and UCO Vyapaar onboarding for MSME segment. Prioritize Meenakshi Traders and Sri Balaji Engineering for next ZRT visit digital activation.',
    confidence: 79,
    sources: ['Digital Engagement Tracker', 'UPI Adoption Dashboard', 'Campaign Analytics'],
  },
  {
    keywords: ['analytics', 'performance', 'mobilization', 'target'],
    response: 'This quarter business mobilization: **₹4.8Cr** against target of **₹4.2Cr** (114% achievement). Top performing region: **Chennai Central** (₹4.32Cr, Rank 1). Lead conversion rate: 64.2%. ZRT visits completed: 82% of planned. SLA compliance: 71% (needs improvement — 3 critical breaches).',
    confidence: 88,
    sources: ['Analytics Engine', 'MIS Dashboard', 'Branch Performance Report'],
  },
];

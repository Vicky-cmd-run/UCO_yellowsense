import sys
import argparse
from datetime import datetime, timedelta
import bcrypt
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, Base, engine
from app.models.models import (
    User, Customer, CustomerProfile, Account, ProductHolding,
    Interaction, Visit, NeedAssessment, Lead, Opportunity,
    Meeting, Complaint, Query, Consent, AIRecommendation, AuditEvent
)

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def seed_db(db: Session):
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Seeding database...")
    
    # 1. Create Demo Users
    users_data = [
        {"name": "Arjun Rao", "employee_id": "ZRT001", "email": "arjun.rao@yellowsensebank.com", "role": "ZRT_OFFICER", "branch_id": "Chennai Central", "region_id": "Chennai"},
        {"name": "Priya Nair", "employee_id": "RM001", "email": "priya.nair@yellowsensebank.com", "role": "RM", "branch_id": "Chennai Central", "region_id": "Chennai"},
        {"name": "Vikram Shah", "employee_id": "VRM001", "email": "vikram.shah@yellowsensebank.com", "role": "VRM", "branch_id": "Virtual Desk", "region_id": "National"},
        {"name": "Meera Iyer", "employee_id": "BM001", "email": "meera.iyer@yellowsensebank.com", "role": "BRANCH_MANAGER", "branch_id": "Chennai Central", "region_id": "Chennai"},
        {"name": "Rahul Menon", "employee_id": "RH001", "email": "rahul.menon@yellowsensebank.com", "role": "REGIONAL_MANAGER", "branch_id": "Regional HQ", "region_id": "South"},
        {"name": "Ananya Kapoor", "employee_id": "HO001", "email": "ananya.kapoor@yellowsensebank.com", "role": "HEAD_OFFICE", "branch_id": "Head Office", "region_id": "National"},
        {"name": "Admin User", "employee_id": "ADM001", "email": "admin@yellowsensebank.com", "role": "ADMIN", "branch_id": "IT Support", "region_id": "National"}
    ]
    
    users = []
    hashed_pwd = get_password_hash("password123")
    for u in users_data:
        user = db.query(User).filter(User.employee_id == u["employee_id"]).first()
        if not user:
            user = User(
                name=u["name"],
                employee_id=u["employee_id"],
                email=u["email"],
                role=u["role"],
                branch_id=u["branch_id"],
                region_id=u["region_id"],
                hashed_password=hashed_pwd,
                status="ACTIVE"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        users.append(user)
        
    arjun = next(u for u in users if u.employee_id == "ZRT001")
    priya = next(u for u in users if u.employee_id == "RM001")
    vikram = next(u for u in users if u.employee_id == "VRM001")
    meera = next(u for u in users if u.employee_id == "BM001")
    
    # 2. Create Showcase Customers
    # Customer A: Kumar Textiles Pvt Ltd
    cust_a = Customer(
        customer_number = "CUST1001",
        full_name = "Kumar Textiles Pvt Ltd",
        customer_type = "CORPORATE",
        segment = "MSME",
        lifecycle_stage = "ACTIVE",
        mobile = "9840123456",
        email = "contact@kumartextiles.com",
        city = "Chennai",
        state = "Tamil Nadu",
        branch_id = "Chennai Central",
        assigned_rm_id = priya.id,
        assigned_vrm_id = None,
        relationship_value = 4800000.0, # ₹48 lakh
        relationship_tenure_months = 60,
        digital_engagement_score = 65,
        sentiment = "NEUTRAL",
        churn_risk = 24,
        lead_propensity = 84
    )
    db.add(cust_a)
    
    # Customer B: Anita Sharma
    cust_b = Customer(
        customer_number = "CUST1002",
        full_name = "Anita Sharma",
        customer_type = "INDIVIDUAL",
        segment = "PREMIUM",
        lifecycle_stage = "ACTIVE",
        mobile = "9884123456",
        email = "anita.sharma@gmail.com",
        city = "Chennai",
        state = "Tamil Nadu",
        branch_id = "Chennai Central",
        assigned_rm_id = priya.id,
        assigned_vrm_id = None,
        relationship_value = 3200000.0, # ₹32 lakh
        relationship_tenure_months = 36,
        digital_engagement_score = 40,
        sentiment = "NEGATIVE",
        churn_risk = 82,
        lead_propensity = 15
    )
    db.add(cust_b)
    
    # Customer C: ABC Manufacturing
    cust_c = Customer(
        customer_number = "CUST1003",
        full_name = "ABC Manufacturing",
        customer_type = "CORPORATE",
        segment = "MSME",
        lifecycle_stage = "PROSPECT",
        mobile = "9176123456",
        email = "operations@abcmfg.in",
        city = "Coimbatore",
        state = "Tamil Nadu",
        branch_id = "Coimbatore Main",
        assigned_rm_id = priya.id,
        assigned_vrm_id = None,
        relationship_value = 0.0,
        relationship_tenure_months = 1,
        digital_engagement_score = 20,
        sentiment = "POSITIVE",
        churn_risk = 10,
        lead_propensity = 90
    )
    db.add(cust_c)
    
    # Create 27 additional customers to meet the "at least 30 customers" requirement
    cities_regions = [
        ("Chennai", "Tamil Nadu", "Chennai Central"),
        ("Coimbatore", "Tamil Nadu", "Coimbatore Main"),
        ("Bengaluru", "Karnataka", "Indiranagar Branch"),
        ("Hyderabad", "Telangana", "Gachibowli Branch"),
        ("Mumbai", "Maharashtra", "Nariman Point Branch"),
        ("Pune", "Maharashtra", "Koregaon Park Branch")
    ]
    
    segments = ["RETAIL", "PREMIUM", "MSME", "EMERGING"]
    lifecycle_stages = ["PROSPECT", "ONBOARDED", "ACTIVE", "DORMANT"]
    sentiments = ["POSITIVE", "NEUTRAL", "NEGATIVE"]
    
    other_customers = []
    for i in range(4, 31):
        city, state, branch = cities_regions[i % len(cities_regions)]
        seg = segments[i % len(segments)]
        stage = lifecycle_stages[i % len(lifecycle_stages)]
        sent = sentiments[i % len(sentiments)]
        cust_type = "INDIVIDUAL" if seg in ["RETAIL", "PREMIUM"] else "CORPORATE"
        
        assigned_rm = priya.id if i % 2 == 0 else None
        assigned_vrm = vrm_user_id = vikram.id if i % 2 != 0 else None
        
        # Dormant & Churned parameters
        risk = 85 if stage == "DORMANT" else (70 if sent == "NEGATIVE" else 15)
        prop = 80 if stage in ["PROSPECT", "ONBOARDED"] else 40
        val = 150000.0 * (i % 8) if stage != "PROSPECT" else 0.0
        
        cust = Customer(
            customer_number = f"CUST{1000+i}",
            full_name = f"Showcase Customer {i}" if cust_type == "INDIVIDUAL" else f"Enterprise Client {i} Pvt Ltd",
            customer_type = cust_type,
            segment = seg,
            lifecycle_stage = stage,
            mobile = f"9940{100000+i}",
            email = f"customer{i}@example.com" if cust_type == "INDIVIDUAL" else f"info@company{i}.com",
            city = city,
            state = state,
            branch_id = branch,
            assigned_rm_id = assigned_rm,
            assigned_vrm_id = assigned_vrm,
            relationship_value = val,
            relationship_tenure_months = i * 2,
            digital_engagement_score = 30 + (i * 2) % 60,
            sentiment = sent,
            churn_risk = risk,
            lead_propensity = prop
        )
        db.add(cust)
        other_customers.append(cust)
        
    db.commit()
    
    # Refresh all customers
    db.refresh(cust_a)
    db.refresh(cust_b)
    db.refresh(cust_c)
    for c in other_customers:
        db.refresh(c)
        
    all_customers = [cust_a, cust_b, cust_c] + other_customers
    
    # 3. Create Customer Profiles
    # Profile A: Kumar Textiles
    prof_a = CustomerProfile(
        customer_id = cust_a.id,
        demographics = "Textile manufacturing industry based in Chennai export zone.",
        occupation = "Business Owner",
        business_type = "Manufacturing / Textiles",
        annual_income = 4800000.0,
        annual_turnover = 32000000.0, # 3.2 Cr
        employee_count = 45,
        preferred_language = "Tamil",
        preferred_channel = "WHATSAPP"
    )
    db.add(prof_a)
    
    # Profile B: Anita Sharma
    prof_b = CustomerProfile(
        customer_id = cust_b.id,
        demographics = "Resident Premium Customer, Salaried IT professional.",
        occupation = "Senior Director, IT Services",
        business_type = "Service sector",
        annual_income = 3500000.0,
        annual_turnover = 0.0,
        employee_count = 0,
        preferred_language = "English",
        preferred_channel = "EMAIL"
    )
    db.add(prof_b)
    
    # Profile C: ABC Manufacturing
    prof_c = CustomerProfile(
        customer_id = cust_c.id,
        demographics = "Precision machine components manufacturer in Coimbatore.",
        occupation = "Industrialist",
        business_type = "Precision Engineering",
        annual_income = 7200000.0,
        annual_turnover = 58000000.0,
        employee_count = 60,
        preferred_language = "Tamil",
        preferred_channel = "CALL"
    )
    db.add(prof_c)
    
    # Profiles for the rest
    for i, c in enumerate(other_customers):
        prof = CustomerProfile(
            customer_id = c.id,
            demographics = f"Seeded Demographics info for {c.full_name}.",
            occupation = "Professional" if c.customer_type == "INDIVIDUAL" else "Director",
            business_type = "Retail Trading" if c.customer_type == "CORPORATE" else None,
            annual_income = 600000.0 + (i * 100000) % 5000000,
            annual_turnover = 2000000.0 + (i * 500000) % 15000000 if c.customer_type == "CORPORATE" else 0.0,
            employee_count = i * 2 if c.customer_type == "CORPORATE" else 0,
            preferred_language = "English" if i % 2 == 0 else "Hindi",
            preferred_channel = "EMAIL" if i % 3 == 0 else "SMS"
        )
        db.add(prof)
    
    # 4. Create Accounts (at least 50 accounts total)
    accounts = []
    
    # Accounts for Kumar Textiles
    act_a1 = Account(customer_id=cust_a.id, account_number_masked="XXXXXX9876", account_type="Current", balance=1850000.0, status="ACTIVE")
    act_a2 = Account(customer_id=cust_a.id, account_number_masked="XXXXXX4321", account_type="Loan", balance=-2400000.0, status="ACTIVE")
    db.add(act_a1)
    db.add(act_a2)
    accounts.extend([act_a1, act_a2])
    
    # Accounts for Anita Sharma
    act_b1 = Account(customer_id=cust_b.id, account_number_masked="XXXXXX5566", account_type="Savings", balance=3200000.0, status="ACTIVE")
    act_b2 = Account(customer_id=cust_b.id, account_number_masked="XXXXXX7788", account_type="FD", balance=1500000.0, status="ACTIVE")
    db.add(act_b1)
    db.add(act_b2)
    accounts.extend([act_b1, act_b2])
    
    # Generate remaining accounts across the other customers
    # Generate remaining accounts across the other customers
    act_idx = 1000
    for i, c in enumerate(all_customers):
        if c.id in [cust_a.id, cust_b.id]:
            continue
        # Add a primary account for everyone
        act_type = "Current" if c.customer_type == "CORPORATE" else "Savings"
        bal = float((i * 12345) % 1000000)
        act = Account(
            customer_id=c.id,
            account_number_masked=f"XXXXXX{act_idx}",
            account_type=act_type,
            balance=bal,
            status="ACTIVE"
        )
        db.add(act)
        accounts.append(act)
        act_idx += 1
        
        # Add secondary Loan or FD accounts
        if c.lifecycle_stage in ["ACTIVE", "ONBOARDED", "DORMANT"]:
            act2_type = "FD" if i % 2 == 0 else "Loan"
            bal2 = 150000.0 * (i % 6 + 1) if act2_type == "FD" else -120000.0 * (i % 4 + 1)
            act2 = Account(
                customer_id=c.id,
                account_number_masked=f"XXXXXX{act_idx}",
                account_type=act2_type,
                balance=bal2,
                status="ACTIVE"
            )
            db.add(act2)
            accounts.append(act2)
            act_idx += 1
            
    db.commit()
    
    # 5. Create Product Holdings (at least 40 product holdings total)
    holdings = []
    # Holdings for Kumar Textiles
    h1 = ProductHolding(customer_id=cust_a.id, product_type="Deposit", product_name="Current Account", status="ACTIVE", value=1850000.0)
    h2 = ProductHolding(customer_id=cust_a.id, product_type="Merchant", product_name="POS Merchant Terminal", status="ACTIVE", value=150000.0)
    h3 = ProductHolding(customer_id=cust_a.id, product_type="Loan", product_name="Working Capital Cash Credit", status="ACTIVE", value=2400000.0)
    db.add(h1)
    db.add(h2)
    db.add(h3)
    holdings.extend([h1, h2, h3])
    
    # Holdings for Anita Sharma
    h4 = ProductHolding(customer_id=cust_b.id, product_type="Deposit", product_name="Privilege Savings Account", status="ACTIVE", value=3200000.0)
    h5 = ProductHolding(customer_id=cust_b.id, product_type="Deposit", product_name="Fixed Deposit", status="ACTIVE", value=1500000.0)
    db.add(h4)
    db.add(h5)
    holdings.extend([h4, h5])
    
    # Holdings for others
    for i, c in enumerate(all_customers):
        if c.id in [cust_a.id, cust_b.id]:
            continue
        p_name = "Business Current Account" if c.customer_type == "CORPORATE" else "Regular Savings"
        h = ProductHolding(
            customer_id=c.id,
            product_type="Deposit",
            product_name=p_name,
            status="ACTIVE",
            value=float((i * 45000) % 800000)
        )
        db.add(h)
        holdings.append(h)
        
        # Add another product for some to hit 40 holdings
        if c.lifecycle_stage == "ACTIVE" or c.segment == "PREMIUM":
            p2_name = "Credit Card" if i % 2 == 0 else "Insurance Policy"
            p2_type = "Card" if i % 2 == 0 else "Insurance"
            h2 = ProductHolding(
                customer_id=c.id,
                product_type=p2_type,
                product_name=p2_name,
                status="ACTIVE",
                value=float((i * 15000) % 200000)
            )
            db.add(h2)
            holdings.append(h2)
            
    db.commit()
    
    # 6. Create Interactions (at least 60 interactions total)
    interactions = []
    
    # Showcase Customer A interactions
    int_a1 = Interaction(
        customer_id=cust_a.id, channel="VISIT", interaction_type="Service", direction="OUTBOUND",
        summary="ZRT Field Visit by Arjun Rao. Captured turnover growth of 31% and requirement for warehouse expansion.",
        sentiment="POSITIVE", employee_id=arjun.id
    )
    int_a2 = Interaction(
        customer_id=cust_a.id, channel="PHONE", interaction_type="Complaint", direction="INBOUND",
        summary="Client complained about POS Merchant Terminal transaction failures. Escalated to POS support team.",
        sentiment="NEGATIVE", employee_id=priya.id
    )
    db.add(int_a1)
    db.add(int_a2)
    interactions.extend([int_a1, int_a2])
    
    # Showcase Customer B interactions
    int_b1 = Interaction(
        customer_id=cust_b.id, channel="EMAIL", interaction_type="Feedback", direction="INBOUND",
        summary="Customer expressed dissatisfaction regarding delayed service request resolution. Balance down trend noted.",
        sentiment="NEGATIVE", employee_id=priya.id
    )
    db.add(int_b1)
    interactions.append(int_b1)
    
    # Rest of the interactions
    for i in range(60 - len(interactions)):
        c = all_customers[i % len(all_customers)]
        channels = ["PHONE", "EMAIL", "VISIT", "BRANCH"]
        int_types = ["Service", "Sales", "Complaint", "Feedback"]
        dirs = ["INBOUND", "OUTBOUND"]
        sents = ["POSITIVE", "NEUTRAL", "NEGATIVE"]
        
        chan = channels[i % len(channels)]
        it_type = int_types[i % len(int_types)]
        di = dirs[i % len(dirs)]
        se = sents[i % len(sents)]
        
        summary_text = f"Routine {it_type} communication over {chan} regarding banking inquiries."
        if it_type == "Complaint":
            summary_text = f"Customer registered a query about charges or service delay. Sentiment {se}."
            
        int_item = Interaction(
            customer_id=c.id,
            channel=chan,
            interaction_type=it_type,
            direction=di,
            summary=summary_text,
            sentiment=se,
            employee_id=priya.id if i % 2 == 0 else arjun.id
        )
        db.add(int_item)
        interactions.append(int_item)
        
    db.commit()
    
    # 7. Create Visits & NeedAssessments (at least 25 visits total)
    visits = []
    
    # Completed ZRT Visit for Kumar Textiles (Golden Journey 1 target)
    visit_a = Visit(
        customer_id=cust_a.id, zrt_officer_id=arjun.id, purpose="Business Assessment & Mobilization",
        scheduled_at=datetime.utcnow() - timedelta(days=2),
        check_in_at=datetime.utcnow() - timedelta(days=2, hours=4),
        check_out_at=datetime.utcnow() - timedelta(days=2, hours=3),
        latitude=13.0827, longitude=80.2707, geo_verified=True,
        notes="Customer confirmed turnover expansion by 31%. Explicitly requested a working capital facility of ₹25L. Complained about POS card terminal hanging during peak sales hours.",
        status="COMPLETED", sync_status="SYNCED"
    )
    db.add(visit_a)
    visits.append(visit_a)
    db.commit()
    db.refresh(visit_a)
    
    need_a = NeedAssessment(
        visit_id=visit_a.id, working_capital_need=True, term_loan_need=True, pos_qr_need=True,
        salary_account_need=False, insurance_need=False,
        notes="Urgent POS machine swap needed. Capital required for new warehouse construction near Chennai bypass."
    )
    db.add(need_a)
    
    # Pending Scheduled Visit for ABC Manufacturing
    visit_c = Visit(
        customer_id=cust_c.id, zrt_officer_id=arjun.id, purpose="Prospect Meeting - Needs Analysis",
        scheduled_at=datetime.utcnow() + timedelta(days=1),
        status="SCHEDULED", sync_status="SYNCED"
    )
    db.add(visit_c)
    visits.append(visit_c)
    
    # Generate the remaining visits (at least 25 total)
    for i in range(25 - len(visits)):
        c = all_customers[(i + 5) % len(all_customers)]
        is_past = i % 2 == 0
        status = "COMPLETED" if is_past else "SCHEDULED"
        
        sched_time = datetime.utcnow() - timedelta(days=i+3) if is_past else datetime.utcnow() + timedelta(days=i+2)
        ci_time = sched_time - timedelta(minutes=15) if is_past else None
        co_time = sched_time + timedelta(minutes=45) if is_past else None
        
        v = Visit(
            customer_id=c.id,
            zrt_officer_id=arjun.id,
            purpose=f"Relationship check-up visit {i}",
            scheduled_at=sched_time,
            check_in_at=ci_time,
            check_out_at=co_time,
            latitude=13.0827 + (i * 0.005),
            longitude=80.2707 - (i * 0.005),
            geo_verified=is_past,
            notes=f"Routine field force check-in details for visit number {i}." if is_past else None,
            status=status,
            sync_status="SYNCED"
        )
        db.add(v)
        visits.append(v)
        
    db.commit()
    
    # Generate need assessments for completed visits
    for v in visits:
        if v.status == "COMPLETED" and v.id != visit_a.id:
            db.refresh(v)
            nas = NeedAssessment(
                visit_id=v.id,
                working_capital_need=hash(v.id) % 2 == 0,
                term_loan_need=hash(v.id) % 3 == 0,
                pos_qr_need=hash(v.id) % 4 == 0,
                salary_account_need=False,
                insurance_need=True,
                notes="Seeded automatic need assessment details."
            )
            db.add(nas)
    db.commit()
    
    # 8. Create Leads & Opportunities (at least 35 leads total)
    leads = []
    
    # Initial Lead for Kumar Textiles (will appear in RM priority queue)
    lead_a = Lead(
        customer_id=cust_a.id, source="ZRT", product="MSME Expansion Finance",
        potential_value=2500000.0, # ₹25L
        stage="New", owner_id=priya.id, conversion_probability=87.0, priority="HIGH",
        next_action="Call before 11:30 AM", next_action_due_at=datetime.utcnow() + timedelta(hours=4)
    )
    db.add(lead_a)
    leads.append(lead_a)
    
    # Remaining leads (at least 35 total)
    stages = ["New", "Contacted", "Qualified", "Documents Pending", "Application", "Approved", "Converted", "Lost"]
    for i in range(35 - len(leads)):
        c = all_customers[(i + 3) % len(all_customers)]
        stage = stages[i % len(stages)]
        
        l = Lead(
            customer_id=c.id,
            source="AI" if i % 2 == 0 else "RM",
            product="Working Capital Loan" if i % 3 == 0 else ("POS Merchant Terminal" if i % 3 == 1 else "Salary Accounts"),
            potential_value=500000.0 * (i % 6 + 1),
            stage=stage,
            owner_id=priya.id if i % 2 == 0 else vikram.id,
            conversion_probability=30.0 + (i * 7) % 65,
            priority="HIGH" if i % 3 == 0 else "MEDIUM",
            next_action=f"Follow up lead task {i}",
            next_action_due_at=datetime.utcnow() + timedelta(days=1)
        )
        db.add(l)
        leads.append(l)
        
    db.commit()
    
    # Refresh leads and create opportunities (at least 15 opportunities)
    opp_count = 0
    for l in leads:
        db.refresh(l)
        if l.stage not in ["New", "Lost"] and opp_count < 15:
            opp = Opportunity(
                lead_id=l.id,
                expected_value=l.potential_value,
                expected_close_date=datetime.utcnow() + timedelta(days=30),
                stage="ProposalSent" if l.stage == "Application" else "Qualification",
                probability=l.conversion_probability
            )
            db.add(opp)
            opp_count += 1
            
    db.commit()
    
    # 9. Create Meetings (at least 20 meetings total)
    meetings = []
    # Seed transcripts for a couple of meetings
    meeting_t1 = Meeting(
        customer_id=cust_a.id, employee_id=priya.id, purpose="MSME Loan Discussion",
        scheduled_at=datetime.utcnow() - timedelta(days=1),
        transcript="RM Priya Nair met Mr. Kumar to discuss the warehouse expansion. Mr. Kumar expressed an urgent requirement for ₹25L funding to complete warehouse construction. He also mentioned that interest rates should be competitive. Priya assured him of fast-tracked processing but asked him to resolve the pending merchant POS complaint first. Action items: Priya to send interest rate structure, customer to submit GST returns.",
        summary="Warehouse expansion discussion. Customer requires ₹25L. Raised concerns on interest rates and processing time.",
        sentiment="POSITIVE",
        action_items="1. Send interest eligibility details\n2. Collect GST statements\n3. Coordinate POS card machine replacement",
        follow_up_date=datetime.utcnow() + timedelta(days=3)
    )
    db.add(meeting_t1)
    meetings.append(meeting_t1)
    
    # General Meetings
    for i in range(20 - len(meetings)):
        c = all_customers[(i + 4) % len(all_customers)]
        m = Meeting(
            customer_id=c.id,
            employee_id=priya.id if i % 2 == 0 else vikram.id,
            purpose=f"Relationship Review Meeting {i}",
            scheduled_at=datetime.utcnow() - timedelta(days=i+2),
            transcript=f"Meeting held with client {c.full_name} to review their current product portfolio. Discussed general savings balances and potential new products. Customer sentiment neutral.",
            summary=f"Regular check-in meeting {i}.",
            sentiment="NEUTRAL"
        )
        db.add(m)
        meetings.append(m)
        
    db.commit()
    
    # 10. Create Complaints (at least 18 complaints total)
    complaints = []
    
    # Active Complaint for Kumar Textiles (Golden Journey 1 target)
    comp_a = Complaint(
        customer_id=cust_a.id, category="POS", severity="HIGH", status="OPEN",
        assigned_team="Merchant Acquiring Service Desk", sla_due_at=datetime.utcnow() + timedelta(days=1),
        sentiment="NEGATIVE", escalation_level=0
    )
    db.add(comp_a)
    complaints.append(comp_a)
    
    # Active Complaints for Anita Sharma (Golden Journey 2 targets)
    comp_b1 = Complaint(
        customer_id=cust_b.id, category="Account", severity="CRITICAL", status="OPEN",
        assigned_team="Privilege Banking Support Desk", sla_due_at=datetime.utcnow() + timedelta(hours=12),
        sentiment="NEGATIVE", escalation_level=1
    )
    comp_b2 = Complaint(
        customer_id=cust_b.id, category="Charges", severity="MEDIUM", status="OPEN",
        assigned_team="Retail Branch Operations", sla_due_at=datetime.utcnow() + timedelta(days=2),
        sentiment="NEGATIVE", escalation_level=0
    )
    db.add(comp_b1)
    db.add(comp_b2)
    complaints.extend([comp_b1, comp_b2])
    
    # Generate remaining complaints (at least 18 total)
    cats = ["POS", "Loan", "Account", "Digital", "Charges"]
    sevs = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    stats = ["OPEN", "RESOLVED", "ESCALATED"]
    
    for i in range(18 - len(complaints)):
        c = all_customers[(i + 6) % len(all_customers)]
        cat = cats[i % len(cats)]
        sev = sevs[i % len(sevs)]
        stat = stats[i % len(stats)]
        
        comp = Complaint(
            customer_id=c.id,
            category=cat,
            severity=sev,
            status=stat,
            assigned_team="Customer Relations Department" if stat == "ESCALATED" else "Standard Banking Support",
            sla_due_at=datetime.utcnow() - timedelta(days=1) if stat == "RESOLVED" else datetime.utcnow() + timedelta(days=3),
            sentiment="NEGATIVE",
            escalation_level=1 if stat == "ESCALATED" else 0
        )
        db.add(comp)
        complaints.append(comp)
        
    db.commit()
    
    # 11. Create Queries (at least 20 queries total)
    queries = []
    
    # Showcases
    q1 = Query(
        customer_id=cust_a.id, source_channel="EMAIL",
        raw_text="Hello, we are experiencing transaction failures on our card reader. It is urgent since it affects our MSME showroom billing.",
        detected_intent="Merchant Card Terminal Issue", urgency="HIGH", routed_team="POS Support", status="ROUTED"
    )
    q2 = Query(
        customer_id=cust_b.id, source_channel="WEB",
        raw_text="My EMI was deducted twice from my savings account on July 1st, and nobody has resolved my complaint yet.",
        detected_intent="Loan EMI Issue", urgency="HIGH", routed_team="Loan Servicing", status="ROUTED"
    )
    db.add(q1)
    db.add(q2)
    queries.extend([q1, q2])
    
    for i in range(20 - len(queries)):
        c = all_customers[(i + 7) % len(all_customers)]
        raws = [
            "What are the latest fixed deposit interest rates?",
            "How do I link my PAN card with my savings account?",
            "I want to apply for a corporate credit card for my manufacturing firm.",
            "Can I change my registered email address online?"
        ]
        intents = ["FD Inquiry", "KYC Update", "Credit Card Application", "Profile Update"]
        
        q = Query(
            customer_id=c.id,
            source_channel="SMS" if i % 2 == 0 else "APP",
            raw_text=raws[i % len(raws)],
            detected_intent=intents[i % len(intents)],
            urgency="LOW" if i % 3 != 0 else "MEDIUM",
            routed_team="Retail Branch Front Desk" if i % 2 == 0 else "Digital Operations",
            status="NEW"
        )
        db.add(q)
        queries.append(q)
        
    db.commit()
    
    # 12. Create Consents
    for c in all_customers:
        channels = ["EMAIL", "SMS", "WHATSAPP", "CALL"]
        for chan in channels:
            con = Consent(
                customer_id=c.id,
                channel=chan,
                purpose="Marketing pitches and product updates",
                granted=True if chan != "CALL" else (c.customer_type == "CORPORATE"),
                captured_at=datetime.utcnow() - timedelta(days=180)
            )
            db.add(con)
    db.commit()
    
    # 13. Create AI Recommendations (at least 40 AI recommendations total)
    recommendations = []
    
    # Recommendation for Kumar Textiles
    rec_a = AIRecommendation(
        customer_id=cust_a.id, recommendation_type="NBA",
        recommendation="Resolve open POS complaint, then schedule expansion finance consultation within 48 hours.",
        confidence=87.0,
        reason_codes='["EXPLICIT_EXPANSION_NEED", "DOCUMENTS_AVAILABLE", "UNRESOLVED_SERVICE_ISSUE"]',
        model_name="poc-lead-score", model_version="1.0",
        employee_decision=None
    )
    db.add(rec_a)
    recommendations.append(rec_a)
    
    # Recommendation for Anita Sharma
    rec_b = AIRecommendation(
        customer_id=cust_b.id, recommendation_type="NBA",
        recommendation="Prioritize service recovery before any cross-sell discussion.",
        confidence=92.0,
        reason_codes='["BALANCE_DROPPED_65", "SALARY_STOPPED", "UNRESOLVED_COMPLAINTS", "NO_RM_INTERACTION_76_DAYS"]',
        model_name="poc-churn-risk", model_version="2.4",
        employee_decision=None
    )
    db.add(rec_b)
    recommendations.append(rec_b)
    
    # Propensity & Churn alerts for other customers (to meet 40 recommendations requirement)
    for i in range(40 - len(recommendations)):
        c = all_customers[i % len(all_customers)]
        r_type = "PRODUCT_PROPENSITY" if i % 2 == 0 else "CHURN_RISK"
        rec_text = "Recommend Working Capital Loan product." if r_type == "PRODUCT_PROPENSITY" else "Initiate proactive service recovery outreach call."
        codes = '["RECURRING_TRANSACTIONS", "NO_ACTIVE_LOAN"]' if r_type == "PRODUCT_PROPENSITY" else '["COMPLAINT_SLA_BREACH", "LOW_ENGAGEMENT"]'
        
        rec = AIRecommendation(
            customer_id=c.id,
            recommendation_type=r_type,
            recommendation=rec_text,
            confidence=60.0 + (i * 4) % 35,
            reason_codes=codes,
            model_name="poc-propensity-engine" if r_type == "PRODUCT_PROPENSITY" else "poc-churn-alert",
            model_version="1.2",
            employee_decision="ACCEPTED" if i % 3 == 0 else None,
            decision_at=datetime.utcnow() - timedelta(days=1) if i % 3 == 0 else None
        )
        db.add(rec)
        recommendations.append(rec)
        
    db.commit()
    
    # 14. Create Audit Events (at least 100 audit events total)
    audit_events = []
    
    # Showcases
    ae1 = AuditEvent(actor_id="system", action="NBA_GENERATED", entity_type="Customer", entity_id=cust_a.id, before_state=None, after_state="AI next best action recommendation generated for Kumar Textiles Pvt Ltd.")
    ae2 = AuditEvent(actor_id="system", action="NBA_GENERATED", entity_type="Customer", entity_id=cust_b.id, before_state=None, after_state="AI next best action recommendation generated for Anita Sharma.")
    db.add(ae1)
    db.add(ae2)
    audit_events.extend([ae1, ae2])
    
    for i in range(100 - len(audit_events)):
        c = all_customers[i % len(all_customers)]
        actions = ["CUSTOMER_UPDATED", "VISIT_SCHEDULED", "LEAD_CREATED", "RECOMMENDATION_DISMISSED"]
        act = actions[i % len(actions)]
        
        ae = AuditEvent(
            actor_id=priya.employee_id if i % 2 == 0 else "system",
            action=act,
            entity_type="Customer",
            entity_id=c.id,
            before_state='{"status": "OLD_STATE"}',
            after_state=f'{{"status": "{act}_COMPLETED"}}',
            timestamp=datetime.utcnow() - timedelta(hours=i)
        )
        db.add(ae)
        audit_events.append(ae)
        
    db.commit()
    
    print(f"Seeding completed successfully! Counts: Users={len(users)}, Customers={len(all_customers)}, Accounts={len(accounts)}, ProductHoldings={len(holdings)}, Interactions={len(interactions)}, Visits={len(visits)}, Leads={len(leads)}, Meetings={len(meetings)}, Complaints={len(complaints)}, Queries={len(queries)}, AIRecommendations={len(recommendations)}, AuditEvents={len(audit_events)}")

def seed_db_if_empty():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            seed_db(db)
        else:
            print("Database already contains data, skipping automatic seeding.")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed YellowSense Database")
    parser.add_argument("--reset", action="store_true", help="Reset all tables before seeding")
    args = parser.parse_args()
    
    db_session = SessionLocal()
    try:
        if args.reset:
            print("Resetting database tables...")
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
        seed_db(db_session)
    finally:
        db_session.close()

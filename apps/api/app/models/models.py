import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)  # ZRT_OFFICER, RM, VRM, BRANCH_MANAGER, REGIONAL_MANAGER, HEAD_OFFICE, ADMIN
    branch_id = Column(String(50), nullable=True)
    region_id = Column(String(50), nullable=True)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, INACTIVE
    
    # Relationships
    assigned_customers_rm = relationship("Customer", foreign_keys="[Customer.assigned_rm_id]", back_populates="assigned_rm")
    assigned_customers_vrm = relationship("Customer", foreign_keys="[Customer.assigned_vrm_id]", back_populates="assigned_vrm")

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_number = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    customer_type = Column(String(20), nullable=False)  # INDIVIDUAL, CORPORATE
    segment = Column(String(50), nullable=False)  # RETAIL, PREMIUM, MSME, EMERGING
    lifecycle_stage = Column(String(50), nullable=False)  # PROSPECT, ONBOARDED, ACTIVE, CHURNED, DORMANT
    mobile = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    branch_id = Column(String(50), nullable=False)
    
    assigned_rm_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    assigned_vrm_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    relationship_value = Column(Float, default=0.0)  # Total in INR
    relationship_tenure_months = Column(Integer, default=0)
    digital_engagement_score = Column(Integer, default=0)  # 0-100
    sentiment = Column(String(20), default="NEUTRAL")  # POSITIVE, NEUTRAL, NEGATIVE
    churn_risk = Column(Integer, default=0)  # 0-100
    lead_propensity = Column(Integer, default=0)  # 0-100
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assigned_rm = relationship("User", foreign_keys=[assigned_rm_id], back_populates="assigned_customers_rm")
    assigned_vrm = relationship("User", foreign_keys=[assigned_vrm_id], back_populates="assigned_customers_vrm")
    profile = relationship("CustomerProfile", back_populates="customer", uselist=False)
    accounts = relationship("Account", back_populates="customer")
    product_holdings = relationship("ProductHolding", back_populates="customer")
    interactions = relationship("Interaction", back_populates="customer")
    visits = relationship("Visit", back_populates="customer")
    leads = relationship("Lead", back_populates="customer")
    meetings = relationship("Meeting", back_populates="customer")
    complaints = relationship("Complaint", back_populates="customer")
    queries = relationship("Query", back_populates="customer")
    consents = relationship("Consent", back_populates="customer")
    recommendations = relationship("AIRecommendation", back_populates="customer")

class CustomerProfile(Base):
    __tablename__ = "customer_profiles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), unique=True, nullable=False)
    demographics = Column(String(200), nullable=True)
    occupation = Column(String(100), nullable=True)
    business_type = Column(String(100), nullable=True)
    annual_income = Column(Float, nullable=True)
    annual_turnover = Column(Float, nullable=True)
    employee_count = Column(Integer, nullable=True)
    preferred_language = Column(String(50), default="English")
    preferred_channel = Column(String(50), default="EMAIL")  # EMAIL, SMS, CALL, WHATSAPP
    
    customer = relationship("Customer", back_populates="profile")

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    account_number_masked = Column(String(50), nullable=False)
    account_type = Column(String(50), nullable=False)  # Savings, Current, FD, Loan
    balance = Column(Float, default=0.0)
    status = Column(String(20), default="ACTIVE")
    opened_at = Column(DateTime, default=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="accounts")

class ProductHolding(Base):
    __tablename__ = "product_holdings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    product_type = Column(String(50), nullable=False)  # Deposit, Loan, Card, Merchant
    product_name = Column(String(100), nullable=False)
    status = Column(String(20), default="ACTIVE")
    value = Column(Float, default=0.0)
    
    customer = relationship("Customer", back_populates="product_holdings")

class Interaction(Base):
    __tablename__ = "interactions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    channel = Column(String(50), nullable=False)  # PHONE, EMAIL, VISIT, BRANCH
    interaction_type = Column(String(50), nullable=False)  # Service, Sales, Complaint, Feedback
    direction = Column(String(20), nullable=False)  # INBOUND, OUTBOUND
    summary = Column(Text, nullable=False)
    sentiment = Column(String(20), default="NEUTRAL")
    occurred_at = Column(DateTime, default=datetime.utcnow)
    employee_id = Column(String(50), nullable=True)
    
    customer = relationship("Customer", back_populates="interactions")

class Visit(Base):
    __tablename__ = "visits"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    zrt_officer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    purpose = Column(String(200), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    check_in_at = Column(DateTime, nullable=True)
    check_out_at = Column(DateTime, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    geo_verified = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="SCHEDULED")  # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    sync_status = Column(String(20), default="SYNCED")  # PENDING, SYNCED
    
    customer = relationship("Customer", back_populates="visits")
    need_assessment = relationship("NeedAssessment", back_populates="visit", uselist=False)

class NeedAssessment(Base):
    __tablename__ = "need_assessments"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    visit_id = Column(String(36), ForeignKey("visits.id"), unique=True, nullable=False)
    working_capital_need = Column(Boolean, default=False)
    term_loan_need = Column(Boolean, default=False)
    pos_qr_need = Column(Boolean, default=False)
    salary_account_need = Column(Boolean, default=False)
    insurance_need = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    
    visit = relationship("Visit", back_populates="need_assessment")

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    source = Column(String(50), nullable=False)  # ZRT, AI, INBOUND, RM
    product = Column(String(100), nullable=False)
    potential_value = Column(Float, default=0.0)
    stage = Column(String(50), default="New")  # New, Contacted, Qualified, Documents Pending, Application, Approved, Converted, Lost
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    conversion_probability = Column(Float, default=0.0)  # 0 to 100
    priority = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH
    next_action = Column(String(200), nullable=True)
    next_action_due_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="leads")
    opportunity = relationship("Opportunity", back_populates="lead", uselist=False)

class Opportunity(Base):
    __tablename__ = "opportunities"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id"), unique=True, nullable=False)
    expected_value = Column(Float, default=0.0)
    expected_close_date = Column(DateTime, nullable=True)
    stage = Column(String(50), default="Prospecting")
    probability = Column(Float, default=0.0)
    
    lead = relationship("Lead", back_populates="opportunity")

class Meeting(Base):
    __tablename__ = "meetings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    employee_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    scheduled_at = Column(DateTime, default=datetime.utcnow)
    purpose = Column(String(200), nullable=False)
    transcript = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    sentiment = Column(String(20), default="NEUTRAL")
    action_items = Column(Text, nullable=True)  # JSON or simple string
    follow_up_date = Column(DateTime, nullable=True)
    
    customer = relationship("Customer", back_populates="meetings")

class Complaint(Base):
    __tablename__ = "complaints"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    category = Column(String(50), nullable=False)  # POS, Loan, Account, Digital, Charges
    severity = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(20), default="OPEN")  # OPEN, RESOLVED, ESCALATED
    assigned_team = Column(String(50), nullable=True)
    sla_due_at = Column(DateTime, nullable=True)
    sentiment = Column(String(20), default="NEGATIVE")
    escalation_level = Column(Integer, default=0)
    
    customer = relationship("Customer", back_populates="complaints")

class Query(Base):
    __tablename__ = "queries"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    source_channel = Column(String(50), nullable=False)  # EMAIL, WEB, APP, SMS
    raw_text = Column(Text, nullable=False)
    detected_intent = Column(String(100), nullable=True)
    urgency = Column(String(20), default="LOW")
    routed_team = Column(String(50), nullable=True)
    status = Column(String(20), default="NEW")
    
    customer = relationship("Customer", back_populates="queries")

class Consent(Base):
    __tablename__ = "consents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    channel = Column(String(50), nullable=False)  # SMS, EMAIL, WHATSAPP, CALL
    purpose = Column(String(100), nullable=False)  # Marketing, Service alerts, Lead pitches
    granted = Column(Boolean, default=True)
    captured_at = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)
    
    customer = relationship("Customer", back_populates="consents")

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    recommendation_type = Column(String(50), nullable=False)  # NBA, PRODUCT_PROPENSITY, CHURN_RISK
    recommendation = Column(Text, nullable=False)
    confidence = Column(Float, default=0.0)  # 0 to 100
    reason_codes = Column(Text, nullable=True)  # JSON array string
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(20), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    employee_decision = Column(String(20), nullable=True)  # ACCEPTED, MODIFIED, DISMISSED
    decision_at = Column(DateTime, nullable=True)
    
    customer = relationship("Customer", back_populates="recommendations")

class AuditEvent(Base):
    __tablename__ = "audit_events"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(50), nullable=False)  # user id or system
    action = Column(String(100), nullable=False)  # e.g., NBA_ACCEPTED, LEAD_CREATED
    entity_type = Column(String(50), nullable=False)  # e.g. Customer, Lead, Visit
    entity_id = Column(String(50), nullable=False)
    before_state = Column(Text, nullable=True)  # JSON string
    after_state = Column(Text, nullable=True)  # JSON string
    timestamp = Column(DateTime, default=datetime.utcnow)

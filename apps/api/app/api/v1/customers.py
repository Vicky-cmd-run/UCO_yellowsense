from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

from app.db.session import get_db
from app.models.models import (
    Customer, CustomerProfile, Account, ProductHolding,
    Interaction, Visit, Meeting, Complaint, Query as QueryModel,
    Consent, AIRecommendation, AuditEvent
)
from app.api.v1.deps import get_current_user

router = APIRouter()

# Schema definitions
class ProfileResponse(BaseModel):
    demographics: str | None
    occupation: str | None
    business_type: str | None
    annual_income: float | None
    annual_turnover: float | None
    employee_count: int | None
    preferred_language: str
    preferred_channel: str

    class Config:
        from_attributes = True

class CustomerListItem(BaseModel):
    id: str
    customer_number: str
    full_name: str
    customer_type: str
    segment: str
    lifecycle_stage: str
    mobile: str
    email: str
    city: str
    state: str
    relationship_value: float
    relationship_tenure_months: int
    digital_engagement_score: int
    sentiment: str
    churn_risk: int
    lead_propensity: int
    assigned_rm_id: str | None
    assigned_vrm_id: str | None

    class Config:
        from_attributes = True

class AccountResponse(BaseModel):
    id: str
    account_number_masked: str
    account_type: str
    balance: float
    status: str
    opened_at: datetime

    class Config:
        from_attributes = True

class HoldingResponse(BaseModel):
    id: str
    product_type: str
    product_name: str
    status: str
    value: float

    class Config:
        from_attributes = True

class CustomerDetailResponse(CustomerListItem):
    profile: ProfileResponse | None
    accounts: List[AccountResponse]
    product_holdings: List[HoldingResponse]

    class Config:
        from_attributes = True

class TimelineItem(BaseModel):
    id: str
    type: str  # interaction, visit, meeting, complaint, audit
    title: str
    description: str
    timestamp: datetime
    sentiment: str | None
    actor: str | None

@router.get("", response_model=List[CustomerListItem])
def get_customers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    segment: str | None = None,
    lifecycle_stage: str | None = None,
    sentiment: str | None = None,
    q: str | None = None,
    current_user: Any = Depends(get_current_user)
):
    query = db.query(Customer)
    
    # Apply filters
    if segment:
        query = query.filter(Customer.segment == segment)
    if lifecycle_stage:
        query = query.filter(Customer.lifecycle_stage == lifecycle_stage)
    if sentiment:
        query = query.filter(Customer.sentiment == sentiment)
        
    if q:
        # Search by name, customer_number, mobile, or email
        query = query.filter(
            Customer.full_name.ilike(f"%{q}%") |
            Customer.customer_number.ilike(f"%{q}%") |
            Customer.mobile.ilike(f"%{q}%") |
            Customer.email.ilike(f"%{q}%")
        )
        
    return query.offset(skip).limit(limit).all()

@router.get("/{id}", response_model=CustomerDetailResponse)
def get_customer_by_id(id: str, db: Session = Depends(get_db), current_user: Any = Depends(get_current_user)):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer

@router.get("/{id}/timeline", response_model=List[TimelineItem])
def get_customer_timeline(id: str, db: Session = Depends(get_db), current_user: Any = Depends(get_current_user)):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
        
    timeline = []
    
    # 1. Interactions
    for item in customer.interactions:
        timeline.append(TimelineItem(
            id=item.id,
            type="interaction",
            title=f"Interaction: {item.channel} ({item.interaction_type})",
            description=item.summary,
            timestamp=item.occurred_at,
            sentiment=item.sentiment,
            actor=item.employee_id
        ))
        
    # 2. Visits
    for item in customer.visits:
        timeline.append(TimelineItem(
            id=item.id,
            type="visit",
            title=f"Field Visit ({item.status})",
            description=item.notes or f"Scheduled field visit for {item.purpose}.",
            timestamp=item.check_in_at or item.scheduled_at,
            sentiment="NEUTRAL",
            actor=item.zrt_officer_id
        ))
        
    # 3. Meetings
    for item in customer.meetings:
        timeline.append(TimelineItem(
            id=item.id,
            type="meeting",
            title=f"Meeting: {item.purpose}",
            description=item.summary or "MSME discussion details.",
            timestamp=item.scheduled_at,
            sentiment=item.sentiment,
            actor=item.employee_id
        ))
        
    # 4. Complaints
    for item in customer.complaints:
        timeline.append(TimelineItem(
            id=item.id,
            type="complaint",
            title=f"Complaint: {item.category} ({item.severity})",
            description=f"Status: {item.status}. Assigned to {item.assigned_team}.",
            timestamp=item.sla_due_at or datetime.utcnow(),
            sentiment=item.sentiment,
            actor="System"
        ))
        
    # 5. Audit Events
    audit_events = db.query(AuditEvent).filter(AuditEvent.entity_id == id).all()
    for item in audit_events:
        timeline.append(TimelineItem(
            id=item.id,
            type="audit",
            title=f"Action: {item.action}",
            description=item.after_state or "Action logged.",
            timestamp=item.timestamp,
            sentiment="NEUTRAL",
            actor=item.actor_id
        ))
        
    # Sort timeline by timestamp descending
    timeline.sort(key=lambda x: x.timestamp, reverse=True)
    return timeline

@router.get("/{id}/recommendations")
def get_customer_recommendations(id: str, db: Session = Depends(get_db), current_user: Any = Depends(get_current_user)):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer.recommendations

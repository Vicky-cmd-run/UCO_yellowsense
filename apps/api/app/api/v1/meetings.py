from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Any
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.models import Meeting, Customer, AuditEvent
from app.api.v1.deps import get_current_user

router = APIRouter()

# Schemas
class MeetingResponse(BaseModel):
    id: str
    customer_id: str
    employee_id: str
    scheduled_at: datetime
    purpose: str
    transcript: str | None
    summary: str | None
    sentiment: str
    action_items: str | None
    follow_up_date: datetime | None

    class Config:
        from_attributes = True

class MeetingCreate(BaseModel):
    customer_id: str
    purpose: str
    scheduled_at: datetime
    transcript: str | None = None

class MeetingIntelligenceResponse(BaseModel):
    summary: str
    concerns: List[str]
    action_items: List[str]
    opportunity: str
    sentiment: str

@router.get("", response_model=List[MeetingResponse])
def get_meetings(db: Session = Depends(get_db), current_user: Any = Depends(get_current_user)):
    return db.query(Meeting).all()

@router.post("", response_model=MeetingResponse)
def create_meeting(
    data: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        
    meeting = Meeting(
        customer_id=data.customer_id,
        employee_id=current_user.id,
        purpose=data.purpose,
        scheduled_at=data.scheduled_at,
        transcript=data.transcript,
        sentiment="NEUTRAL"
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    
    # Audit log
    AuditEvent.create_secured(
        db,
        actor_id=current_user.employee_id,
        action="MEETING_SCHEDULED",
        entity_type="Meeting",
        entity_id=meeting.id,
        after_state=f"Meeting scheduled for customer {customer.full_name} regarding {data.purpose}."
    )
    db.commit()
    
    return meeting

@router.post("/{id}/generate-intelligence", response_model=MeetingResponse)
def generate_meeting_intelligence(
    id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    meeting = db.query(Meeting).filter(Meeting.id == id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
        
    transcript_text = meeting.transcript or ""
    
    # Check if this is the showcase MSME Loan Discussion
    if "Kumar" in transcript_text or "warehouse expansion" in transcript_text or meeting.purpose == "MSME Loan Discussion":
        meeting.summary = "Warehouse expansion discussion. Customer requires ₹25L funding for new warehouse construction."
        meeting.sentiment = "POSITIVE"
        meeting.action_items = "1. Send interest eligibility details\n2. Collect GST statements\n3. Follow up Friday"
        meeting.follow_up_date = datetime.utcnow() + timedelta(days=3)
    else:
        # Default mock intelligence
        meeting.summary = f"Discussion about general relationship services. Purpose: {meeting.purpose}."
        meeting.sentiment = "NEUTRAL"
        meeting.action_items = "1. Review account balances\n2. Schedule follow-up email"
        
    db.commit()
    db.refresh(meeting)
    
    # Audit log
    AuditEvent.create_secured(
        db,
        actor_id=current_user.employee_id,
        action="MEETING_INTELLIGENCE_GENERATED",
        entity_type="Meeting",
        entity_id=meeting.id,
        after_state=f"Meeting intelligence generated. Sentiment: {meeting.sentiment}."
    )
    db.commit()
    
    return meeting

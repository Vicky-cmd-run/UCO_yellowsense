from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Any
from datetime import datetime

from app.db.session import get_db
from app.models.models import Query, Customer, AuditEvent
from app.api.v1.deps import get_current_user

router = APIRouter()

# Schemas
class QueryResponse(BaseModel):
    id: str
    customer_id: str
    source_channel: str
    raw_text: str
    detected_intent: str | None
    urgency: str
    routed_team: str | None
    status: str

    class Config:
        from_attributes = True

class QueryCreate(BaseModel):
    customer_id: str
    source_channel: str
    raw_text: str

@router.get("", response_model=List[QueryResponse])
def get_queries(db: Session = Depends(get_db), current_user: Any = Depends(get_current_user)):
    return db.query(Query).all()

@router.post("", response_model=QueryResponse)
def create_query(
    data: QueryCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        
    # Simple rule-based NLP intent detection
    intent = "General Inquiry"
    urgency = "LOW"
    team = "Customer Service Operations"
    
    txt = data.raw_text.lower()
    if "emi" in txt or "double deduction" in txt:
        intent = "Loan EMI Issue"
        urgency = "HIGH"
        team = "Loan Servicing Desk"
    elif "card reader" in txt or "pos terminal" in txt:
        intent = "Merchant Terminal Fault"
        urgency = "HIGH"
        team = "POS Merchant Support"
    elif "rate" in txt or "interest" in txt:
        intent = "Product Rate Inquiry"
        urgency = "MEDIUM"
        team = "Sales Advisory Desk"
        
    query = Query(
        customer_id=data.customer_id,
        source_channel=data.source_channel,
        raw_text=data.raw_text,
        detected_intent=intent,
        urgency=urgency,
        routed_team=team,
        status="ROUTED"
    )
    db.add(query)
    db.commit()
    db.refresh(query)
    
    # Audit log
    AuditEvent.create_secured(
        db,
        actor_id=current_user.employee_id,
        action="QUERY_ROUTED",
        entity_type="Query",
        entity_id=query.id,
        after_state=f"Inbound query received over {data.source_channel}. Auto-detected intent: {intent}. Urgency: {urgency}."
    )
    db.commit()
    
    return query

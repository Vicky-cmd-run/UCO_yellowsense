from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Any
from datetime import datetime

from app.db.session import get_db
from app.models.models import Lead, Customer, User, AuditEvent
from app.api.v1.deps import get_current_user

router = APIRouter()

# Schemas
class LeadResponse(BaseModel):
    id: str
    customer_id: str
    source: str
    product: str
    potential_value: float
    stage: str
    owner_id: str | None
    conversion_probability: float
    priority: str
    next_action: str | None
    next_action_due_at: datetime | None
    created_at: datetime
    customer_name: str | None = None

    class Config:
        from_attributes = True

class LeadCreate(BaseModel):
    customer_id: str
    source: str
    product: str
    potential_value: float
    owner_id: str | None = None
    priority: str = "MEDIUM"

class LeadStageUpdate(BaseModel):
    stage: str

class LeadAssignRequest(BaseModel):
    owner_id: str

@router.get("", response_model=List[LeadResponse])
def get_leads(db: Session = Depends(get_db), current_user: Any = Depends(get_current_user)):
    leads = db.query(Lead).all()
    # Add customer_name property for UI convenience
    response = []
    for l in leads:
        customer = db.query(Customer).filter(Customer.id == l.customer_id).first()
        item = LeadResponse.from_orm(l)
        if customer:
            item.customer_name = customer.full_name
        response.append(item)
    return response

@router.post("", response_model=LeadResponse)
def create_lead(
    data: LeadCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        
    lead = Lead(
        customer_id=data.customer_id,
        source=data.source,
        product=data.product,
        potential_value=data.potential_value,
        stage="New",
        owner_id=data.owner_id,
        conversion_probability=85.0 if data.source == "ZRT" else 60.0,
        priority=data.priority,
        next_action="Schedule follow-up discussion",
        next_action_due_at=datetime.utcnow()
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    
    # Audit log
    audit = AuditEvent(
        actor_id=current_user.employee_id,
        action="LEAD_CREATED",
        entity_type="Lead",
        entity_id=lead.id,
        after_state=f"New lead created for product {data.product} with potential value of ₹{data.potential_value}."
    )
    db.add(audit)
    db.commit()
    
    # Return lead with customer name
    item = LeadResponse.from_orm(lead)
    item.customer_name = customer.full_name
    return item

@router.patch("/{id}/stage", response_model=LeadResponse)
def update_lead_stage(
    id: str,
    data: LeadStageUpdate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == id).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
        
    before_state = f'{{"stage": "{lead.stage}"}}'
    lead.stage = data.stage
    db.commit()
    db.refresh(lead)
    
    customer = db.query(Customer).filter(Customer.id == lead.customer_id).first()
    
    # Audit log
    audit = AuditEvent(
        actor_id=current_user.employee_id,
        action="LEAD_STAGE_UPDATED",
        entity_type="Lead",
        entity_id=lead.id,
        before_state=before_state,
        after_state=f'{{"stage": "{data.stage}"}}'
    )
    db.add(audit)
    db.commit()
    
    item = LeadResponse.from_orm(lead)
    if customer:
        item.customer_name = customer.full_name
    return item

@router.post("/{id}/assign", response_model=LeadResponse)
def assign_lead_owner(
    id: str,
    data: LeadAssignRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == id).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
        
    owner = db.query(User).filter(User.id == data.owner_id).first()
    if not owner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Owner user not found")
        
    before_state = f'{{"owner_id": "{lead.owner_id}"}}'
    lead.owner_id = data.owner_id
    db.commit()
    db.refresh(lead)
    
    customer = db.query(Customer).filter(Customer.id == lead.customer_id).first()
    
    # Audit log
    audit = AuditEvent(
        actor_id=current_user.employee_id,
        action="LEAD_ASSIGNED",
        entity_type="Lead",
        entity_id=lead.id,
        before_state=before_state,
        after_state=f'{{"owner_id": "{data.owner_id}"}}'
    )
    db.add(audit)
    db.commit()
    
    item = LeadResponse.from_orm(lead)
    if customer:
        item.customer_name = customer.full_name
    return item

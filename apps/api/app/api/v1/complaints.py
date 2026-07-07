from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Any
from datetime import datetime

from app.db.session import get_db
from app.models.models import Complaint, Customer, AuditEvent
from app.api.v1.deps import get_current_user

router = APIRouter()

# Schemas
class ComplaintResponse(BaseModel):
    id: str
    customer_id: str
    category: str
    severity: str
    status: str
    assigned_team: str | None
    sla_due_at: datetime | None
    sentiment: str
    escalation_level: int
    customer_name: str | None = None

    class Config:
        from_attributes = True

class ComplaintUpdate(BaseModel):
    status: str | None = None
    assigned_team: str | None = None
    escalation_level: int | None = None

@router.get("", response_model=List[ComplaintResponse])
def get_complaints(db: Session = Depends(get_db), current_user: Any = Depends(get_current_user)):
    complaints = db.query(Complaint).all()
    # Add customer_name property
    response = []
    for c in complaints:
        customer = db.query(Customer).filter(Customer.id == c.customer_id).first()
        item = ComplaintResponse.from_orm(c)
        if customer:
            item.customer_name = customer.full_name
        response.append(item)
    return response

@router.patch("/{id}", response_model=ComplaintResponse)
def update_complaint(
    id: str,
    data: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
        
    before_state = f'{{"status": "{complaint.status}", "escalation": {complaint.escalation_level}}}'
    
    if data.status is not None:
        complaint.status = data.status
    if data.assigned_team is not None:
        complaint.assigned_team = data.assigned_team
    if data.escalation_level is not None:
        complaint.escalation_level = data.escalation_level
        
    db.commit()
    db.refresh(complaint)
    
    customer = db.query(Customer).filter(Customer.id == complaint.customer_id).first()
    
    # Audit log
    audit = AuditEvent(
        actor_id=current_user.employee_id,
        action="COMPLAINT_UPDATED",
        entity_type="Complaint",
        entity_id=complaint.id,
        before_state=before_state,
        after_state=f'{{"status": "{complaint.status}", "escalation": {complaint.escalation_level}}}'
    )
    db.add(audit)
    db.commit()
    
    item = ComplaintResponse.from_orm(complaint)
    if customer:
        item.customer_name = customer.full_name
    return item

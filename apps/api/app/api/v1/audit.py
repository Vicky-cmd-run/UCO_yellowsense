from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Any
from datetime import datetime

from app.db.session import get_db
from app.models.models import AuditEvent
from app.api.v1.deps import get_current_user

router = APIRouter()

# Schemas
class AuditEventResponse(BaseModel):
    id: str
    actor_id: str
    action: str
    entity_type: str
    entity_id: str
    before_state: str | None
    after_state: str | None
    timestamp: datetime
    hash: str | None
    previous_hash: str | None

    class Config:
        from_attributes = True

@router.get("", response_model=List[AuditEventResponse])
def get_audit_trail(
    db: Session = Depends(get_db),
    actor: str | None = Query(None),
    entity: str | None = Query(None),
    action: str | None = Query(None),
    current_user: Any = Depends(get_current_user)
):
    query = db.query(AuditEvent)
    
    # Apply optional filters
    if actor:
        query = query.filter(AuditEvent.actor_id == actor)
    if entity:
        query = query.filter(AuditEvent.entity_type == entity)
    if action:
        query = query.filter(AuditEvent.action == action)
        
    # Default sort by newest events
    return query.order_by(AuditEvent.timestamp.desc()).all()

class AuditVerificationResponse(BaseModel):
    chain_valid: bool
    verified_count: int
    tampered_ids: List[str]
    warning: str | None

@router.get("/verify", response_model=AuditVerificationResponse)
def verify_audit_trail_chain(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    import hashlib
    # Get all audit events sorted chronologically to verify the chain
    events = db.query(AuditEvent).order_by(AuditEvent.timestamp.asc()).all()
    
    chain_valid = True
    tampered = []
    prev_hash = "0" * 64
    
    for ae in events:
        # 1. Verify previous hash link
        if ae.previous_hash != prev_hash:
            chain_valid = False
            tampered.append(ae.id)
            prev_hash = ae.hash or ""
            continue
            
        # 2. Re-compute current hash
        data_str = f"{ae.actor_id}|{ae.action}|{ae.entity_type}|{ae.entity_id}|{ae.before_state}|{ae.after_state}|{prev_hash}"
        computed = hashlib.sha256(data_str.encode('utf-8')).hexdigest()
        
        if ae.hash != computed:
            chain_valid = False
            tampered.append(ae.id)
            
        prev_hash = ae.hash or ""
        
    warning_msg = None
    if not chain_valid:
        warning_msg = f"Security Violation: Retroactive alteration or insertion detected in audit ledger! {len(tampered)} events have corrupted cryptographic links."
        
    return AuditVerificationResponse(
        chain_valid=chain_valid,
        verified_count=len(events),
        tampered_ids=tampered,
        warning=warning_msg
    )

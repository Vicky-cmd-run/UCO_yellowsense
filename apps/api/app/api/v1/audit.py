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

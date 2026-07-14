import hashlib
from app.models.models import AuditEvent
from sqlalchemy.orm import Session

def compute_audit_hash(ae: AuditEvent, prev_hash: str) -> str:
    data_str = f"{ae.actor_id}|{ae.action}|{ae.entity_type}|{ae.entity_id}|{ae.before_state}|{ae.after_state}|{prev_hash}"
    return hashlib.sha256(data_str.encode('utf-8')).hexdigest()

def create_secured_audit_event(
    db: Session,
    actor_id: str,
    action: str,
    entity_type: str,
    entity_id: str,
    before_state: str | None = None,
    after_state: str | None = None
) -> AuditEvent:
    # Retrieve the latest audit event chronologically
    latest = db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).first()
    prev_hash = latest.hash if (latest and latest.hash) else ("0" * 64)
    
    ae = AuditEvent(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        before_state=before_state,
        after_state=after_state,
        previous_hash=prev_hash
    )
    
    ae.hash = compute_audit_hash(ae, prev_hash)
    
    db.add(ae)
    db.commit()
    db.refresh(ae)
    return ae

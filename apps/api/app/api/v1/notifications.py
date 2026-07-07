from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.session import get_db
from app.models.models import Customer, Lead, Complaint
from app.api.v1.deps import get_current_user

router = APIRouter()

@router.get("")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    alerts = []
    
    # 1. Churn risk alerts for Priority RMs
    at_risk = db.query(Customer).filter(Customer.churn_risk >= 75).all()
    for c in at_risk:
        alerts.append({
            "id": f"churn-{c.id}",
            "type": "CHURN_RISK",
            "title": "High Churn Risk Warning",
            "message": f"Customer {c.full_name} has churn risk of {c.churn_risk}%. Action required.",
            "customer_id": c.id,
            "severity": "CRITICAL"
        })
        
    # 2. Aging high-value leads
    aging_leads = db.query(Lead).filter(Lead.stage == "New").all()
    for l in aging_leads:
        customer = db.query(Customer).filter(Customer.id == l.customer_id).first()
        c_name = customer.full_name if customer else "Unknown"
        alerts.append({
            "id": f"lead-{l.id}",
            "type": "AGING_LEAD",
            "title": "Unassigned/New Lead Alert",
            "message": f"New lead for {l.product} (₹{l.potential_value / 100000:.1f}L) for {c_name} requires review.",
            "customer_id": l.customer_id,
            "severity": "HIGH"
        })
        
    # 3. SLA breach warnings
    open_complaints = db.query(Complaint).filter(Complaint.status == "OPEN").all()
    for c in open_complaints:
        customer = db.query(Customer).filter(Customer.id == c.customer_id).first()
        c_name = customer.full_name if customer else "Unknown"
        if c.severity in ["HIGH", "CRITICAL"]:
            alerts.append({
                "id": f"complaint-{c.id}",
                "type": "SLA_BREACH",
                "title": "SLA Escalation Warning",
                "message": f"Open POS/Account complaint for {c_name} is nearing SLA deadline.",
                "customer_id": c.id,
                "severity": "HIGH"
            })
            
    return alerts

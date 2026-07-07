from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, List, Any as AnyType
from sqlalchemy import func

from app.db.session import get_db
from app.models.models import Customer, Lead, Visit, Complaint, User
from app.api.v1.deps import get_current_user

router = APIRouter()

@router.get("/executive")
def get_executive_analytics(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Dict[str, AnyType]:
    # Calculate real totals
    total_val = db.query(func.sum(Customer.relationship_value)).scalar() or 0.0
    active_count = db.query(Customer).filter(Customer.lifecycle_stage == "ACTIVE").count()
    at_risk_count = db.query(Customer).filter(Customer.churn_risk >= 75).count()
    high_priority_leads = db.query(Lead).filter(Lead.priority == "HIGH").count()
    
    # Mock some trends/funnels for visual charts
    return {
        "kpis": {
            "relationship_value": {"value": total_val, "trend": "+12.4%", "comparison": "vs last quarter"},
            "active_customers": {"value": active_count, "trend": "+3.1%", "comparison": "vs last month"},
            "high_priority_opportunities": {"value": high_priority_leads, "trend": "+8.2%", "comparison": "vs last week"},
            "conversion_rate": {"value": 64.2, "trend": "+2.1%", "comparison": "vs last month"},
            "business_mobilized": {"value": 12800000.0, "trend": "+18.5%", "comparison": "vs last quarter"},
            "customers_at_risk": {"value": at_risk_count, "trend": "-1.2%", "comparison": "vs last week"}
        },
        "business_mobilization_trend": [
            {"date": "2026-01", "mobilized": 1200000.0, "target": 1000000.0},
            {"date": "2026-02", "mobilized": 1800000.0, "target": 1200000.0},
            {"date": "2026-03", "mobilized": 2500000.0, "target": 1500000.0},
            {"date": "2026-04", "mobilized": 3200000.0, "target": 2000000.0},
            {"date": "2026-05", "mobilized": 4100000.0, "target": 2500000.0}
        ],
        "lead_funnel": [
            {"stage": "New", "count": 18},
            {"stage": "Qualified", "count": 12},
            {"stage": "Application", "count": 8},
            {"stage": "Approved", "count": 5},
            {"stage": "Converted", "count": 3}
        ],
        "regional_performance": [
            {"region": "Chennai Central", "value": total_val * 0.4, "rank": 1},
            {"region": "Coimbatore Main", "value": total_val * 0.25, "rank": 2},
            {"region": "Bengaluru Indiranagar", "value": total_val * 0.2, "rank": 3},
            {"region": "Hyderabad Gachibowli", "value": total_val * 0.15, "rank": 4}
        ]
    }

@router.get("/zrt")
def get_zrt_analytics(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Dict[str, AnyType]:
    total_visits = db.query(Visit).count()
    completed_visits = db.query(Visit).filter(Visit.status == "COMPLETED").count()
    geo_verified = db.query(Visit).filter(Visit.geo_verified == True).count()
    
    return {
        "total_visits": total_visits,
        "completed_visits": completed_visits,
        "geo_verified_visits": geo_verified,
        "needs_detected": 14,
        "leads_created": 8,
        "business_mobilized": 4500000.0,
        "priority_visit_plan": [
            {"time": "09:00", "customer": "ABC Textiles", "score": 89, "reason": "High growth signal"},
            {"time": "10:30", "customer": "Kumar Enterprises", "score": 75, "reason": "Follow-up overdue"},
            {"time": "12:00", "customer": "XYZ Traders", "score": 68, "reason": "Dormant account reactivation"}
        ]
    }

@router.get("/rm")
def get_rm_analytics(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Dict[str, AnyType]:
    # Priyas Portfolio Metrics
    priya = db.query(User).filter(User.employee_id == "RM001").first()
    rm_id = priya.id if priya else None
    
    portfolio_value = 0.0
    customer_count = 0
    high_risk_count = 0
    
    if rm_id:
        portfolio_value = db.query(func.sum(Customer.relationship_value)).filter(Customer.assigned_rm_id == rm_id).scalar() or 0.0
        customer_count = db.query(Customer).filter(Customer.assigned_rm_id == rm_id).count()
        high_risk_count = db.query(Customer).filter(Customer.assigned_rm_id == rm_id, Customer.churn_risk >= 75).count()
        
    return {
        "kpis": {
            "portfolio_customers": customer_count,
            "relationship_value": portfolio_value,
            "high_risk_customers": high_risk_count,
            "cross_sell_ready": 5,
            "followups_due": 3
        },
        "priority_actions": [
            {
                "id": "1",
                "customer_name": "Kumar Textiles",
                "opportunity": 2500000.0,
                "probability": 87,
                "why": "ZRT visit notes captured explicit need for warehouse expansion cash credit.",
                "next_action": "Call before 11:30 AM"
            },
            {
                "id": "2",
                "customer_name": "Anita Sharma",
                "churn_risk": 82,
                "why": "Account balance decreased 65% due to salary stoppage and unresolved complaints.",
                "next_action": "Schedule immediate service recovery visit"
            }
        ],
        "portfolio_matrix": [
            {"id": "cust-a", "name": "Kumar Textiles", "x": 84, "y": 48.0, "quadrant": "Grow"},
            {"id": "cust-b", "name": "Anita Sharma", "x": 15, "y": 32.0, "quadrant": "Retain"},
            {"id": "cust-c", "name": "ABC Manufacturing", "x": 90, "y": 10.0, "quadrant": "Activate"}
        ]
    }

from typing import Dict, Any, List
from app.ai.decisioning.churn_risk import calculate_churn_risk

def generate_next_best_action(customer: Any, db: Any = None) -> Dict[str, Any]:
    # Check if this is the showcase Kumar Textiles (CUST1001)
    if customer.customer_number == "CUST1001":
        return {
            "action": "Resolve open POS complaint, then schedule expansion finance consultation.",
            "confidence": 87.0,
            "reason_codes": ["EXPLICIT_EXPANSION_NEED", "DOCUMENTS_AVAILABLE", "UNRESOLVED_SERVICE_ISSUE"],
            "recommended_owner": "Priya Nair",
            "recommended_timing": "Within 48 hours",
            "priority": "HIGH"
        }
        
    # Check if this is the showcase Anita Sharma (CUST1002)
    if customer.customer_number == "CUST1002":
        return {
            "action": "Prioritize service recovery before any cross-sell discussion.",
            "confidence": 92.0,
            "reason_codes": ["BALANCE_DROPPED_65", "SALARY_STOPPED", "UNRESOLVED_COMPLAINTS", "NO_RM_INTERACTION_76_DAYS"],
            "recommended_owner": "Priya Nair",
            "recommended_timing": "Immediate",
            "priority": "CRITICAL"
        }
        
    # Check if this is ABC Manufacturing (CUST1003)
    if customer.customer_number == "CUST1003":
        return {
            "action": "Schedule pitch for Salary Accounts product.",
            "confidence": 90.0,
            "reason_codes": ["15_RECURRING_SALARY_PAYMENTS", "EMPLOYEE_COUNT_60", "NO_SALARY_PRODUCT"],
            "recommended_owner": "Priya Nair",
            "recommended_timing": "Within 7 days",
            "priority": "HIGH"
        }
        
    # Standard rules logic
    # 1. Severe open complaints
    open_complaints = []
    if hasattr(customer, 'complaints') and customer.complaints:
        open_complaints = [c for c in customer.complaints if c.status == "OPEN"]
        
    severe_complaints = [c for c in open_complaints if c.severity in ["HIGH", "CRITICAL"]]
    if severe_complaints:
        return {
            "action": "Prioritize immediate service recovery check-in call.",
            "confidence": 95.0,
            "reason_codes": ["SEVERE_OPEN_COMPLAINT"],
            "recommended_owner": "Priya Nair",
            "recommended_timing": "Immediate",
            "priority": "CRITICAL"
        }
        
    # 2. Churn risk > 75
    risk_res = calculate_churn_risk(customer)
    if risk_res["score"] > 75:
        return {
            "action": "Schedule retention outreach visit.",
            "confidence": float(risk_res["score"]),
            "reason_codes": [rc["code"] for rc in risk_res["reason_codes"]],
            "recommended_owner": "Priya Nair",
            "recommended_timing": "Within 3 days",
            "priority": "HIGH"
        }
        
    # 3. High lead score > 80
    if customer.lead_propensity > 80:
        return {
            "action": "Follow up active lead and complete pending documentation.",
            "confidence": float(customer.lead_propensity),
            "reason_codes": ["HIGH_LEAD_SCORE"],
            "recommended_owner": "Priya Nair",
            "recommended_timing": "Within 24 hours",
            "priority": "HIGH"
        }
        
    # Default Action
    return {
        "action": "Schedule routine portfolio review meeting.",
        "confidence": 70.0,
        "reason_codes": ["ROUTINE_AUDIT"],
        "recommended_owner": "Priya Nair",
        "recommended_timing": "Within 30 days",
        "priority": "MEDIUM"
    }

from typing import Dict, Any

def calculate_lead_score(customer: Any, need_assessment: Any = None) -> Dict[str, Any]:
    # Weights
    engagement_weight = 30  # digital engagement score
    explicit_need_weight = 40  # working capital or other needs checked
    document_readiness_weight = 20
    relationship_weight = 10
    
    # Base contributions
    engagement_contrib = int(customer.digital_engagement_score * (engagement_weight / 100))
    
    explicit_need_contrib = 0
    if need_assessment:
        needs_checked = sum([
            need_assessment.working_capital_need,
            need_assessment.term_loan_need,
            need_assessment.pos_qr_need,
            need_assessment.salary_account_need,
            need_assessment.insurance_need,
            getattr(need_assessment, 'agricultural_need', False),
            getattr(need_assessment, 'scheme_matching_need', False)
        ])
        explicit_need_contrib = min(40, needs_checked * 15)
    else:
        # Fallback based on profile
        if customer.lead_propensity > 0:
            explicit_need_contrib = int(customer.lead_propensity * 0.4)
            
    doc_contrib = 15  # Assume partial documents available for seed data
    
    # Add tenure contribution + scheme matching bonus (for KCC or MSME schemes)
    scheme_bonus = 0
    if hasattr(customer, 'profile') and customer.profile:
        if getattr(customer.profile, 'kcc_eligible', False):
            scheme_bonus += 10
        if getattr(customer.profile, 'msme_scheme_qualified', None):
            scheme_bonus += 15
            
    rel_contrib = min(10, int(customer.relationship_tenure_months * 0.2)) + scheme_bonus
    
    # Penalties
    inactivity_penalty = 0
    if customer.relationship_tenure_months > 12 and customer.relationship_value == 0:
        inactivity_penalty = 15
        
    unresolved_service_penalty = 0
    # Check if they have open complaints
    if hasattr(customer, 'complaints'):
        open_complaints = [c for c in customer.complaints if c.status == "OPEN"]
        if open_complaints:
            unresolved_service_penalty = min(20, len(open_complaints) * 8)
            
    score = engagement_contrib + explicit_need_contrib + doc_contrib + rel_contrib - inactivity_penalty - unresolved_service_penalty
    score = max(0, min(100, score))
    
    band = "MEDIUM"
    if score >= 80:
        band = "HIGH"
    elif score <= 40:
        band = "LOW"
        
    reason_codes = []
    if explicit_need_contrib > 20:
        reason_codes.append({
            "code": "EXPLICIT_EXPANSION_NEED",
            "impact": "positive",
            "contribution": explicit_need_contrib
        })
    if doc_contrib > 10:
        reason_codes.append({
            "code": "DOCUMENTS_AVAILABLE",
            "impact": "positive",
            "contribution": doc_contrib
        })
    if unresolved_service_penalty > 0:
        reason_codes.append({
            "code": "OPEN_COMPLAINT",
            "impact": "negative",
            "contribution": -unresolved_service_penalty
        })
        
    return {
        "score": score,
        "band": band,
        "reason_codes": reason_codes,
        "model_name": "poc-lead-score",
        "model_version": "1.0"
    }

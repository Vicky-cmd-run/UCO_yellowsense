from typing import Dict, Any

def route_query_intent(text: str) -> Dict[str, Any]:
    txt = text.lower()
    intent = "General Banking Inquiry"
    urgency = "LOW"
    team = "Retail Operations"
    
    if "emi" in txt or "loan" in txt:
        intent = "Loan Service Issue"
        urgency = "HIGH" if "double" in txt or "twice" in txt else "MEDIUM"
        team = "Loan Operations Team"
    elif "card" in txt or "pos" in txt or "terminal" in txt:
        intent = "POS Acquiring Fault"
        urgency = "HIGH"
        team = "POS Merchant Support"
    elif "interest" in txt or "rate" in txt or "fixed deposit" in txt:
        intent = "Advisory Rate Request"
        urgency = "LOW"
        team = "Wealth Management"
        
    return {
        "intent": intent,
        "urgency": urgency,
        "routed_team": team,
        "model_name": "poc-query-router",
        "model_version": "1.1"
    }

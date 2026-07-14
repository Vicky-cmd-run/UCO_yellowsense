from typing import Dict, Any, List

# Simulated SEBI / RBI watchlists
REGULATORY_WATCHLIST = [
    "ANITA SHARMA",  # Showcase HNI client has a warning flagged
    "SHARMA HOLDINGS",
    "FAKE SEBI ALERTS INC",
    "PIRAMAL INDUSTRIAL CORP",  # Mock banned entity
    "COIMBATORE TEXTILE CARTEL"
]

HIGH_RISK_EMAIL_DOMAINS = [
    "fake", "mailinator", "tempmail", "lookalike-sebi.org", "uco-verification.net"
]

def verify_email_domain(email: str, company_name: str) -> Dict[str, Any]:
    email = email.lower()
    comp = company_name.lower()
    
    # Extract domain
    if "@" not in email:
        return {"passed": False, "reason": "Invalid email format"}
    
    username, domain = email.split("@", 1)
    domain_name = domain.split(".", 1)[0]
    
    # Check for lookalike domains or generic domain mismatch for corporates
    if any(risk in domain for risk in HIGH_RISK_EMAIL_DOMAINS):
        return {
            "passed": False,
            "reason": f"High risk email domain detected: '@{domain}' is a temporary or lookalike server."
        }
        
    # Mock mismatch logic for corporate domains
    # If it is a corporate customer, they should not use free email providers like gmail for official operations in strict audits
    if "pvt ltd" in comp or "mfg" in comp or "manufacturing" in comp:
        if domain in ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]:
            return {
                "passed": False,
                "reason": f"Official corporate entity uses a free public email domain: '@{domain}'."
            }
            
    return {"passed": True, "reason": "Domain verified"}

def check_regulatory_blacklist(name: str) -> Dict[str, Any]:
    name_upper = name.upper().strip()
    
    # Check if exact match or partial match in regulatory watchlists
    for banned in REGULATORY_WATCHLIST:
        if banned in name_upper or name_upper in banned:
            return {
                "listed": True,
                "reason": f"Entity matches regulatory warnings registry under category: 'SEBI Banned/High Risk Watchlist' ({banned})."
            }
            
    return {"listed": False, "reason": "Not listed on any watchlists"}

def check_document_fraud(doc_type: str, file_name: str) -> Dict[str, Any]:
    fn = file_name.lower()
    if "sebi" in fn or "warning" in fn or "banned" in fn:
        return {
            "passed": False,
            "reason": "Uploaded document filename contains regulatory alert keyword flags."
        }
    return {"passed": True, "reason": "Document integrity check passed"}

def run_full_fraud_assessment(customer: Any) -> Dict[str, Any]:
    alerts = []
    status = "PASSED"
    
    # 1. Check blacklist
    blacklist_res = check_regulatory_blacklist(customer.full_name)
    if blacklist_res["listed"]:
        alerts.append(blacklist_res["reason"])
        status = "WARNING"
        
    # 2. Check email domain
    email_res = verify_email_domain(customer.email, customer.full_name)
    if not email_res["passed"]:
        alerts.append(email_res["reason"])
        # Mismatches or generic emails trigger warning status
        if status != "FAILED":
            status = "WARNING"
            
    # Showcase rules for Anita Sharma (CUST1002) - trigger critical warning/failed SEBI warning status
    if customer.customer_number in ["CUST1002", "UCO2024002"]:
        status = "FAILED"
        if not any("SEBI" in a for a in alerts):
            alerts.append("Security Alert: Active SEBI warning list match detected on associated HNI investments.")
            
    return {
        "status": status,
        "alerts": alerts,
        "alerts_count": len(alerts)
    }

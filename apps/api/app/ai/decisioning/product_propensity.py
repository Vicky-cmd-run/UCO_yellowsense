from typing import Dict, Any, List

def get_customer_propensities(customer: Any) -> List[Dict[str, Any]]:
    # Showcase rules for Kumar Textiles (CUST1001)
    if customer.customer_number == "CUST1001":
        return [
            {"product_name": "Working Capital Loan", "propensity": 84, "reason_codes": ["MSME", "TURNOVER_GROWTH", "NEED_CAPTURED_ZRT"]},
            {"product_name": "CGTMSE Collateral-Free Scheme", "propensity": 89, "reason_codes": ["UCO_MSME_QUALIFIED", "NO_COLLATERAL_REQUIRED", "ZRT_WC_NEED"]},
            {"product_name": "POS Merchant Terminal", "propensity": 71, "reason_codes": ["EXPLAIN_POS_COMPLAINT_PENDING"]},
            {"product_name": "Salary Accounts", "propensity": 68, "reason_codes": ["EMPLOYEE_COUNT_45", "NO_SALARY_PRODUCT"]}
        ]
        
    # Showcase rules for ABC Manufacturing (CUST1003)
    if customer.customer_number == "CUST1003":
        return [
            {"product_name": "Mudra Kishor Loan", "propensity": 92, "reason_codes": ["UCO_MSME_QUALIFIED", "MUDRA_SCHEME_CRITERIA_MET"]},
            {"product_name": "Salary Accounts", "propensity": 90, "reason_codes": ["15_RECURRING_SALARY_PAYMENTS", "EMPLOYEE_COUNT_60", "NO_SALARY_PRODUCT"]},
            {"product_name": "Working Capital Loan", "propensity": 75, "reason_codes": ["MSME", "GROWING_TRANSACTIONS"]}
        ]
        
    # Default rule-based calculation
    propensities = []
    
    # Check KCC eligibility first
    kcc_eligible = False
    if hasattr(customer, 'profile') and customer.profile:
        kcc_eligible = getattr(customer.profile, 'kcc_eligible', False)
        
    if kcc_eligible:
        propensities.append({
            "product_name": "Kisan Credit Card (KCC)",
            "propensity": 82,
            "reason_codes": ["AGRICULTURE_SECTOR", "KCC_ELIGIBILITY_VERIFIED"]
        })
    
    # MSME specific products
    if customer.segment == "MSME":
        # Check custom MSME scheme
        scheme = None
        if hasattr(customer, 'profile') and customer.profile:
            scheme = getattr(customer.profile, 'msme_scheme_qualified', None)
        if scheme:
            propensities.append({
                "product_name": scheme,
                "propensity": 85,
                "reason_codes": ["UCO_MSME_QUALIFIED", "SCHEME_CRITERIA_MET"]
            })
        
        propensities.append({
            "product_name": "Working Capital Loan",
            "propensity": 70,
            "reason_codes": ["MSME_SEGMENT", "HIGH_GROWTH"]
        })
        propensities.append({
            "product_name": "POS Merchant Terminal",
            "propensity": 65,
            "reason_codes": ["RETAIL_TRADER", "POS_INQUIRY"]
        })
    else:
        # Retail/Premium specific products
        propensities.append({
            "product_name": "Fixed Deposit",
            "propensity": 60,
            "reason_codes": ["SURPLUS_BALANCE", "PREMIUM_CUSTOMER"]
        })
        propensities.append({
            "product_name": "Credit Card",
            "propensity": 55,
            "reason_codes": ["GOOD_DIGITAL_SCORE"]
        })
        
    return propensities

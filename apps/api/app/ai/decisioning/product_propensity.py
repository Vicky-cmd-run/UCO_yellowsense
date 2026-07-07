from typing import Dict, Any, List

def get_customer_propensities(customer: Any) -> List[Dict[str, Any]]:
    # Showcase rules for Kumar Textiles (CUST1001)
    if customer.customer_number == "CUST1001":
        return [
            {"product_name": "Working Capital Loan", "propensity": 84, "reason_codes": ["MSME", "TURNOVER_GROWTH", "NEED_CAPTURED_ZRT"]},
            {"product_name": "POS Merchant Terminal", "propensity": 71, "reason_codes": ["EXPLAIN_POS_COMPLAINT_PENDING"]},
            {"product_name": "Salary Accounts", "propensity": 68, "reason_codes": ["EMPLOYEE_COUNT_45", "NO_SALARY_PRODUCT"]}
        ]
        
    # Showcase rules for ABC Manufacturing (CUST1003)
    if customer.customer_number == "CUST1003":
        return [
            {"product_name": "Salary Accounts", "propensity": 90, "reason_codes": ["15_RECURRING_SALARY_PAYMENTS", "EMPLOYEE_COUNT_60", "NO_SALARY_PRODUCT"]},
            {"product_name": "Working Capital Loan", "propensity": 75, "reason_codes": ["MSME", "GROWING_TRANSACTIONS"]}
        ]
        
    # Default rule-based calculation
    propensities = []
    
    # MSME specific products
    if customer.segment == "MSME":
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

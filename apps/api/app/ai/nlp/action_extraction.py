from typing import Dict, Any, List

def extract_action_items(text: str) -> Dict[str, Any]:
    txt = text.lower()
    actions = []
    
    if "send" in txt or "email" in txt:
        actions.append("Email terms and eligibility details to customer.")
    if "collect" in txt or "submit" in txt or "gst" in txt:
        actions.append("Collect and upload GST tax returns.")
    if "complaint" in txt or "merchant" in txt:
        actions.append("Coordinate with merchant services to replace card terminal.")
        
    if not actions:
        actions.append("Schedule follow-up review meeting in 30 days.")
        
    return {
        "action_items": actions,
        "model_name": "poc-action-extractor",
        "model_version": "1.0"
    }

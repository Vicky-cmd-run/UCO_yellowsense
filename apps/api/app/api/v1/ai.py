from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any

from app.db.session import get_db
from app.models.models import Customer
from app.api.v1.deps import get_current_user
from app.ai.decisioning.lead_scoring import calculate_lead_score
from app.ai.decisioning.churn_risk import calculate_churn_risk
from app.ai.decisioning.product_propensity import get_customer_propensities
from app.ai.decisioning.next_best_action import generate_next_best_action
from app.ai.nlp.sentiment import analyze_sentiment
from app.ai.nlp.query_routing import route_query_intent
from app.ai.nlp.action_extraction import extract_action_items

router = APIRouter()

# Schemas for inputs
class AICustomerInput(BaseModel):
    customer_id: str

class AITextInput(BaseModel):
    text: str

@router.post("/lead-score")
def get_ai_lead_score(data: AICustomerInput, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return calculate_lead_score(customer)

@router.post("/churn-risk")
def get_ai_churn_risk(data: AICustomerInput, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return calculate_churn_risk(customer)

@router.post("/product-propensity")
def get_ai_product_propensity(data: AICustomerInput, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return get_customer_propensities(customer)

@router.post("/next-best-action")
def get_ai_next_best_action(data: AICustomerInput, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_444_NOT_FOUND, detail="Customer not found")
    return generate_next_best_action(customer, db)

@router.post("/query-route")
def get_ai_query_route(data: AITextInput):
    return route_query_intent(data.text)

@router.post("/meeting-summary")
def get_ai_meeting_summary(data: AITextInput):
    sentiment_res = analyze_sentiment(data.text)
    action_res = extract_action_items(data.text)
    
    # Generate simple summary
    summary = "Meeting summary: " + (data.text[:100] + "..." if len(data.text) > 100 else data.text)
    
    return {
        "summary": summary,
        "sentiment": sentiment_res["sentiment"],
        "action_items": action_res["action_items"],
        "concerns": ["Rate pricing", "Timeline expectation"] if "interest" in data.text.lower() else []
    }

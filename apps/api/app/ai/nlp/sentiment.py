from typing import Dict, Any

def analyze_sentiment(text: str) -> Dict[str, Any]:
    txt = text.lower()
    sentiment = "NEUTRAL"
    score = 0.5
    
    positive_words = ["happy", "good", "satisfied", "great", "excellent", "thanks", "helpful", "positive", "growth"]
    negative_words = ["angry", "bad", "unresolved", "delay", "poor", "unhappy", "fail", "error", "issue", "complaint", "negative"]
    
    pos_count = sum(1 for w in positive_words if w in txt)
    neg_count = sum(1 for w in negative_words if w in txt)
    
    if pos_count > neg_count:
        sentiment = "POSITIVE"
        score = 0.8
    elif neg_count > pos_count:
        sentiment = "NEGATIVE"
        score = 0.2
        
    return {
        "sentiment": sentiment,
        "confidence": score * 100,
        "model_name": "poc-sentiment-analysis",
        "model_version": "1.0"
    }

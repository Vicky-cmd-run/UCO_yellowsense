import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from app.main import app
from app.db.session import SessionLocal, Base, engine
from app.models.models import User, Customer, Visit, Lead, Complaint, AuditEvent
from app.core.security import get_password_hash

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    # Make sure tables are created
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if test user exists
    test_user = db.query(User).filter(User.employee_id == "TEST_RM").first()
    if not test_user:
        hashed_pwd = get_password_hash("password123")
        test_user = User(
            name="Test RM",
            employee_id="TEST_RM",
            email="test.rm@yellowsensebank.com",
            role="RM",
            branch_id="Test Branch",
            region_id="Test Region",
            hashed_password=hashed_pwd,
            status="ACTIVE"
        )
        db.add(test_user)
        
    # Check if test customer exists
    test_cust = db.query(Customer).filter(Customer.customer_number == "TEST_CUST").first()
    if not test_cust:
        test_cust = Customer(
            customer_number="TEST_CUST",
            full_name="Test Customer Pvt Ltd",
            customer_type="CORPORATE",
            segment="MSME",
            lifecycle_stage="ACTIVE",
            mobile="9000012345",
            email="test@customer.com",
            city="Chennai",
            state="Tamil Nadu",
            branch_id="Test Branch",
            relationship_value=1200000.0,
            relationship_tenure_months=24,
            digital_engagement_score=75,
            sentiment="NEUTRAL",
            churn_risk=30,
            lead_propensity=60
        )
        db.add(test_cust)
        
    db.commit()
    db.close()
    yield

def get_auth_token():
    # Login as RM
    res = client.post("/api/v1/auth/login-json", json={
        "email": "test.rm@yellowsensebank.com",
        "password": "password123"
    })
    assert res.status_code == 200
    return res.json()["access_token"]

def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

def test_customer_retrieval():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/customers", headers=headers)
    assert res.status_code == 200
    customers = res.json()
    assert len(customers) > 0
    
    # Check specific test customer
    test_cust = next(c for c in customers if c["customer_number"] == "TEST_CUST")
    assert test_cust["full_name"] == "Test Customer Pvt Ltd"

def test_lead_creation():
    db = SessionLocal()
    test_cust = db.query(Customer).filter(Customer.customer_number == "TEST_CUST").first()
    cust_id = test_cust.id
    db.close()
    
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.post("/api/v1/leads", headers=headers, json={
        "customer_id": cust_id,
        "source": "ZRT",
        "product": "MSME Loan",
        "potential_value": 1500000.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["product"] == "MSME Loan"
    assert data["potential_value"] == 1500000.0
    assert data["stage"] == "New"

def test_lead_stage_transition():
    db = SessionLocal()
    lead = db.query(Lead).first()
    lead_id = lead.id
    db.close()
    
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.patch(f"/api/v1/leads/{lead_id}/stage", headers=headers, json={
        "stage": "Contacted"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["stage"] == "Contacted"

def test_ai_scoring_and_nba():
    db = SessionLocal()
    test_cust = db.query(Customer).filter(Customer.customer_number == "TEST_CUST").first()
    cust_id = test_cust.id
    db.close()
    
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test Lead Scoring
    res = client.post("/api/v1/ai/lead-score", headers=headers, json={
        "customer_id": cust_id
    })
    assert res.status_code == 200
    data = res.json()
    assert "score" in data
    assert "band" in data
    
    # Test Next Best Action
    res = client.post("/api/v1/ai/next-best-action", headers=headers, json={
        "customer_id": cust_id
    })
    assert res.status_code == 200
    nba = res.json()
    assert "action" in nba
    assert "confidence" in nba

def test_ocr_scan_and_travel_validation():
    db = SessionLocal()
    test_cust = db.query(Customer).filter(Customer.customer_number == "TEST_CUST").first()
    cust_id = test_cust.id
    db.close()
    
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Test OCR Document Scan
    ocr_res = client.post("/api/v1/visits/ocr-scan", headers=headers, json={
        "document_type": "Business PAN Card",
        "file_name": "business_pan.pdf",
        "customer_id": cust_id
    })
    assert ocr_res.status_code == 200
    ocr_data = ocr_res.json()
    assert ocr_data["status"] == "VERIFIED"
    assert ocr_data["confidence"] == 98.6
    assert "pan_number" in ocr_data["extracted_fields"]
    
    # Test OCR Fraud Block (keywords in file name)
    ocr_fraud = client.post("/api/v1/visits/ocr-scan", headers=headers, json={
        "document_type": "Business PAN Card",
        "file_name": "sebi_warning_blacklist.pdf",
        "customer_id": cust_id
    })
    assert ocr_fraud.status_code == 200
    assert ocr_fraud.json()["status"] == "FRAUD_ALERT"
    assert ocr_fraud.json()["confidence"] == 45.0
    
    # 2. Test Travel Claim validation
    # First, schedule a visit and check in to get a visit record
    sched_res = client.post("/api/v1/visits", headers=headers, json={
        "customer_id": cust_id,
        "purpose": "MSME Audit",
        "scheduled_at": (datetime.utcnow() + timedelta(days=1)).isoformat()
    })
    assert sched_res.status_code == 200
    visit_id = sched_res.json()["id"]
    
    # Check in
    checkin_res = client.post(f"/api/v1/visits/{visit_id}/check-in", headers=headers, json={
        "latitude": 12.9716,
        "longitude": 77.5946
    })
    assert checkin_res.status_code == 200
    
    # Complete/check-out with claimed distance that exceeds by >20%
    complete_res = client.post(f"/api/v1/visits/{visit_id}/complete", headers=headers, json={
        "need_assessment": {
            "working_capital_need": True,
            "term_loan_need": False,
            "pos_qr_need": False,
            "salary_account_need": False,
            "insurance_need": False,
            "notes": "Testing notes"
        },
        "notes": "Testing completion",
        "checkout_latitude": 12.9816, # approx 1.5 km straight-line distance
        "checkout_longitude": 77.6026,
        "claimed_distance_km": 15.0, # Claim is 10x computed (15.0 vs 1.5), triggers variance
        "claimed_duration_mins": 120.0,
        "declared_route": "Central Branch -> Ambattur Office -> Client Office"
    })
    assert complete_res.status_code == 200
    visit_data = complete_res.json()
    assert visit_data["variance_flag"] is True
    assert visit_data["claimed_distance_km"] == 15.0
    assert visit_data["system_distance_km"] > 0.0
    
    # 3. Test Cryptographic Audit Verification
    verify_res = client.get("/api/v1/audit/verify", headers=headers)
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["chain_valid"] is True
    assert verify_data["verified_count"] > 0

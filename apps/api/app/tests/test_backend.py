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

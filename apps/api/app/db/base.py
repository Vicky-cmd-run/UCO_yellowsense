# Import all models so that Base has them before being imported by Alembic
from app.db.session import Base
from app.models.models import (
    User,
    Customer,
    CustomerProfile,
    Account,
    ProductHolding,
    Interaction,
    Visit,
    NeedAssessment,
    Lead,
    Opportunity,
    Meeting,
    Complaint,
    Query,
    Consent,
    AIRecommendation,
    AuditEvent,
)

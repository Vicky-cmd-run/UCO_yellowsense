# Expose all routers to app.main
from app.api.v1 import auth
from app.api.v1 import customers
from app.api.v1 import visits
from app.api.v1 import leads
from app.api.v1 import meetings
from app.api.v1 import complaints
from app.api.v1 import queries
from app.api.v1 import notifications
from app.api.v1 import analytics
from app.api.v1 import ai
from app.api.v1 import audit

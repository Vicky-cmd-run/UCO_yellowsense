# YellowSense Customer 360

Unified AI-Powered Customer Growth, Field Mobilization & Relationship Intelligence Platform.

YellowSense Customer 360 acts as a unified intelligence and orchestration layer above the bank's core transactional systems. It aggregates customer data from multiple sources (Core Banking, Loan Origination, Cards, UPI, Deposits) to present a consolidated, real-time view of customer relationships.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Python**: Version 3.12+ (tested on Python 3.14)
- **Node.js**: Version 20+
- **Docker & Docker Compose**: Needed for PostgreSQL/container execution.

### Local Installation (No Docker)
1.  **Clone / Set up the workspace**:
    ```bash
    git clone <repo-url>
    cd UCO
    ```
2.  **Install Frontend dependencies**:
    ```bash
    cd apps/web
    npm install
    cd ../..
    ```
3.  **Set up Virtual Environment & Install Backend dependencies**:
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -e apps/api
    pip install pytest pytest-asyncio
    ```
4.  **Seed the Database**:
    ```bash
    source .venv/bin/activate
    python3 scripts/seed_demo_data.py --reset
    ```
5.  **Run Development Servers**:
    -   Run Backend (port 8000):
        ```bash
        source .venv/bin/activate
        make run-backend
        ```
    -   Run Frontend (port 3000):
        ```bash
        make run-frontend
        ```

### Docker Setup
To launch the entire platform in containerized mode (PostgreSQL, Redis, FastAPI backend, Next.js frontend):
```bash
docker-compose up --build -d
```
The services will be available at:
-   **Frontend**: `http://localhost:3000`
-   **Backend / OpenAPI**: `http://localhost:8000/docs`

---

## 👥 Demo Personas (Password: `password123`)

| Persona Name | Role | Primary Workspace | Specialization / Region |
|---|---|---|---|
| **Arjun Rao** | ZRT Officer | `/zrt` | Chennai Central |
| **Priya Nair** | Relationship Manager | `/rm` | MSME |
| **Vikram Shah** | Virtual RM | `/vrm` | National |
| **Meera Iyer** | Branch Manager | `/executive` | Chennai Central |
| **Rahul Menon** | Regional Head | `/executive` | South Region |
| **Ananya Kapoor** | Head Office Executive | `/executive` | National |

---

## 📈 Golden Demo Journey 1 (ZRT to RM to Branch Manager)
1.  **Login**: Choose **Arjun Rao** (ZRT Officer).
2.  **Visits**: Open "Today's Visits", select **Kumar Textiles Pvt Ltd**, and click "Start Visit" (geofencing check-in matches coordinates).
3.  **Need Assessment**: Complete checklist:
    -   *Working Capital*: Yes
    -   *Term Loan / Expansion*: Yes
    -   *POS merchant issue*: Yes
4.  **AI Telemetry**: Notice the AI Propensity update: *Expansion propensity (84%)*, *Lead conversion probability (87%)*. Click "Create Lead" for ₹25L. System recommends **Priya Nair** as owner.
5.  **RM Action**: Switch role to **Priya Nair**. The ₹25L lead is in her Priority Queue.
6.  **Customer 360**: Open Kumar Textiles. Review the AI Next Best Action: *"Resolve open POS complaint, then schedule expansion consultation."* Click "Accept Recommendation".
7.  **Meetings Intel**: Open Meeting tab, click "Generate Meeting Intelligence" to extract action items, summaries, and sentiment from the discussion transcript. Advance the lead stage.
8.  **Management Dashboard**: Switch role to **Meera Iyer** (Branch Manager) to check the Executive Dashboard reflecting the newly mobilized pipeline.

---

## 🧪 Testing Commands

-   **Run Backend Tests**:
    ```bash
    source .venv/bin/activate
    pytest apps/api/app/tests/test_backend.py
    ```
-   **Run Type Checks (Frontend)**:
    ```bash
    cd apps/web && npx tsc --noEmit
    ```

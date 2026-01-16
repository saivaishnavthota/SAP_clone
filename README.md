# SAP ERP Demo System

A demo-grade SAP-like ERP application with three core modules (Plant Maintenance, Materials Management, and Finance) that integrate with a MuleSoft Anypoint Platform clone. Features an **authentic SAP Fiori/SAP GUI-inspired interface**.

## Features

- **Authentic SAP UI**: Professional SAP Fiori & SAP GUI Classic design system
- **Unified Ticketing System**: Cross-module ticket management with SLA tracking
- **Plant Maintenance (PM)**: Asset management, maintenance orders, incident tracking
- **Materials Management (MM)**: Inventory control, auto-reorder, purchase requisitions
- **Finance (FI)**: Cost centers, cost tracking, approval workflows
- **Integration Layer**: Kong API Gateway + Apache Camel for event routing
- **Observability**: Prometheus metrics + Grafana dashboards

## 🎨 SAP UI Design

The frontend features an authentic SAP interface with:
- SAP Shell Navigation with hierarchical menus
- SAP GUI Classic components (tabs, sections, toolbars)
- SAP Fiori modern cards and layouts
- Authentic SAP color palette (Belize theme)
- Status indicators and badges
- Professional data tables and forms

**See the UI in action**: Open `frontend/public/sap-ui-demo.html` in your browser!

**Documentation**:
- [SAP UI Guide](frontend/SAP_UI_GUIDE.md) - Complete style guide
- [Quick Start](frontend/QUICK_START_SAP_UI.md) - Developer reference
- [Features](frontend/SAP_UI_FEATURES.md) - Detailed feature documentation

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)

### Start All Services

```bash
# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Wait for services to be healthy
docker-compose ps
```

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | See demo users below |
| Backend API | http://localhost:8000 | - |
| Kong Gateway | http://localhost:8080 | - |
| API Docs | http://localhost:8000/docs | - |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3001 | admin/admin |

### Demo Users

| Username | Password | Role |
|----------|----------|------|
| engineer | engineer123 | Maintenance Engineer (PM access) |
| manager | manager123 | Store Manager (MM access) |
| finance | finance123 | Finance Officer (FI access) |
| admin | admin123 | Admin (all access) |

## Demo Flows

### 1. Plant Maintenance Flow

1. Login as `engineer`
2. Create an asset (substation, transformer, or feeder)
3. Report an incident on the asset
4. View the generated ticket in the worklist

### 2. Materials Management Flow

1. Login as `manager`
2. View material inventory
3. Process a stock transaction (issue materials)
4. If stock falls below reorder level, auto-reorder ticket is created

### 3. Finance Approval Flow

1. Login as `finance`
2. View pending approval requests
3. Approve or reject requests
4. View cost entries by cost center

## API Documentation

Full API documentation is available at http://localhost:8000/docs when the backend is running.

### Key Endpoints

- `POST /api/v1/auth/login` - Authenticate and get JWT token
- `GET /api/v1/tickets` - List all tickets with filtering
- `POST /api/v1/pm/assets` - Create a new asset
- `POST /api/v1/mm/stock-transactions` - Process stock transaction
- `POST /api/v1/fi/approval-requests` - Create approval request

## Development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Run Tests

```bash
cd backend
pytest tests/property/ -v
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│    Kong     │────▶│   Backend   │
│   (React)   │     │  (Gateway)  │     │  (FastAPI)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                    ┌─────────────┐             │
                    │   Camel     │◀────────────┘
                    │ (Integration)│
                    └─────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  ITSM Mock  │     │  ERP Mock   │     │  CRM Mock   │
│  (PM events)│     │ (MM events) │     │ (FI events) │
└─────────────┘     └─────────────┘     └─────────────┘
```

## License

MIT License - Demo purposes only.

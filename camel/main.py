"""Apache Camel-like integration router (simplified Python implementation)"""
from fastapi import FastAPI, Request
import httpx
import os

app = FastAPI(title="SAP ERP Integration Router")

ITSM_MOCK_URL = os.getenv("ITSM_MOCK_URL", "http://itsm-mock:8082")
ERP_MOCK_URL = os.getenv("ERP_MOCK_URL", "http://erp-mock:8083")
CRM_MOCK_URL = os.getenv("CRM_MOCK_URL", "http://crm-mock:8084")

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/webhook")
async def route_event(request: Request):
    """Route events to appropriate mock endpoints based on event_type prefix"""
    event = await request.json()
    event_type = event.get("event_type", "")
    
    async with httpx.AsyncClient() as client:
        if event_type.startswith("PM_"):
            await client.post(f"{ITSM_MOCK_URL}/tickets", json=event)
        elif event_type.startswith("MM_"):
            await client.post(f"{ERP_MOCK_URL}/inventory", json=event)
        elif event_type.startswith("FI_"):
            await client.post(f"{CRM_MOCK_URL}/approvals", json=event)
    
    return {"status": "routed", "event_type": event_type}

"""
Integration Endpoints API routes.
SAP ERP API - For Camel flows and external system integration
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Depends, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
import xml.etree.ElementTree as ET

from backend.db.database import get_db
from backend.services.electricity_service import ElectricityService, ElectricityLoadRequest


router = APIRouter(prefix="/integration", tags=["Integration"])


# Request/Response Models

class ChangeRecord(BaseModel):
    entity_type: str
    entity_id: str
    change_type: str  # created, updated, deleted
    changed_at: str
    changed_by: str
    changes: dict


class ChangesResponse(BaseModel):
    entity: str
    since: str
    records: List[ChangeRecord]
    total: int
    has_more: bool


class BulkExportRequest(BaseModel):
    entity_type: str  # orders, customers, materials, invoices
    filters: Optional[dict] = None
    fields: Optional[List[str]] = None
    format: str = "json"


class BulkExportResponse(BaseModel):
    export_id: str
    entity_type: str
    record_count: int
    status: str
    download_url: Optional[str]
    created_at: str


class WebhookPayload(BaseModel):
    event_type: str
    entity_type: str
    entity_id: str
    timestamp: str
    data: dict


class WebhookResponse(BaseModel):
    received: bool
    webhook_id: str
    processed_at: str
    status: str


class ElectricityLoadRequestPayload(BaseModel):
    """Electricity load enhancement request from MuleSoft"""
    request_id: str = Field(..., alias="RequestID")
    customer_id: str = Field(..., alias="CustomerID")
    current_load: float = Field(..., alias="CurrentLoad")
    requested_load: float = Field(..., alias="RequestedLoad")
    connection_type: str = Field(..., alias="ConnectionType")
    city: str = Field(..., alias="City")
    pin_code: str = Field(..., alias="PinCode")
    
    class Config:
        populate_by_name = True


class ElectricityLoadResponse(BaseModel):
    status: str
    request_id: str
    customer_id: str
    estimated_cost: float
    priority: str
    tickets_created: dict
    workflow_status: str
    next_steps: List[str]


# Demo change tracking - matches actual data
_change_log = [
    {
        "entity_type": "orders",
        "entity_id": "SO-2024-00001",
        "change_type": "created",
        "changed_at": "2026-01-10T10:30:00Z",
        "changed_by": "admin",
        "changes": {"status": "new", "customer_id": "CUST-001", "total_amount": 12500.00},
    },
    {
        "entity_type": "orders",
        "entity_id": "SO-2024-00001",
        "change_type": "updated",
        "changed_at": "2026-01-11T14:00:00Z",
        "changed_by": "admin",
        "changes": {"status": {"from": "new", "to": "processing"}},
    },
    {
        "entity_type": "orders",
        "entity_id": "SO-2024-00002",
        "change_type": "created",
        "changed_at": "2026-01-12T09:00:00Z",
        "changed_by": "admin",
        "changes": {"status": "new", "customer_id": "CUST-002", "total_amount": 45000.00},
    },
    {
        "entity_type": "customers",
        "entity_id": "CUST-003",
        "change_type": "created",
        "changed_at": "2026-01-14T09:00:00Z",
        "changed_by": "admin",
        "changes": {"name": "StartUp Ventures", "credit_limit": 50000.00},
    },
    {
        "entity_type": "materials",
        "entity_id": "MAT-001",
        "change_type": "updated",
        "changed_at": "2026-01-15T10:30:00Z",
        "changed_by": "manager",
        "changes": {"quantity": {"from": 300, "to": 500}},
    },
]

_export_counter = 1
_webhook_counter = 1


@router.get("/changes", response_model=ChangesResponse)
async def get_changed_records(
    entity: str = Query(..., description="Entity type: orders, customers, materials, invoices"),
    since: str = Query(..., description="ISO timestamp to get changes since"),
    limit: int = Query(100, ge=1, le=1000),
):
    """
    Get changed records since a timestamp.
    Used for incremental sync with external systems.
    """
    # Filter changes by entity and timestamp
    filtered = [
        c for c in _change_log
        if c["entity_type"] == entity and c["changed_at"] >= since
    ]
    
    has_more = len(filtered) > limit
    records = filtered[:limit]
    
    return ChangesResponse(
        entity=entity,
        since=since,
        records=[ChangeRecord(**r) for r in records],
        total=len(records),
        has_more=has_more,
    )


@router.post("/bulk-export", response_model=BulkExportResponse)
async def bulk_data_export(request: BulkExportRequest):
    """
    Initiate bulk data export for integration.
    Returns export job ID for async processing.
    """
    global _export_counter
    
    valid_entities = ["orders", "customers", "materials", "invoices", "vendors"]
    if request.entity_type not in valid_entities:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid entity type. Must be one of: {valid_entities}"
        )
    
    export_id = f"EXP-{_export_counter:06d}"
    _export_counter += 1
    
    # In production, this would queue an async job
    return BulkExportResponse(
        export_id=export_id,
        entity_type=request.entity_type,
        record_count=0,  # Would be populated after export completes
        status="processing",
        download_url=None,
        created_at=datetime.now().isoformat(),
    )


@router.post("/webhook", response_model=WebhookResponse)
async def receive_webhook(payload: WebhookPayload):
    """
    Receive webhooks from external systems.
    Used for real-time sync and event processing.
    """
    global _webhook_counter
    
    webhook_id = f"WH-{_webhook_counter:06d}"
    _webhook_counter += 1
    
    # Log the webhook for processing
    # In production, this would queue for async processing
    
    return WebhookResponse(
        received=True,
        webhook_id=webhook_id,
        processed_at=datetime.now().isoformat(),
        status="accepted",
    )


@router.get("/sync-status")
async def get_sync_status(
    system: Optional[str] = None,
):
    """Get synchronization status with external systems."""
    statuses = [
        {
            "system": "crm",
            "last_sync": "2024-01-15T15:30:00Z",
            "status": "healthy",
            "records_synced": 1250,
            "errors": 0,
        },
        {
            "system": "itsm",
            "last_sync": "2024-01-15T15:25:00Z",
            "status": "healthy",
            "records_synced": 450,
            "errors": 2,
        },
    ]
    
    if system:
        statuses = [s for s in statuses if s["system"] == system]
    
    return {"sync_statuses": statuses}


@router.post("/mulesoft/load-request", response_model=ElectricityLoadResponse)
async def receive_electricity_load_request(
    payload: ElectricityLoadRequestPayload,
    db: AsyncSession = Depends(get_db),
):
    """
    Receive electricity load enhancement request from MuleSoft.
    
    This endpoint processes load enhancement requests and:
    - Creates PM ticket for field work order
    - Creates FI ticket for cost approval (if needed)
    - Creates MM ticket for equipment procurement (if needed)
    - Initiates approval workflow
    - Returns estimated cost and timeline
    """
    try:
        electricity_service = ElectricityService(db)
        
        load_request = ElectricityLoadRequest(
            request_id=payload.request_id,
            customer_id=payload.customer_id,
            current_load=payload.current_load,
            requested_load=payload.requested_load,
            connection_type=payload.connection_type,
            city=payload.city,
            pin_code=payload.pin_code,
        )
        
        result = await electricity_service.process_load_request(load_request)
        
        return ElectricityLoadResponse(**result)
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process load request: {str(e)}"
        )


@router.post("/mulesoft/load-request/xml", response_model=ElectricityLoadResponse)
async def receive_electricity_load_request_xml(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Receive electricity load enhancement request from MuleSoft in XML format.
    
    Accepts XML payload like:
    ```xml
    <ElectricityLoadRequest>
        <RequestID>SF-REQ-10021</RequestID>
        <CustomerID>CUST-88991</CustomerID>
        <CurrentLoad>5</CurrentLoad>
        <RequestedLoad>10</RequestedLoad>
        <ConnectionType>RESIDENTIAL</ConnectionType>
        <City>Hyderabad</City>
        <PinCode>500081</PinCode>
    </ElectricityLoadRequest>
    ```
    """
    try:
        # Read XML from request body
        xml_payload = await request.body()
        xml_string = xml_payload.decode('utf-8')
        
        # Parse XML
        root = ET.fromstring(xml_string)
        
        # Extract fields
        request_id = root.find("RequestID").text
        customer_id = root.find("CustomerID").text
        current_load = float(root.find("CurrentLoad").text)
        requested_load = float(root.find("RequestedLoad").text)
        connection_type = root.find("ConnectionType").text
        city = root.find("City").text
        pin_code = root.find("PinCode").text
        
        electricity_service = ElectricityService(db)
        
        load_request = ElectricityLoadRequest(
            request_id=request_id,
            customer_id=customer_id,
            current_load=current_load,
            requested_load=requested_load,
            connection_type=connection_type,
            city=city,
            pin_code=pin_code,
        )
        
        result = await electricity_service.process_load_request(load_request)
        
        return ElectricityLoadResponse(**result)
    
    except ET.ParseError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid XML format: {str(e)}"
        )
    except AttributeError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required XML field: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process load request: {str(e)}"
        )


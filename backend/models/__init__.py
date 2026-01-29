# SQLAlchemy models package

# Core models
from backend.models.ticket_models import (
    Ticket,
    AuditEntry,
    TicketType,
    TicketStatus,
    Priority,
    Module,
)

# PM models
from backend.models.pm_models import (
    Asset,
    MaintenanceOrder,
    PMIncident,
    AssetType,
    AssetStatus,
    OrderType,
    OrderStatus,
    FaultType,
)

# MM models
from backend.models.mm_models import (
    Material,
    StockTransaction,
    MMRequisition,
    TransactionType,
    RequisitionStatus,
)

# FI models
from backend.models.fi_models import (
    CostCenter,
    CostEntry,
    FIApproval,
    CostType,
    ApprovalDecision,
)

# PM Workflow models (6-screen workflow)
from backend.models.pm_workflow_models import (
    WorkflowMaintenanceOrder,
    WorkflowOperation,
    WorkflowComponent,
    WorkflowPurchaseOrder,
    WorkflowGoodsReceipt,
    WorkflowGoodsIssue,
    WorkflowConfirmation,
    WorkflowMalfunctionReport,
    WorkflowDocumentFlow,
    WorkflowCostSummary,
    WorkflowOrderType,
    WorkflowOrderStatus,
    Priority as WorkflowPriority,
    OperationStatus,
    POType,
    POStatus,
    ConfirmationType,
    DocumentType,
)

__all__ = [
    # Core
    "Ticket",
    "AuditEntry",
    "TicketType",
    "TicketStatus",
    "Priority",
    "Module",
    # PM
    "Asset",
    "MaintenanceOrder",
    "PMIncident",
    "AssetType",
    "AssetStatus",
    "OrderType",
    "OrderStatus",
    "FaultType",
    # MM
    "Material",
    "StockTransaction",
    "MMRequisition",
    "TransactionType",
    "RequisitionStatus",
    # FI
    "CostCenter",
    "CostEntry",
    "FIApproval",
    "CostType",
    "ApprovalDecision",
    # PM Workflow
    "WorkflowMaintenanceOrder",
    "WorkflowOperation",
    "WorkflowComponent",
    "WorkflowPurchaseOrder",
    "WorkflowGoodsReceipt",
    "WorkflowGoodsIssue",
    "WorkflowConfirmation",
    "WorkflowMalfunctionReport",
    "WorkflowDocumentFlow",
    "WorkflowCostSummary",
    "WorkflowOrderType",
    "WorkflowOrderStatus",
    "WorkflowPriority",
    "OperationStatus",
    "POType",
    "POStatus",
    "ConfirmationType",
    "DocumentType",
]

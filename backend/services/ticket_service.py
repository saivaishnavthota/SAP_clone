"""
Ticket Service for unified ticket management across all modules.
Requirements: 1.1, 1.2, 1.3, 1.4, 1.5 - Ticket CRUD, ID generation, SLA, state machine
"""
from datetime import datetime, date
from typing import Optional, List, Tuple
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.ticket_models import (
    Ticket, AuditEntry, TicketType, TicketStatus, Priority, Module
)
from backend.services.ticket_utils import (
    generate_ticket_id, calculate_sla_deadline, is_valid_ticket_type
)


# Valid state transitions - Requirement 1.5
VALID_TRANSITIONS = {
    TicketStatus.OPEN: {TicketStatus.ASSIGNED},
    TicketStatus.ASSIGNED: {TicketStatus.IN_PROGRESS},
    TicketStatus.IN_PROGRESS: {TicketStatus.CLOSED},
    TicketStatus.CLOSED: set(),  # No transitions from Closed
}


class TicketServiceError(Exception):
    """Base exception for ticket service errors"""
    pass


class InvalidStateTransitionError(TicketServiceError):
    """Raised when an invalid state transition is attempted"""
    pass


class TicketNotFoundError(TicketServiceError):
    """Raised when a ticket is not found"""
    pass


def is_valid_transition(current_status: TicketStatus, new_status: TicketStatus) -> bool:
    """
    Check if a state transition is valid.
    Requirement 1.5 - Enforce valid state transitions: Open → Assigned → In_Progress → Closed
    """
    valid_next_states = VALID_TRANSITIONS.get(current_status, set())
    return new_status in valid_next_states


class TicketService:
    """
    Service class for ticket operations.
    Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
    """
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def _get_next_sequence(self, module: Module, ticket_date: date) -> int:
        """Get the next sequence number for a module on a given date."""
        date_str = ticket_date.strftime("%Y%m%d")
        prefix = f"TKT-{module.value}-{date_str}-"
        
        result = await self.session.execute(
            select(func.count(Ticket.ticket_id))
            .where(Ticket.ticket_id.like(f"{prefix}%"))
        )
        count = result.scalar() or 0
        return count + 1
    
    async def create_ticket(
        self,
        module: Module,
        ticket_type: TicketType,
        priority: Priority,
        title: str,
        created_by: str,
        description: Optional[str] = None,
        correlation_id: Optional[str] = None,
    ) -> Ticket:
        """
        Create a new ticket with auto-generated ID and SLA deadline.
        Requirements: 1.1, 1.2, 1.3
        """
        if not is_valid_ticket_type(ticket_type):
            raise TicketServiceError(f"Invalid ticket type: {ticket_type}")
        
        created_at = datetime.utcnow()
        sequence = await self._get_next_sequence(module, created_at.date())
        ticket_id = generate_ticket_id(module, created_at, sequence)
        sla_deadline = calculate_sla_deadline(priority, created_at)
        
        ticket = Ticket(
            ticket_id=ticket_id,
            ticket_type=ticket_type,
            module=module,
            priority=priority,
            status=TicketStatus.OPEN,
            title=title,
            description=description,
            sla_deadline=sla_deadline,
            created_at=created_at,
            created_by=created_by,
            correlation_id=correlation_id,
        )
        
        self.session.add(ticket)
        await self.session.flush()
        return ticket

    
    async def get_ticket(self, ticket_id: str) -> Optional[Ticket]:
        """Get a ticket by ID."""
        result = await self.session.execute(
            select(Ticket).where(Ticket.ticket_id == ticket_id)
        )
        return result.scalar_one_or_none()
    
    async def get_ticket_or_raise(self, ticket_id: str) -> Ticket:
        """Get a ticket by ID or raise TicketNotFoundError."""
        ticket = await self.get_ticket(ticket_id)
        if not ticket:
            raise TicketNotFoundError(f"Ticket not found: {ticket_id}")
        return ticket
    
    async def list_tickets(
        self,
        module: Optional[Module] = None,
        status: Optional[TicketStatus] = None,
        priority: Optional[Priority] = None,
        ticket_type: Optional[TicketType] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> Tuple[List[Ticket], int]:
        """
        List tickets with optional filtering.
        Returns tuple of (tickets, total_count).
        """
        query = select(Ticket)
        count_query = select(func.count(Ticket.ticket_id))
        
        if module:
            query = query.where(Ticket.module == module)
            count_query = count_query.where(Ticket.module == module)
        if status:
            query = query.where(Ticket.status == status)
            count_query = count_query.where(Ticket.status == status)
        if priority:
            query = query.where(Ticket.priority == priority)
            count_query = count_query.where(Ticket.priority == priority)
        if ticket_type:
            query = query.where(Ticket.ticket_type == ticket_type)
            count_query = count_query.where(Ticket.ticket_type == ticket_type)
        
        query = query.order_by(Ticket.created_at.desc()).limit(limit).offset(offset)
        
        result = await self.session.execute(query)
        tickets = list(result.scalars().all())
        
        count_result = await self.session.execute(count_query)
        total = count_result.scalar() or 0
        
        return tickets, total
    
    async def update_status(
        self,
        ticket_id: str,
        new_status: TicketStatus,
        changed_by: str,
        comment: Optional[str] = None,
    ) -> Tuple[Ticket, AuditEntry]:
        """
        Update ticket status with state machine validation and audit trail.
        Requirements: 1.4, 1.5
        """
        ticket = await self.get_ticket_or_raise(ticket_id)
        previous_status = ticket.status
        
        if not is_valid_transition(previous_status, new_status):
            raise InvalidStateTransitionError(
                f"Invalid transition from {previous_status.value} to {new_status.value}. "
                f"Valid transitions: {[s.value for s in VALID_TRANSITIONS.get(previous_status, set())]}"
            )
        
        # Update ticket status
        ticket.status = new_status
        ticket.updated_at = datetime.utcnow()
        
        # Create audit entry - Requirement 1.4
        audit_entry = AuditEntry(
            ticket_id=ticket_id,
            previous_status=previous_status,
            new_status=new_status,
            changed_by=changed_by,
            changed_at=datetime.utcnow(),
            comment=comment,
        )
        
        self.session.add(audit_entry)
        await self.session.flush()
        
        return ticket, audit_entry
    
    async def assign_ticket(
        self,
        ticket_id: str,
        assigned_to: str,
        changed_by: str,
        comment: Optional[str] = None,
    ) -> Tuple[Ticket, AuditEntry]:
        """Assign a ticket to a user and transition to Assigned status."""
        ticket = await self.get_ticket_or_raise(ticket_id)
        ticket.assigned_to = assigned_to
        
        return await self.update_status(
            ticket_id=ticket_id,
            new_status=TicketStatus.ASSIGNED,
            changed_by=changed_by,
            comment=comment or f"Assigned to {assigned_to}",
        )
    
    async def get_audit_trail(self, ticket_id: str) -> List[AuditEntry]:
        """Get the audit trail for a ticket."""
        result = await self.session.execute(
            select(AuditEntry)
            .where(AuditEntry.ticket_id == ticket_id)
            .order_by(AuditEntry.changed_at)
        )
        return list(result.scalars().all())

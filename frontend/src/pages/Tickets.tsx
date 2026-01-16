/**
 * Tickets Page
 * Requirement 8.2 - Ticket worklist
 */
import React from 'react';
import TicketWorklist from '../components/TicketWorklist';

const Tickets: React.FC = () => {
  return (
    <div>
      <h2 style={{ marginBottom: '16px' }}>All Tickets</h2>
      <TicketWorklist />
    </div>
  );
};

export default Tickets;

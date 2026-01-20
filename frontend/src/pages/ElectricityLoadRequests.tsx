/**
 * Electricity Load Requests Page
 * View and manage electricity load enhancement requests and their tickets
 */
import React, { useState, useEffect } from 'react';
import { ticketsApi } from '../services/api';
import axios from 'axios';

interface Ticket {
  ticket_id: string;
  ticket_type: string;
  module: string;
  priority: string;
  status: string;
  title: string;
  description?: string;
  sla_deadline: string;
  created_at: string;
  created_by: string;
  correlation_id?: string;
}

interface LoadRequestForm {
  request_id: string;
  customer_id: string;
  current_load: number;
  requested_load: number;
  connection_type: 'RESIDENTIAL' | 'COMMERCIAL';
  city: string;
  pin_code: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  Open: { bg: '#e6f7ff', text: '#1890ff' },
  Assigned: { bg: '#fffbe6', text: '#faad14' },
  In_Progress: { bg: '#fff7e6', text: '#fa8c16' },
  Closed: { bg: '#f6ffed', text: '#52c41a' },
};

const priorityColors: Record<string, string> = {
  P1: '#ff4d4f',
  P2: '#fa8c16',
  P3: '#faad14',
  P4: '#52c41a',
};

const ElectricityLoadRequests: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCorrelationId, setSelectedCorrelationId] = useState<string | null>(null);
  const [form, setForm] = useState<LoadRequestForm>({
    request_id: `SF-REQ-${Date.now()}`,
    customer_id: '',
    current_load: 5,
    requested_load: 10,
    connection_type: 'RESIDENTIAL',
    city: '',
    pin_code: '',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      // Load all tickets and filter those related to electricity load requests
      const response = await ticketsApi.list({ limit: 100 });
      const allTickets = response.data.tickets;
      
      // Filter tickets that are related to load enhancement
      const loadTickets = allTickets.filter((t: Ticket) => 
        t.title.toLowerCase().includes('load enhancement') ||
        t.description?.toLowerCase().includes('electricity load')
      );
      
      setTickets(loadTickets);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8100';
      const response = await axios.post(
        `${API_BASE}/api/integration/mulesoft/load-request`,
        {
          RequestID: form.request_id,
          CustomerID: form.customer_id,
          CurrentLoad: form.current_load,
          RequestedLoad: form.requested_load,
          ConnectionType: form.connection_type,
          City: form.city,
          PinCode: form.pin_code,
        }
      );
      
      alert(`Request submitted successfully!\n\nTickets Created:\n- PM: ${response.data.tickets_created.pm_ticket}\n- FI: ${response.data.tickets_created.fi_ticket || 'N/A'}\n- MM: ${response.data.tickets_created.mm_ticket || 'N/A'}\n\nEstimated Cost: ₹${response.data.estimated_cost.toLocaleString()}`);
      
      setShowModal(false);
      setForm({
        request_id: `SF-REQ-${Date.now()}`,
        customer_id: '',
        current_load: 5,
        requested_load: 10,
        connection_type: 'RESIDENTIAL',
        city: '',
        pin_code: '',
      });
      
      // Reload tickets
      setTimeout(loadTickets, 1000);
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      alert(`Failed to submit request: ${error.response?.data?.detail || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getRelatedTickets = (correlationId: string) => {
    return tickets.filter(t => t.correlation_id === correlationId);
  };

  const groupTicketsByRequest = () => {
    const groups: Record<string, Ticket[]> = {};
    tickets.forEach(ticket => {
      const corrId = ticket.correlation_id || ticket.ticket_id;
      if (!groups[corrId]) {
        groups[corrId] = [];
      }
      groups[corrId].push(ticket);
    });
    return groups;
  };

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colors = statusColors[status] || { bg: '#f0f0f0', text: '#666' };
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: colors.bg,
        color: colors.text,
        fontSize: '12px',
        fontWeight: 500,
      }}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => (
    <span style={{
      padding: '2px 6px',
      borderRadius: '4px',
      backgroundColor: priorityColors[priority] || '#666',
      color: 'white',
      fontSize: '11px',
      fontWeight: 600,
    }}>
      {priority}
    </span>
  );

  const ModuleBadge: React.FC<{ module: string }> = ({ module }) => {
    const colors: Record<string, string> = {
      PM: '#1890ff',
      FI: '#52c41a',
      MM: '#fa8c16',
    };
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: colors[module] || '#666',
        color: 'white',
        fontSize: '11px',
        fontWeight: 600,
      }}>
        {module}
      </span>
    );
  };

  const ticketGroups = groupTicketsByRequest();

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>⚡ Electricity Load Requests</h1>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              Manage electricity load enhancement requests and track tickets across modules
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
            }}
          >
            + New Load Request
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Requests</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#1890ff' }}>
            {Object.keys(ticketGroups).length}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Tickets</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#52c41a' }}>
            {tickets.length}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Open Tickets</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#faad14' }}>
            {tickets.filter(t => t.status === 'Open').length}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Closed Tickets</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#52c41a' }}>
            {tickets.filter(t => t.status === 'Closed').length}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', border: '1px solid #e8e8e8' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>Load Enhancement Requests</h2>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading requests...</div>
        ) : Object.keys(ticketGroups).length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>No load requests found</div>
            <div style={{ fontSize: '14px', color: '#999' }}>Submit a new request to get started</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(ticketGroups).map(([correlationId, groupTickets]) => {
              const mainTicket = groupTickets[0];
              const isExpanded = selectedCorrelationId === correlationId;
              
              return (
                <div
                  key={correlationId}
                  style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Request Header */}
                  <div
                    onClick={() => setSelectedCorrelationId(isExpanded ? null : correlationId)}
                    style={{
                      padding: '16px',
                      backgroundColor: '#fafafa',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>
                          {mainTicket.correlation_id || 'Request'}
                        </span>
                        <PriorityBadge priority={mainTicket.priority} />
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {groupTickets.length} ticket{groupTickets.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        Created: {new Date(mainTicket.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {groupTickets.map(t => (
                        <ModuleBadge key={t.ticket_id} module={t.module} />
                      ))}
                      <span style={{ fontSize: '20px', color: '#999' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Tickets */}
                  {isExpanded && (
                    <div style={{ padding: '16px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e8e8e8' }}>
                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Ticket ID</th>
                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Module</th>
                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Type</th>
                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Title</th>
                            <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px', color: '#666' }}>Status</th>
                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', color: '#666' }}>SLA Deadline</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupTickets.map(ticket => (
                            <tr key={ticket.ticket_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'monospace' }}>
                                {ticket.ticket_id}
                              </td>
                              <td style={{ padding: '12px' }}>
                                <ModuleBadge module={ticket.module} />
                              </td>
                              <td style={{ padding: '12px', fontSize: '13px' }}>
                                {ticket.ticket_type.replace(/_/g, ' ')}
                              </td>
                              <td style={{ padding: '12px', fontSize: '13px' }}>
                                {ticket.title}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <StatusBadge status={ticket.status} />
                              </td>
                              <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                                {new Date(ticket.sla_deadline).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h2 style={{ marginTop: 0 }}>⚡ New Load Enhancement Request</h2>
            <form onSubmit={handleSubmitRequest}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>
                    Request ID
                  </label>
                  <input
                    type="text"
                    value={form.request_id}
                    onChange={(e) => setForm({ ...form, request_id: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>
                    Customer ID
                  </label>
                  <input
                    type="text"
                    value={form.customer_id}
                    onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                    required
                    placeholder="CUST-XXXXX"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>
                    Current Load (kW)
                  </label>
                  <input
                    type="number"
                    value={form.current_load}
                    onChange={(e) => setForm({ ...form, current_load: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.1"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>
                    Requested Load (kW)
                  </label>
                  <input
                    type="number"
                    value={form.requested_load}
                    onChange={(e) => setForm({ ...form, requested_load: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.1"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>
                  Connection Type
                </label>
                <select
                  value={form.connection_type}
                  onChange={(e) => setForm({ ...form, connection_type: e.target.value as 'RESIDENTIAL' | 'COMMERCIAL' })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
                >
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                    placeholder="e.g., Hyderabad"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>
                    Pin Code
                  </label>
                  <input
                    type="text"
                    value={form.pin_code}
                    onChange={(e) => setForm({ ...form, pin_code: e.target.value })}
                    required
                    placeholder="500081"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Cost Preview */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#f0f7ff',
                borderRadius: '6px',
                border: '1px solid #91d5ff',
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Estimated Cost</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#1890ff' }}>
                  ₹{(5000 + (form.requested_load - form.current_load) * (form.connection_type === 'RESIDENTIAL' ? 2500 : 3500)).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Load Increase: {(form.requested_load - form.current_load).toFixed(1)} kW
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricityLoadRequests;

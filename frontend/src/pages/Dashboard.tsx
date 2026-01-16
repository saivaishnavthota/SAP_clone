/**
 * Dashboard Page
 * Requirement 8.1 - Ticket summary, SLA metrics, activity feed
 */
import React from 'react';
import '../styles/sap-theme.css';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Open Tickets', value: 12, status: 'info' },
    { label: 'In Progress', value: 8, status: 'warning' },
    { label: 'Closed Today', value: 5, status: 'success' },
    { label: 'SLA Breached', value: 2, status: 'error' },
  ];

  const recentTickets = [
    { id: 'TKT-001', title: 'Equipment Failure - Line 3', module: 'PM', priority: 'High', status: 'Open' },
    { id: 'TKT-002', title: 'Material Shortage Alert', module: 'MM', priority: 'Medium', status: 'In Progress' },
    { id: 'TKT-003', title: 'Invoice Processing Error', module: 'FI', priority: 'Low', status: 'Resolved' },
    { id: 'TKT-004', title: 'Maintenance Schedule Update', module: 'PM', priority: 'Medium', status: 'Open' },
  ];

  return (
    <div>
      {/* SAP GUI Style Section Header */}
      <div className="sap-gui-section">
        System Overview
      </div>

      {/* KPI Cards */}
      <div className="sap-grid sap-grid-4 sap-mb-16">
        {stats.map((stat) => (
          <div key={stat.label} className="sap-fiori-card">
            <div className="sap-fiori-card-content">
              <div style={{ fontSize: '12px', color: '#6a6d70', marginBottom: '8px', textTransform: 'uppercase' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '36px', fontWeight: 300, marginBottom: '8px' }}>
                {stat.value}
              </div>
              <span className={`sap-status ${stat.status}`}>
                {stat.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="sap-grid sap-grid-2">
        {/* Recent Tickets */}
        <div className="sap-fiori-card">
          <div className="sap-fiori-card-header">
            <h3 className="sap-fiori-card-title">Recent Tickets</h3>
          </div>
          <div className="sap-fiori-card-content" style={{ padding: 0 }}>
            <table className="sap-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Module</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td style={{ fontWeight: 600, color: '#0a6ed1' }}>{ticket.id}</td>
                    <td>{ticket.title}</td>
                    <td>
                      <span style={{ 
                        padding: '2px 8px', 
                        backgroundColor: '#e5f3ff',
                        borderRadius: '2px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        {ticket.module}
                      </span>
                    </td>
                    <td>
                      <span className={`sap-status ${
                        ticket.priority === 'High' ? 'error' : 
                        ticket.priority === 'Medium' ? 'warning' : 'info'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`sap-status ${
                        ticket.status === 'Open' ? 'info' :
                        ticket.status === 'In Progress' ? 'warning' : 'success'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module Status */}
        <div>
          <div className="sap-fiori-card sap-mb-16">
            <div className="sap-fiori-card-header">
              <h3 className="sap-fiori-card-title">Plant Maintenance (PM)</h3>
            </div>
            <div className="sap-fiori-card-content">
              <div className="sap-object-attributes">
                <div className="sap-object-attribute">
                  <div className="sap-object-attribute-label">Active Work Orders</div>
                  <div className="sap-object-attribute-value">24</div>
                </div>
                <div className="sap-object-attribute">
                  <div className="sap-object-attribute-label">Pending Approvals</div>
                  <div className="sap-object-attribute-value">7</div>
                </div>
                <div className="sap-object-attribute">
                  <div className="sap-object-attribute-label">Equipment Down</div>
                  <div className="sap-object-attribute-value" style={{ color: '#bb0000' }}>3</div>
                </div>
                <div className="sap-object-attribute">
                  <div className="sap-object-attribute-label">Scheduled Today</div>
                  <div className="sap-object-attribute-value">12</div>
                </div>
              </div>
            </div>
          </div>

          <div className="sap-fiori-card sap-mb-16">
            <div className="sap-fiori-card-header">
              <h3 className="sap-fiori-card-title">Materials Management (MM)</h3>
            </div>
            <div className="sap-fiori-card-content">
              <div className="sap-object-attributes">
                <div className="sap-object-attribute">
                  <div className="sap-object-attribute-label">Purchase Orders</div>
                  <div className="sap-object-attribute-value">156</div>
                </div>
                <div className="sap-object-attribute">
                  <div className="sap-object-attribute-label">Low Stock Items</div>
                  <div className="sap-object-attribute-value" style={{ color: '#e9730c' }}>18</div>
                </div>
                <div className="sap-object-attribute">
                  <div className="sap-object-attribute-label">Goods Receipts</div>
                  <div className="sap-object-attribute-value">42</div>
                </div>
                <div className="sap-object-attribute">
                  <div className="sap-object-attribute-label">Pending Invoices</div>
                  <div className="sap-object-attribute-value">23</div>
                </div>
              </div>
            </div>
          </div>

          <div className="sap-fiori-card">
            <div className="sap-fiori-card-header">
              <h3 className="sap-fiori-card-title">Financial Accounting (FI)</h3>
            </div>
            <div className="sap-fiori-card-content">
              <div className="sap-object-attributes">
                <div className="sap-object-attribute">
                  <div className="sap-object-attribute-label">Open Invoices</div>
                  <div className="sap-object-attribute-value">89</div>
                </div>
                <div className="sap-object-attribute">
                  <div className="sap-object-attribute-label">Overdue Payments</div>
                  <div className="sap-object-attribute-value" style={{ color: '#bb0000' }}>12</div>
                </div>
                <div className="sap-object-attribute">
                  <div className="sap-object-attribute-label">Today's Transactions</div>
                  <div className="sap-object-attribute-value">234</div>
                </div>
                <div className="sap-object-attribute">
                  <div className="sap-object-attribute-label">Pending Approvals</div>
                  <div className="sap-object-attribute-value">15</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

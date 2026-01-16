/**
 * Financial Accounting (FI) Page - SAP GUI Style
 * Requirements 8.1, 8.2, 8.3 - Cost centers, approvals inbox, GL accounts
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fiApi } from '../services/api';
import '../styles/sap-theme.css';

const FI: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('approvals');
  const [approvals, setApprovals] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [approvalsRes, costCentersRes] = await Promise.all([
        fiApi.listApprovals({ decision: 'pending' }),
        fiApi.listCostCenters()
      ]);
      setApprovals(approvalsRes.data || []);
      setCostCenters(costCentersRes.data.cost_centers || []);
    } catch (error) {
      console.error('Failed to load FI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      await fiApi.approveRequest(approvalId, user?.username || 'system', 'Approved via UI');
      await loadData();
      alert('Request approved successfully!');
    } catch (error) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (approvalId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await fiApi.rejectRequest(approvalId, user?.username || 'system', reason);
      await loadData();
      alert('Request rejected');
    } catch (error) {
      alert('Failed to reject request');
    }
  };

  const handlePostDocument = async () => {
    alert('Post Document - Feature coming soon');
  };

  const handleDisplay = () => {
    alert('Display - Feature coming soon');
  };

  const handleChange = () => {
    alert('Change - Feature coming soon');
  };

  const handleReports = () => {
    alert('Reports - Opening report generator...');
  };

  const handleAnalysis = () => {
    alert('Analysis - Opening analytics dashboard...');
  };

  const handlePrint = () => {
    alert('Print - Generating printable report...');
  };

  const handleCreateCostCenter = async () => {
    const name = prompt('Enter Cost Center Name:');
    const budgetAmount = prompt('Enter Budget Amount:');
    const fiscalYear = prompt('Enter Fiscal Year (e.g., 2025):');
    const manager = prompt('Enter Responsible Manager:');
    
    if (!name || !budgetAmount || !fiscalYear || !manager) return;

    try {
      await fiApi.createCostCenter({
        name: name,
        budget_amount: parseFloat(budgetAmount),
        fiscal_year: parseInt(fiscalYear),
        responsible_manager: manager
      });
      await loadData();
      alert('Cost center created successfully!');
    } catch (error) {
      alert('Failed to create cost center');
    }
  };

  const handleSearchAccount = () => {
    alert('Search Account - Feature coming soon');
  };

  const glAccounts = [
    { account: '100000', description: 'Cash and Bank', balance: 1250000, type: 'Asset' },
    { account: '120000', description: 'Accounts Receivable', balance: 450000, type: 'Asset' },
    { account: '200000', description: 'Accounts Payable', balance: -320000, type: 'Liability' },
    { account: '400000', description: 'Revenue', balance: -2100000, type: 'Revenue' },
    { account: '500000', description: 'Cost of Goods Sold', balance: 980000, type: 'Expense' },
  ];

  return (
    <div>
      {/* SAP GUI Toolbar */}
      <div className="sap-toolbar">
        <button className="sap-toolbar-button primary" onClick={handlePostDocument}>
          <span>📝</span> Post Document
        </button>
        <button className="sap-toolbar-button" onClick={handleDisplay}>
          <span>👁️</span> Display
        </button>
        <button className="sap-toolbar-button" onClick={handleChange}>
          <span>✏️</span> Change
        </button>
        <div style={{ width: '1px', height: '24px', backgroundColor: '#d9d9d9', margin: '0 4px' }}></div>
        <button className="sap-toolbar-button" onClick={handleReports}>
          <span>📊</span> Reports
        </button>
        <button className="sap-toolbar-button" onClick={handleAnalysis}>
          <span>📈</span> Analysis
        </button>
        <button className="sap-toolbar-button" onClick={handlePrint}>
          <span>🖨️</span> Print
        </button>
      </div>

      {/* SAP GUI Container */}
      <div className="sap-gui-container" style={{ marginTop: '16px' }}>
        <div className="sap-gui-section">
          Financial Accounting - FI Module
        </div>

        {/* Tabs */}
        <div className="sap-gui-tabs">
          <div 
            className={`sap-gui-tab ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('approvals')}
          >
            Approvals Inbox
          </div>
          <div 
            className={`sap-gui-tab ${activeTab === 'costcenters' ? 'active' : ''}`}
            onClick={() => setActiveTab('costcenters')}
          >
            Cost Centers
          </div>
          <div 
            className={`sap-gui-tab ${activeTab === 'gl' ? 'active' : ''}`}
            onClick={() => setActiveTab('gl')}
          >
            General Ledger
          </div>
          <div 
            className={`sap-gui-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Financial Reports
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'approvals' && (
          <div className="sap-gui-panel">
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff9e6', border: '1px solid #ffd966', borderRadius: '4px' }}>
              <strong>⚠️ Pending Approvals</strong>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                You have {approvals.length} items requiring your approval
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                Loading approvals...
              </div>
            ) : approvals.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                No pending approvals
              </div>
            ) : (
              <table className="sap-table">
                <thead>
                  <tr>
                    <th>Approval ID</th>
                    <th>Amount (USD)</th>
                    <th>Justification</th>
                    <th>Requested By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((app) => (
                    <tr key={app.approval_id}>
                      <td style={{ fontWeight: 600, color: '#0a6ed1' }}>{app.approval_id}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>${app.amount?.toLocaleString()}</td>
                      <td>{app.justification}</td>
                      <td>{app.requested_by}</td>
                      <td>{new Date(app.requested_at).toLocaleDateString()}</td>
                      <td>
                        <span className="sap-status warning">
                          {app.decision || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            className="sap-toolbar-button" 
                            style={{ padding: '4px 12px', fontSize: '12px', backgroundColor: '#107e3e', color: 'white', border: 'none' }}
                            onClick={() => handleApprove(app.approval_id)}
                          >
                            ✓ Approve
                          </button>
                          <button 
                            className="sap-toolbar-button" 
                            style={{ padding: '4px 12px', fontSize: '12px', backgroundColor: '#bb0000', color: 'white', border: 'none' }}
                            onClick={() => handleReject(app.approval_id)}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'costcenters' && (
          <div className="sap-gui-panel">
            <div className="sap-flex-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Cost Center Overview</h3>
              <button className="sap-toolbar-button primary" onClick={handleCreateCostCenter}>
                + Create Cost Center
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                Loading cost centers...
              </div>
            ) : costCenters.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                No cost centers found. Click "Create Cost Center" to add one.
              </div>
            ) : (
              <>
                <table className="sap-table">
                  <thead>
                    <tr>
                      <th>Cost Center</th>
                      <th>Name</th>
                      <th>Budget (USD)</th>
                      <th>Fiscal Year</th>
                      <th>Manager</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costCenters.map((cc) => (
                      <tr key={cc.cost_center_id}>
                        <td style={{ fontWeight: 600, color: '#0a6ed1' }}>{cc.cost_center_id}</td>
                        <td>{cc.name}</td>
                        <td style={{ textAlign: 'right' }}>${cc.budget_amount?.toLocaleString()}</td>
                        <td>{cc.fiscal_year}</td>
                        <td>{cc.responsible_manager}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>Budget Summary</h4>
                  <div className="sap-grid sap-grid-3">
                    <div>
                      <div style={{ fontSize: '12px', color: '#6a6d70' }}>Total Budget</div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: '#0a6ed1' }}>
                        ${costCenters.reduce((sum, cc) => sum + (cc.budget_amount || 0), 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6a6d70' }}>Cost Centers</div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: '#0a6ed1' }}>
                        {costCenters.length}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6a6d70' }}>Fiscal Year</div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: '#0a6ed1' }}>
                        {costCenters[0]?.fiscal_year || new Date().getFullYear()}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'gl' && (
          <div className="sap-gui-panel">
            <div className="sap-flex-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>General Ledger Accounts</h3>
              <div className="sap-flex" style={{ gap: '8px' }}>
                <input 
                  type="text" 
                  className="sap-form-input" 
                  placeholder="Search account..."
                  style={{ width: '200px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="sap-toolbar-button" onClick={handleSearchAccount}>Search</button>
              </div>
            </div>

            <table className="sap-table">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Description</th>
                  <th>Account Type</th>
                  <th>Balance (USD)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {glAccounts.map((acc) => (
                  <tr key={acc.account}>
                    <td style={{ fontWeight: 600, color: '#0a6ed1', fontFamily: 'monospace' }}>{acc.account}</td>
                    <td>{acc.description}</td>
                    <td>
                      <span style={{ 
                        padding: '2px 8px', 
                        backgroundColor: '#e5f3ff',
                        borderRadius: '2px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        {acc.type}
                      </span>
                    </td>
                    <td style={{ 
                      textAlign: 'right', 
                      fontWeight: 600,
                      color: acc.balance < 0 ? '#bb0000' : '#107e3e'
                    }}>
                      ${Math.abs(acc.balance).toLocaleString()}
                      {acc.balance < 0 ? ' CR' : ' DR'}
                    </td>
                    <td>
                      <button className="sap-toolbar-button" style={{ padding: '4px 8px', fontSize: '12px' }}>
                        View Entries
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="sap-gui-panel">
            <h3 style={{ margin: '0 0 16px 0' }}>Financial Reports</h3>
            
            <div className="sap-grid sap-grid-2" style={{ gap: '12px' }}>
              <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer' }}
                   onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                   onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>📊 Balance Sheet</div>
                <div style={{ fontSize: '13px', color: '#6a6d70' }}>
                  View assets, liabilities, and equity positions
                </div>
              </div>

              <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer' }}
                   onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                   onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>📈 Profit & Loss</div>
                <div style={{ fontSize: '13px', color: '#6a6d70' }}>
                  Income statement and profitability analysis
                </div>
              </div>

              <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer' }}
                   onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                   onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>💰 Cash Flow</div>
                <div style={{ fontSize: '13px', color: '#6a6d70' }}>
                  Cash inflows and outflows analysis
                </div>
              </div>

              <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer' }}
                   onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                   onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>📋 Trial Balance</div>
                <div style={{ fontSize: '13px', color: '#6a6d70' }}>
                  Debit and credit balances verification
                </div>
              </div>

              <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer' }}
                   onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                   onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>🎯 Budget vs Actual</div>
                <div style={{ fontSize: '13px', color: '#6a6d70' }}>
                  Compare planned budget with actual spending
                </div>
              </div>

              <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer' }}
                   onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                   onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>📅 Aging Report</div>
                <div style={{ fontSize: '13px', color: '#6a6d70' }}>
                  Accounts receivable and payable aging
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FI;

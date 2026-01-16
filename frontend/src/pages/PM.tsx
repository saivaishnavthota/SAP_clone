/**
 * Plant Maintenance (PM) Page - SAP GUI Style
 * Requirement 8.2 - Equipment list, work orders, maintenance schedules
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pmApi } from '../services/api';
import '../styles/sap-theme.css';

const PM: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('equipment');
  const [equipment, setEquipment] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [equipmentRes, ordersRes] = await Promise.all([
        pmApi.listAssets(),
        pmApi.listMaintenanceOrders()
      ]);
      setEquipment(equipmentRes.data.assets || []);
      setWorkOrders(ordersRes.data.orders || []);
    } catch (error) {
      console.error('Failed to load PM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkOrder = async () => {
    const assetId = prompt('Enter Asset ID:');
    const description = prompt('Enter Work Order Description:');
    
    if (!assetId || !description) return;

    try {
      await pmApi.createMaintenanceOrder({
        asset_id: assetId,
        order_type: 'preventive',
        description: description,
        priority: 'medium',
        scheduled_date: new Date().toISOString().split('T')[0],
        assigned_to: user?.username || 'unassigned'
      });
      await loadData();
      alert('Work order created successfully!');
    } catch (error) {
      alert('Failed to create work order');
    }
  };

  const handleCreateEquipment = async () => {
    const name = prompt('Enter Equipment Name:');
    const type = prompt('Enter Equipment Type (substation/transformer/feeder):');
    const location = prompt('Enter Location:');
    
    if (!name || !type || !location) return;

    try {
      await pmApi.createAsset({
        name: name,
        asset_type: type,
        location: location,
        status: 'operational'
      });
      await loadData();
      alert('Equipment created successfully!');
    } catch (error) {
      alert('Failed to create equipment');
    }
  };

  const handleSearch = () => {
    if (!searchTerm) {
      loadData();
      return;
    }
    const filtered = equipment.filter(eq => 
      eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.asset_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setEquipment(filtered);
  };

  return (
    <div>
      {/* SAP GUI Toolbar */}
      <div className="sap-toolbar">
        <button className="sap-toolbar-button primary" onClick={handleCreateWorkOrder}>
          <span>📝</span> Create Work Order
        </button>
        <button className="sap-toolbar-button" onClick={() => setActiveTab('schedule')}>
          <span>📅</span> Schedule
        </button>
        <button className="sap-toolbar-button" onClick={handleCreateEquipment}>
          <span>🔧</span> Equipment
        </button>
        <div style={{ width: '1px', height: '24px', backgroundColor: '#d9d9d9', margin: '0 4px' }}></div>
        <button className="sap-toolbar-button" onClick={() => alert('Reports feature coming soon')}>
          <span>📊</span> Reports
        </button>
        <button className="sap-toolbar-button" onClick={() => alert('Analytics feature coming soon')}>
          <span>📈</span> Analytics
        </button>
      </div>

      {/* Main Container */}
      <div className="sap-gui-container" style={{ marginTop: '16px' }}>
        <div className="sap-gui-section">
          Plant Maintenance - Equipment & Work Orders
        </div>

        {/* Navigation Tree and Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px' }}>
          {/* Left Navigation Tree */}
          <div className="sap-tree">
            <div className="sap-tree-item" style={{ fontWeight: 600, marginBottom: '8px' }}>
              📁 Plant Maintenance
            </div>
            <div 
              className={`sap-tree-item ${activeTab === 'equipment' ? 'selected' : ''}`}
              onClick={() => setActiveTab('equipment')}
              style={{ paddingLeft: '24px' }}
            >
              🔧 Equipment
            </div>
            <div 
              className={`sap-tree-item ${activeTab === 'workorders' ? 'selected' : ''}`}
              onClick={() => setActiveTab('workorders')}
              style={{ paddingLeft: '24px' }}
            >
              📋 Work Orders
            </div>
            <div 
              className={`sap-tree-item ${activeTab === 'schedule' ? 'selected' : ''}`}
              onClick={() => setActiveTab('schedule')}
              style={{ paddingLeft: '24px' }}
            >
              📅 Maintenance Schedule
            </div>
            <div 
              className={`sap-tree-item ${activeTab === 'history' ? 'selected' : ''}`}
              onClick={() => setActiveTab('history')}
              style={{ paddingLeft: '24px' }}
            >
              📜 History
            </div>
          </div>

          {/* Right Content Panel */}
          <div>
            {activeTab === 'equipment' && (
              <div className="sap-gui-panel">
                <div className="sap-flex-between" style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>Equipment Master Data</h3>
                  <div className="sap-flex" style={{ gap: '8px' }}>
                    <input 
                      type="text" 
                      className="sap-form-input" 
                      placeholder="Search equipment..."
                      style={{ width: '250px' }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="sap-toolbar-button" onClick={handleSearch}>Search</button>
                  </div>
                </div>

                {loading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                    Loading equipment...
                  </div>
                ) : equipment.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                    No equipment found. Click "Equipment" button to create new equipment.
                  </div>
                ) : (
                  <table className="sap-table">
                    <thead>
                      <tr>
                        <th>Equipment ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment.map((eq) => (
                        <tr key={eq.asset_id}>
                          <td style={{ fontWeight: 600, color: '#0a6ed1' }}>{eq.asset_id}</td>
                          <td>{eq.name}</td>
                          <td>{eq.asset_type}</td>
                          <td>{eq.location}</td>
                          <td>
                            <span className={`sap-status ${
                              eq.status === 'operational' ? 'success' :
                              eq.status === 'maintenance' ? 'warning' : 'error'
                            }`}>
                              {eq.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="sap-toolbar-button" 
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => alert(`Equipment Details:\nID: ${eq.asset_id}\nName: ${eq.name}\nType: ${eq.asset_type}\nLocation: ${eq.location}`)}
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'workorders' && (
              <div className="sap-gui-panel">
                <div className="sap-flex-between" style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>Work Order Management</h3>
                  <button className="sap-toolbar-button primary" onClick={handleCreateWorkOrder}>
                    + Create New Work Order
                  </button>
                </div>

                <div className="sap-grid sap-grid-4" style={{ marginBottom: '20px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#e5f3ff', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#0a6ed1' }}>{workOrders.length}</div>
                    <div style={{ fontSize: '12px', color: '#6a6d70' }}>Total Active</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#fef7f1', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#e9730c' }}>
                      {workOrders.filter(wo => wo.status === 'in_progress').length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6a6d70' }}>In Progress</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e5f5ed', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#107e3e' }}>
                      {workOrders.filter(wo => wo.status === 'completed').length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6a6d70' }}>Completed</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#ffebeb', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#bb0000' }}>
                      {workOrders.filter(wo => wo.status === 'overdue').length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6a6d70' }}>Overdue</div>
                  </div>
                </div>

                {loading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                    Loading work orders...
                  </div>
                ) : workOrders.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                    No work orders found. Click "Create Work Order" to create one.
                  </div>
                ) : (
                  <table className="sap-table">
                    <thead>
                      <tr>
                        <th>Work Order</th>
                        <th>Asset ID</th>
                        <th>Type</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workOrders.map((wo) => (
                        <tr key={wo.order_id}>
                          <td style={{ fontWeight: 600, color: '#0a6ed1' }}>{wo.order_id}</td>
                          <td>{wo.asset_id}</td>
                          <td>
                            <span style={{ 
                              padding: '2px 8px', 
                              backgroundColor: '#f5f5f5',
                              borderRadius: '2px',
                              fontSize: '12px'
                            }}>
                              {wo.order_type}
                            </span>
                          </td>
                          <td>
                            <span className={`sap-status ${
                              wo.priority === 'critical' ? 'error' :
                              wo.priority === 'high' ? 'warning' : 'info'
                            }`}>
                              {wo.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`sap-status ${
                              wo.status === 'completed' ? 'success' :
                              wo.status === 'in_progress' ? 'warning' : 'info'
                            }`}>
                              {wo.status}
                            </span>
                          </td>
                          <td>{wo.assigned_to}</td>
                          <td>
                            <button 
                              className="sap-toolbar-button" 
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => alert(`Work Order Details:\nID: ${wo.order_id}\nAsset: ${wo.asset_id}\nDescription: ${wo.description}\nScheduled: ${wo.scheduled_date}`)}
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="sap-gui-panel">
                <h3 style={{ margin: '0 0 16px 0' }}>Maintenance Schedule</h3>
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#6a6d70' }}>
                    Preventive Maintenance Calendar
                  </div>
                  <div style={{ fontSize: '14px', marginTop: '8px', color: '#6a6d70' }}>
                    Schedule and track preventive maintenance activities
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="sap-gui-panel">
                <h3 style={{ margin: '0 0 16px 0' }}>Maintenance History</h3>
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#6a6d70' }}>
                    Historical Maintenance Records
                  </div>
                  <div style={{ fontSize: '14px', marginTop: '8px', color: '#6a6d70' }}>
                    View completed work orders and maintenance activities
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PM;

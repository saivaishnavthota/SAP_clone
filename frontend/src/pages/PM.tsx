/**
 * Plant Maintenance (PM) Page - SAP GUI Style (MM Layout)
 * Requirement 8.2 - Equipment list, work orders, maintenance schedules
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pmApi } from '../services/api';
import { useSAPDialog } from '../hooks/useSAPDialog';
import { useSAPToast } from '../hooks/useSAPToast';
import SAPDialog from '../components/SAPDialog';
import SAPToast from '../components/SAPToast';
import SAPFormDialog from '../components/SAPFormDialog';
import '../styles/sap-theme.css';

const PM: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('equipment');
  const [equipment, setEquipment] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [showCreateWorkOrderModal, setShowCreateWorkOrderModal] = useState(false);
  const [showCreateEquipmentModal, setShowCreateEquipmentModal] = useState(false);
  const { dialogState, showAlert, handleClose: closeDialog } = useSAPDialog();
  const { toastState, showSuccess, showError, handleClose: closeToast } = useSAPToast();

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

  const handleCreateWorkOrder = async (data: any) => {
    try {
      await pmApi.createMaintenanceOrder({
        asset_id: data.assetId,
        order_type: data.orderType || 'preventive',
        description: data.description,
        priority: data.priority || 'medium',
        scheduled_date: data.scheduledDate || new Date().toISOString().split('T')[0],
        assigned_to: user?.username || 'unassigned'
      });
      await loadData();
      setShowCreateWorkOrderModal(false);
      showSuccess('Work order created successfully!');
    } catch (error) {
      showError('Failed to create work order');
    }
  };

  const handleCreateEquipment = async (data: any) => {
    try {
      await pmApi.createAsset({
        name: data.name,
        asset_type: data.type,
        location: data.location,
        status: data.status || 'operational'
      });
      await loadData();
      setShowCreateEquipmentModal(false);
      showSuccess('Equipment created successfully!');
    } catch (error) {
      showError('Failed to create equipment');
    }
  };

  const handleSearch = () => {
    if (!searchTerm && !descriptionSearch) {
      loadData();
      return;
    }
    const filtered = equipment.filter(eq => 
      (searchTerm ? eq.asset_id?.toLowerCase().includes(searchTerm.toLowerCase()) : true) &&
      (descriptionSearch ? eq.name?.toLowerCase().includes(descriptionSearch.toLowerCase()) : true)
    );
    setEquipment(filtered);
  };

  const handleDisplayEquipment = () => {
    if (!selectedEquipment) {
      showAlert('Warning', 'Please select an equipment first');
      return;
    }
    const eq = equipment.find(e => e.asset_id === selectedEquipment);
    if (eq) {
      showAlert('Equipment Details', `ID: ${eq.asset_id}\nName: ${eq.name}\nType: ${eq.asset_type}\nLocation: ${eq.location}\nStatus: ${eq.status}`);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f7f7f7', minHeight: 'calc(100vh - 88px)' }}>
      {/* Page Header */}
      <div style={{
        backgroundColor: '#d9edf7',
        padding: '12px 16px',
        marginBottom: '16px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#31708f'
      }}>
        Plant Maintenance - Equipment & Work Orders
      </div>

      {/* SAP GUI Container */}
      <div className="sap-gui-container">
        {/* Tabs */}
        <div className="sap-gui-tabs">
          <div 
            className={`sap-gui-tab ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipment')}
          >
            Equipment Master
          </div>
          <div 
            className={`sap-gui-tab ${activeTab === 'workorders' ? 'active' : ''}`}
            onClick={() => setActiveTab('workorders')}
          >
            Work Orders
          </div>
          <div 
            className={`sap-gui-tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Maintenance Schedule
          </div>
          <div 
            className={`sap-gui-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'equipment' && (
          <div className="sap-gui-panel">
            <div style={{ marginBottom: '16px' }}>
              <div className="sap-flex" style={{ gap: '12px', marginBottom: '16px' }}>
                <div className="sap-form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="sap-form-label">Equipment ID</label>
                  <input 
                    type="text" 
                    className="sap-form-input" 
                    placeholder="Enter equipment ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="sap-form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="sap-form-label">Equipment Name</label>
                  <input 
                    type="text" 
                    className="sap-form-input" 
                    placeholder="Search name..."
                    value={descriptionSearch}
                    onChange={(e) => setDescriptionSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <button className="sap-toolbar-button" style={{ padding: '8px 20px' }} onClick={handleSearch}>
                    Search
                  </button>
                  <button className="sap-toolbar-button primary" style={{ padding: '8px 20px' }} onClick={() => setShowCreateEquipmentModal(true)}>
                    Create
                  </button>
                  <button className="sap-toolbar-button" style={{ padding: '8px 20px' }} onClick={handleDisplayEquipment}>
                    Display
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                Loading equipment...
              </div>
            ) : equipment.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                No equipment found. Click "Create" to add new equipment.
              </div>
            ) : (
              <>
                <table className="sap-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input type="checkbox" />
                      </th>
                      <th>Equipment ID</th>
                      <th>Equipment Name</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Installation Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.map((eq) => (
                      <tr 
                        key={eq.asset_id}
                        className={selectedEquipment === eq.asset_id ? 'selected' : ''}
                        onClick={() => setSelectedEquipment(eq.asset_id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td style={{ fontWeight: 600, color: '#0a6ed1' }}>{eq.asset_id}</td>
                        <td>{eq.name}</td>
                        <td>{eq.asset_type}</td>
                        <td>{eq.location}</td>
                        <td>{eq.installation_date ? new Date(eq.installation_date).toLocaleDateString() : '-'}</td>
                        <td>
                          <span className={`sap-status ${
                            eq.status === 'operational' ? 'success' :
                            eq.status === 'under_maintenance' ? 'warning' : 'error'
                          }`}>
                            {eq.status === 'operational' ? 'Available' : eq.status === 'under_maintenance' ? 'Maintenance' : 'Offline'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '12px', fontSize: '12px', color: '#6a6d70' }}>
                  {equipment.length} entries found
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'workorders' && (
          <div className="sap-gui-panel">
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Work Order Management</h3>
              <button className="sap-toolbar-button primary" onClick={() => setShowCreateWorkOrderModal(true)}>
                + Create Work Order
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
                  {workOrders.filter(wo => wo.priority === 'critical').length}
                </div>
                <div style={{ fontSize: '12px', color: '#6a6d70' }}>Critical</div>
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
                    <th>Description</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Scheduled Date</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((wo) => (
                    <tr key={wo.order_id}>
                      <td style={{ fontWeight: 600, color: '#0a6ed1' }}>{wo.order_id}</td>
                      <td>{wo.asset_id}</td>
                      <td>{wo.description}</td>
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
                      <td>{wo.scheduled_date ? new Date(wo.scheduled_date).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="sap-gui-panel">
            <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
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
            <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
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

      {/* SAP Dialogs */}
      <SAPDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        onClose={closeDialog}
        defaultValue={dialogState.defaultValue}
        inputLabel={dialogState.inputLabel}
      />

      <SAPToast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={closeToast}
      />

      {/* Create Work Order Modal */}
      <SAPFormDialog
        isOpen={showCreateWorkOrderModal}
        title="Create Work Order"
        fields={[
          { name: 'assetId', label: 'Asset ID', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { 
            name: 'orderType', 
            label: 'Order Type', 
            type: 'select', 
            required: true,
            options: [
              { value: 'preventive', label: 'Preventive' },
              { value: 'corrective', label: 'Corrective' },
              { value: 'breakdown', label: 'Breakdown' }
            ]
          },
          { 
            name: 'priority', 
            label: 'Priority', 
            type: 'select', 
            required: true,
            options: [
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' }
            ]
          },
          { name: 'scheduledDate', label: 'Scheduled Date', type: 'date', required: true }
        ]}
        onSubmit={handleCreateWorkOrder}
        onCancel={() => setShowCreateWorkOrderModal(false)}
        submitLabel="Create"
      />

      {/* Create Equipment Modal */}
      <SAPFormDialog
        isOpen={showCreateEquipmentModal}
        title="Create Equipment"
        fields={[
          { name: 'name', label: 'Equipment Name', type: 'text', required: true },
          { 
            name: 'type', 
            label: 'Equipment Type', 
            type: 'select', 
            required: true,
            options: [
              { value: 'substation', label: 'Substation' },
              { value: 'transformer', label: 'Transformer' },
              { value: 'feeder', label: 'Feeder' },
              { value: 'generator', label: 'Generator' },
              { value: 'switchgear', label: 'Switchgear' }
            ]
          },
          { name: 'location', label: 'Location', type: 'text', required: true },
          { 
            name: 'status', 
            label: 'Status', 
            type: 'select', 
            required: true,
            options: [
              { value: 'operational', label: 'Operational' },
              { value: 'under_maintenance', label: 'Under Maintenance' },
              { value: 'offline', label: 'Offline' }
            ]
          }
        ]}
        onSubmit={handleCreateEquipment}
        onCancel={() => setShowCreateEquipmentModal(false)}
        submitLabel="Create"
      />
    </div>
  );
};

export default PM;

/**
 * Materials Management (MM) Page - SAP GUI Style
 * Requirement 8.3 - Material master data, purchase orders, inventory
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mmApi } from '../services/api';
import '../styles/sap-theme.css';

const MM: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('materials');
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [descriptionSearch, setDescriptionSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [materialsRes, requisitionsRes] = await Promise.all([
        mmApi.listMaterials(),
        mmApi.listRequisitions()
      ]);
      setMaterials(materialsRes.data.materials || []);
      setPurchaseOrders(requisitionsRes.data.requisitions || []);
    } catch (error) {
      console.error('Failed to load MM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async () => {
    const description = prompt('Enter Material Description:');
    const quantity = prompt('Enter Initial Quantity:');
    const unit = prompt('Enter Unit of Measure (e.g., KG, L, PC):');
    const reorderLevel = prompt('Enter Reorder Level:');
    const location = prompt('Enter Storage Location:');
    
    if (!description || !quantity || !unit || !reorderLevel || !location) return;

    try {
      await mmApi.createMaterial({
        description: description,
        quantity: parseInt(quantity),
        unit_of_measure: unit,
        reorder_level: parseInt(reorderLevel),
        storage_location: location
      });
      await loadData();
      alert('Material created successfully!');
    } catch (error) {
      alert('Failed to create material');
    }
  };

  const handleChangeMaterial = () => {
    if (!selectedMaterial) {
      alert('Please select a material first');
      return;
    }
    alert(`Change material ${selectedMaterial} - Feature coming soon`);
  };

  const handleDisplayMaterial = () => {
    if (!selectedMaterial) {
      alert('Please select a material first');
      return;
    }
    const material = materials.find(m => m.material_id === selectedMaterial);
    if (material) {
      alert(`Material Details:\nID: ${material.material_id}\nDescription: ${material.description}\nQuantity: ${material.quantity} ${material.unit_of_measure}\nReorder Level: ${material.reorder_level}\nLocation: ${material.storage_location}`);
    }
  };

  const handleSearch = () => {
    if (!searchTerm && !descriptionSearch) {
      loadData();
      return;
    }
    const filtered = materials.filter(mat => 
      (searchTerm ? mat.material_id?.toLowerCase().includes(searchTerm.toLowerCase()) : true) &&
      (descriptionSearch ? mat.description?.toLowerCase().includes(descriptionSearch.toLowerCase()) : true)
    );
    setMaterials(filtered);
  };

  const handlePrint = () => {
    alert('Print functionality - Generating report...');
  };

  const handleReport = () => {
    alert('Report functionality - Opening report generator...');
  };

  return (
    <div>
      {/* SAP GUI Style Toolbar */}
      <div className="sap-toolbar">
        <button className="sap-toolbar-button primary" onClick={handleCreateMaterial}>
          <span>📄</span> Create
        </button>
        <button className="sap-toolbar-button" onClick={handleChangeMaterial}>
          <span>✏️</span> Change
        </button>
        <button className="sap-toolbar-button" onClick={handleDisplayMaterial}>
          <span>👁️</span> Display
        </button>
        <div style={{ width: '1px', height: '24px', backgroundColor: '#d9d9d9', margin: '0 4px' }}></div>
        <button className="sap-toolbar-button" onClick={handleSearch}>
          <span>🔍</span> Find
        </button>
        <button className="sap-toolbar-button" onClick={handlePrint}>
          <span>🖨️</span> Print
        </button>
        <button className="sap-toolbar-button" onClick={handleReport}>
          <span>📊</span> Report
        </button>
      </div>

      {/* SAP GUI Container */}
      <div className="sap-gui-container" style={{ marginTop: '16px' }}>
        {/* Section Header */}
        <div className="sap-gui-section">
          Materials Management - Master Data
        </div>

        {/* Tabs */}
        <div className="sap-gui-tabs">
          <div 
            className={`sap-gui-tab ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            Material Master
          </div>
          <div 
            className={`sap-gui-tab ${activeTab === 'purchase' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchase')}
          >
            Purchase Orders
          </div>
          <div 
            className={`sap-gui-tab ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </div>
          <div 
            className={`sap-gui-tab ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendors')}
          >
            Vendors
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'materials' && (
          <div className="sap-gui-panel">
            <div style={{ marginBottom: '16px' }}>
              <div className="sap-flex" style={{ gap: '12px', marginBottom: '16px' }}>
                <div className="sap-form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="sap-form-label">Material Number</label>
                  <input 
                    type="text" 
                    className="sap-form-input" 
                    placeholder="Enter material number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="sap-form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="sap-form-label">Description</label>
                  <input 
                    type="text" 
                    className="sap-form-input" 
                    placeholder="Search description..."
                    value={descriptionSearch}
                    onChange={(e) => setDescriptionSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button className="sap-toolbar-button" style={{ padding: '8px 20px' }} onClick={handleSearch}>
                    Search
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                Loading materials...
              </div>
            ) : materials.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                No materials found. Click "Create" to add new materials.
              </div>
            ) : (
              <>
                <table className="sap-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input type="checkbox" />
                      </th>
                      <th>Material Number</th>
                      <th>Description</th>
                      <th>Stock Quantity</th>
                      <th>Unit</th>
                      <th>Reorder Level</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((mat) => (
                      <tr 
                        key={mat.material_id}
                        className={selectedMaterial === mat.material_id ? 'selected' : ''}
                        onClick={() => setSelectedMaterial(mat.material_id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td style={{ fontWeight: 600, color: '#0a6ed1' }}>{mat.material_id}</td>
                        <td>{mat.description}</td>
                        <td style={{ textAlign: 'right' }}>{mat.quantity?.toLocaleString()}</td>
                        <td>{mat.unit_of_measure}</td>
                        <td style={{ textAlign: 'right' }}>{mat.reorder_level}</td>
                        <td>
                          <span className={`sap-status ${
                            mat.is_below_reorder ? 'error' : 'success'
                          }`}>
                            {mat.is_below_reorder ? 'Low Stock' : 'Available'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '12px', fontSize: '12px', color: '#6a6d70' }}>
                  {materials.length} entries found
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'purchase' && (
          <div className="sap-gui-panel">
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff9e6', border: '1px solid #ffd966', borderRadius: '4px' }}>
              <strong>Purchase Order Processing</strong>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                Create and manage purchase orders for material procurement
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                Loading purchase orders...
              </div>
            ) : purchaseOrders.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6a6d70' }}>
                No purchase orders found.
              </div>
            ) : (
              <table className="sap-table">
                <thead>
                  <tr>
                    <th>Requisition ID</th>
                    <th>Material ID</th>
                    <th>Quantity</th>
                    <th>Justification</th>
                    <th>Requested By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
                    <tr key={po.requisition_id}>
                      <td style={{ fontWeight: 600, color: '#0a6ed1' }}>{po.requisition_id}</td>
                      <td>{po.material_id}</td>
                      <td style={{ textAlign: 'right' }}>{po.quantity?.toLocaleString()}</td>
                      <td>{po.justification}</td>
                      <td>{po.requested_by}</td>
                      <td>
                        <span className={`sap-status ${
                          po.status === 'approved' ? 'success' :
                          po.status === 'pending' ? 'warning' : 'info'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="sap-toolbar-button" 
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => alert(`Requisition Details:\nID: ${po.requisition_id}\nMaterial: ${po.material_id}\nQuantity: ${po.quantity}\nJustification: ${po.justification}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="sap-gui-panel">
            <div className="sap-grid sap-grid-3" style={{ marginBottom: '20px' }}>
              <div style={{ padding: '16px', backgroundColor: '#e5f3ff', borderRadius: '4px', border: '1px solid #0a6ed1' }}>
                <div style={{ fontSize: '12px', color: '#6a6d70', marginBottom: '4px' }}>Total Stock Value</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#0a6ed1' }}>$2,456,780</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#fef7f1', borderRadius: '4px', border: '1px solid #e9730c' }}>
                <div style={{ fontSize: '12px', color: '#6a6d70', marginBottom: '4px' }}>Low Stock Items</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#e9730c' }}>18</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#ffebeb', borderRadius: '4px', border: '1px solid #bb0000' }}>
                <div style={{ fontSize: '12px', color: '#6a6d70', marginBottom: '4px' }}>Out of Stock</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#bb0000' }}>3</div>
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 12px 0' }}>Inventory Movement</h4>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <div>• Goods Receipt: 42 transactions today</div>
                <div>• Goods Issue: 38 transactions today</div>
                <div>• Stock Transfer: 12 transactions today</div>
                <div>• Physical Inventory: Last count 5 days ago</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="sap-gui-panel">
            <div style={{ padding: '20px', textAlign: 'center', color: '#6a6d70' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>Vendor Master Data</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                Manage vendor information, payment terms, and purchasing data
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MM;

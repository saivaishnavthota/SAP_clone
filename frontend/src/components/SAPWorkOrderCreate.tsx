/**
 * SAP-Style Work Order Creation Screen
 * Mimics SAP GUI IW31 transaction
 */
import React, { useState } from 'react';
import '../styles/sap-theme.css';

interface SAPWorkOrderCreateProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  equipmentList?: any[];
}

const SAPWorkOrderCreate: React.FC<SAPWorkOrderCreateProps> = ({ onClose, onSubmit, equipmentList = [] }) => {
  const [activeTab, setActiveTab] = useState('header');
  const [formData, setFormData] = useState({
    orderType: '',
    priority: '',
    functionalLocation: '',
    equipment: '',
    assembly: '',
    uii: '',
    plngPlant: '',
    busArea: '',
    referenceOrder: '',
    relationship: false,
    settlementRule: false,
    operations: [],
    components: []
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Map SAP form data to API format
    const apiData = {
      assetId: formData.equipment,
      description: `Order Type: ${formData.orderType}, Priority: ${formData.priority}`,
      orderType: formData.orderType || 'PM01', // Default to PM01 if empty
      priority: formData.priority === '1' ? 'critical' : 
                formData.priority === '2' ? 'high' :
                formData.priority === '3' ? 'medium' : 'low',
      scheduledDate: new Date().toISOString().split('T')[0] // Today's date
    };
    
    onSubmit(apiData);
  };

  return (
    <div className="sap-modal-overlay" onClick={onClose}>
      <div className="sap-modal-container sap-work-order-create" onClick={(e) => e.stopPropagation()}>
        {/* SAP Toolbar */}
        <div className="sap-toolbar">
          <div className="sap-toolbar-left">
            <button className="sap-toolbar-btn" title="Save">
              <span className="sap-icon">💾</span>
            </button>
            <button className="sap-toolbar-btn" onClick={handleSubmit} title="Save">
              <span className="sap-icon">✓</span>
            </button>
            <button className="sap-toolbar-btn" onClick={onClose} title="Back">
              <span className="sap-icon">←</span>
            </button>
            <div className="sap-toolbar-separator"></div>
            <button className="sap-toolbar-btn" title="Print">
              <span className="sap-icon">🖨</span>
            </button>
            <button className="sap-toolbar-btn" title="Find">
              <span className="sap-icon">🔍</span>
            </button>
            <button className="sap-toolbar-btn" title="Help">
              <span className="sap-icon">?</span>
            </button>
          </div>
        </div>

        {/* Title Bar */}
        <div className="sap-title-bar">
          <h2 className="sap-title">Create General Maintenance/ Corrective Maint : Operation Overview</h2>
        </div>

        {/* SAP Tabs */}
        <div className="sap-tabs-container">
          <div className="sap-tabs">
            <button 
              className={`sap-tab ${activeTab === 'header' ? 'active' : ''}`}
              onClick={() => setActiveTab('header')}
            >
              Header data
            </button>
            <button 
              className={`sap-tab ${activeTab === 'operations' ? 'active' : ''}`}
              onClick={() => setActiveTab('operations')}
            >
              Operations
            </button>
            <button 
              className={`sap-tab ${activeTab === 'components' ? 'active' : ''}`}
              onClick={() => setActiveTab('components')}
            >
              Components
            </button>
            <button 
              className={`sap-tab ${activeTab === 'costs' ? 'active' : ''}`}
              onClick={() => setActiveTab('costs')}
            >
              Costs
            </button>
            <button 
              className={`sap-tab ${activeTab === 'partner' ? 'active' : ''}`}
              onClick={() => setActiveTab('partner')}
            >
              Partner
            </button>
            <button 
              className={`sap-tab ${activeTab === 'objects' ? 'active' : ''}`}
              onClick={() => setActiveTab('objects')}
            >
              Objects
            </button>
            <button 
              className={`sap-tab ${activeTab === 'additdata' ? 'active' : ''}`}
              onClick={() => setActiveTab('additdata')}
            >
              Addit. Data
            </button>
            <button 
              className={`sap-tab ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              Location
            </button>
            <button 
              className={`sap-tab ${activeTab === 'planning' ? 'active' : ''}`}
              onClick={() => setActiveTab('planning')}
            >
              Planning
            </button>
            <button 
              className={`sap-tab ${activeTab === 'control' ? 'active' : ''}`}
              onClick={() => setActiveTab('control')}
            >
              Control
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="sap-content-area">
          {/* Header Data Tab */}
          {activeTab === 'header' && (
            <div className="sap-section">
              <div className="sap-section-header">
                <span className="sap-section-icon">📋</span>
                <span className="sap-section-title">Header data</span>
              </div>
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <button 
                  className="sap-create-button"
                  onClick={handleSubmit}
                >
                  + Create Work Order
                </button>
                <div style={{ marginTop: '20px', fontSize: '13px', color: '#666' }}>
                  Click to create a new work order with default settings
                </div>
              </div>
            </div>
          )}

          {/* Operations Tab */}
          {activeTab === 'operations' && (
            <div className="sap-section">
              <div className="sap-section-header">
                <span className="sap-section-icon">⚙️</span>
                <span className="sap-section-title">Operations</span>
              </div>
              <div className="sap-table-container">
                <table className="sap-data-table">
                  <thead>
                    <tr>
                      <th>OpActvty</th>
                      <th>Work ctr</th>
                      <th>Plant/Loc</th>
                      <th>StrLoc</th>
                      <th>Operation short text</th>
                      <th>CT</th>
                      <th>Work</th>
                      <th>Un</th>
                      <th>N</th>
                      <th>Durat</th>
                      <th>Un</th>
                      <th>Earl start d</th>
                      <th>Earl start t</th>
                      <th>EarlFnshD</th>
                      <th>EarlFnshT</th>
                      <th>...</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={16} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        No operations defined. Click "Add" to create operations.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="sap-table-footer">
                <button className="sap-toolbar-btn">Add</button>
                <button className="sap-toolbar-btn">Delete</button>
                <button className="sap-toolbar-btn">Copy</button>
              </div>
            </div>
          )}

          {/* Components Tab */}
          {activeTab === 'components' && (
            <div className="sap-section">
              <div className="sap-section-header">
                <span className="sap-section-icon">🔧</span>
                <span className="sap-section-title">Components</span>
              </div>
              <div className="sap-table-container">
                <table className="sap-data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Material</th>
                      <th>Component description</th>
                      <th>Quantity</th>
                      <th>Un</th>
                      <th>Storage Location</th>
                      <th>Batch</th>
                      <th>Reservation</th>
                      <th>...</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        No components defined. Click "Add" to create components.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="sap-table-footer">
                <button className="sap-toolbar-btn">Add</button>
                <button className="sap-toolbar-btn">Delete</button>
                <button className="sap-toolbar-btn">Copy</button>
              </div>
            </div>
          )}

          {/* Other Tabs - Placeholder */}
          {['costs', 'partner', 'objects', 'additdata', 'location', 'planning', 'control'].includes(activeTab) && (
            <div className="sap-section">
              <div className="sap-section-header">
                <span className="sap-section-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
              </div>
              <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} data will be displayed here.
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="sap-status-bar">
          <span className="sap-status-text">Ready</span>
        </div>
      </div>
    </div>
  );
};

export default SAPWorkOrderCreate;

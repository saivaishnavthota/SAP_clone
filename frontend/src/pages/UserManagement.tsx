/**
 * Basis Administration Page
 * Admin-only page to view, create, and manage users
 */
import React, { useState, useEffect } from 'react';
import { usersApi } from '../services/api';

interface User {
  username: string;
  roles: string[];
  created_at?: string;
  last_login?: string;
}

const AVAILABLE_ROLES = [
  { value: 'Maintenance_Engineer', label: 'Maintenance Engineer (PM)' },
  { value: 'Store_Manager', label: 'Store Manager (MM)' },
  { value: 'Finance_Officer', label: 'Finance Officer (FI)' },
  { value: 'Admin', label: 'Administrator' },
];

const USER_TYPES = ['Dialog', 'System', 'Service', 'Communication'];
const USER_GROUPS = ['SUPER', 'ADMIN', 'USER', 'GUEST'];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('address');
  const [passwordTab, setPasswordTab] = useState('logon');
  const [createForm, setCreateForm] = useState({
    // Address tab
    username: '',
    alias: '',
    userType: 'Dialog',
    
    // Logon data tab
    password: '',
    passwordStatus: 'Productive password',
    
    // Roles tab
    roles: [] as string[],
    userGroup: 'SUPER',
    
    // Defaults tab
    validFrom: '',
    validThrough: '',
    
    // Other data
    accountingNumber: '',
    costCenter: '',
    
    // Parameters
    timeZone: 'UTC',
    dateFormat: 'DD.MM.YYYY',
    
    // Profiles
    profiles: [] as string[],
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersApi.list();
      setUsers(response.data.users);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Admin role required.');
      } else {
        alert('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createForm.roles.length === 0) {
      alert('Please select at least one role');
      return;
    }

    try {
      await usersApi.create({
        username: createForm.username,
        password: createForm.password,
        roles: createForm.roles,
      });
      
      alert(`User '${createForm.username}' created successfully!`);
      setShowCreateModal(false);
      setCreateForm({ username: '', password: '', roles: [] });
      loadUsers();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      alert(`Failed to create user: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!selectedUser) return;

    try {
      await usersApi.changePassword(selectedUser, passwordForm.newPassword);
      alert(`Password changed successfully for user '${selectedUser}'`);
      setShowPasswordModal(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      alert(`Failed to change password: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user '${username}'?`)) {
      return;
    }

    try {
      await usersApi.delete(username);
      alert(`User '${username}' deleted successfully`);
      loadUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(`Failed to delete user: ${error.response?.data?.detail || error.message}`);
    }
  };

  const toggleRole = (role: string) => {
    setCreateForm(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }));
  };

  const getRoleBadgeColor = (role: string): string => {
    const colors: Record<string, string> = {
      'Maintenance_Engineer': '#1890ff',
      'Store_Manager': '#fa8c16',
      'Finance_Officer': '#52c41a',
      'Admin': '#f5222d',
    };
    return colors[role] || '#666';
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>⚙️ Basis Administration</h1>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              Manage system users, roles, and permissions (Admin only)
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
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
            + Create User
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Users</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#1890ff' }}>
            {users.length}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Admins</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#f5222d' }}>
            {users.filter(u => u.roles.includes('Admin')).length}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Engineers</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#1890ff' }}>
            {users.filter(u => u.roles.includes('Maintenance_Engineer')).length}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Managers</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#fa8c16' }}>
            {users.filter(u => u.roles.includes('Store_Manager')).length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', border: '1px solid #e8e8e8' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>System Users</h2>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>No users found</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e8e8e8', backgroundColor: '#fafafa' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#666' }}>Username</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#666' }}>Roles</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#666' }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#666' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.username} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: 500 }}>
                    {user.username}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {user.roles.map(role => (
                        <span
                          key={role}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: getRoleBadgeColor(role),
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {role.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          setSelectedUser(user.username);
                          setShowPasswordModal(true);
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#fa8c16',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                      >
                        Change Password
                      </button>
                      {user.username !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user.username)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ff4d4f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Modal - SAP Style */}
      {showCreateModal && (
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
            backgroundColor: '#e8eef7',
            borderRadius: '4px',
            width: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '2px solid #5b7fa6',
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#5b7fa6',
              color: 'white',
              padding: '12px 20px',
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>Create User</span>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setActiveTab('address');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '0 8px',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                backgroundColor: '#d4dce8',
                borderBottom: '2px solid #5b7fa6',
                padding: '0 8px',
              }}>
                {[
                  { id: 'address', label: 'Address' },
                  { id: 'logon', label: 'Logon data' },
                  { id: 'snc', label: 'SNC' },
                  { id: 'defaults', label: 'Defaults' },
                  { id: 'parameters', label: 'Parameters' },
                  { id: 'roles', label: 'Roles' },
                  { id: 'profiles', label: 'Profiles' },
                  { id: 'groups', label: 'Groups' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      backgroundColor: activeTab === tab.id ? '#e8eef7' : 'transparent',
                      color: '#000',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: activeTab === tab.id ? 600 : 400,
                      borderTop: activeTab === tab.id ? '2px solid #5b7fa6' : 'none',
                      borderLeft: activeTab === tab.id ? '1px solid #5b7fa6' : 'none',
                      borderRight: activeTab === tab.id ? '1px solid #5b7fa6' : 'none',
                      marginTop: activeTab === tab.id ? '0' : '2px',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ padding: '20px', minHeight: '400px' }}>
                {/* Address Tab */}
                {activeTab === 'address' && (
                  <div>
                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Alias</label>
                      <input
                        type="text"
                        value={createForm.alias}
                        onChange={(e) => setCreateForm({ ...createForm, alias: e.target.value })}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>User Type</label>
                      <select
                        value={createForm.userType}
                        onChange={(e) => setCreateForm({ ...createForm, userType: e.target.value })}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                          width: '200px',
                        }}
                      >
                        {USER_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Logon Data Tab */}
                {activeTab === 'logon' && (
                  <div>
                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      Password
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Username *</label>
                      <input
                        type="text"
                        value={createForm.username}
                        onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                        required
                        placeholder="Enter username"
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                          maxWidth: '300px',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Password *</label>
                      <input
                        type="password"
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        required
                        placeholder="Enter password"
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                          maxWidth: '300px',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Password Status</label>
                      <div style={{
                        padding: '6px 8px',
                        backgroundColor: '#e8eef7',
                        fontSize: '13px',
                        border: '1px solid #8b9dc3',
                        maxWidth: '300px',
                      }}>
                        {createForm.passwordStatus}
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginTop: '24px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      User Group for Authorization Check
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>User group</label>
                      <select
                        value={createForm.userGroup}
                        onChange={(e) => setCreateForm({ ...createForm, userGroup: e.target.value })}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                        }}
                      >
                        {USER_GROUPS.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                      <span style={{ fontSize: '13px', color: '#666' }}>User With All Authorizations</span>
                    </div>
                  </div>
                )}

                {/* SNC Tab */}
                {activeTab === 'snc' && (
                  <div style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                    <p>Secure Network Communication (SNC) settings</p>
                    <p style={{ marginTop: '12px' }}>No SNC configuration required for this user type.</p>
                  </div>
                )}

                {/* Defaults Tab */}
                {activeTab === 'defaults' && (
                  <div>
                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      Validity Period
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Valid from</label>
                      <input
                        type="date"
                        value={createForm.validFrom}
                        onChange={(e) => setCreateForm({ ...createForm, validFrom: e.target.value })}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                          maxWidth: '200px',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Valid through</label>
                      <input
                        type="date"
                        value={createForm.validThrough}
                        onChange={(e) => setCreateForm({ ...createForm, validThrough: e.target.value })}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                          maxWidth: '200px',
                        }}
                      />
                    </div>

                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginTop: '24px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      Other Data
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Accounting Number</label>
                      <input
                        type="text"
                        value={createForm.accountingNumber}
                        onChange={(e) => setCreateForm({ ...createForm, accountingNumber: e.target.value })}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                          maxWidth: '200px',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Cost center</label>
                      <input
                        type="text"
                        value={createForm.costCenter}
                        onChange={(e) => setCreateForm({ ...createForm, costCenter: e.target.value })}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                          maxWidth: '200px',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Parameters Tab */}
                {activeTab === 'parameters' && (
                  <div>
                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Time Zone</label>
                      <select
                        value={createForm.timeZone}
                        onChange={(e) => setCreateForm({ ...createForm, timeZone: e.target.value })}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                          maxWidth: '200px',
                        }}
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">EST</option>
                        <option value="PST">PST</option>
                        <option value="CET">CET</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Date Format</label>
                      <select
                        value={createForm.dateFormat}
                        onChange={(e) => setCreateForm({ ...createForm, dateFormat: e.target.value })}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                          maxWidth: '200px',
                        }}
                      >
                        <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Roles Tab */}
                {activeTab === 'roles' && (
                  <div>
                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      Assigned Roles (select at least one) *
                    </div>

                    {AVAILABLE_ROLES.map(role => (
                      <div key={role.value} style={{ marginBottom: '12px', paddingLeft: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={createForm.roles.includes(role.value)}
                            onChange={() => toggleRole(role.value)}
                            style={{ marginRight: '12px', width: '16px', height: '16px' }}
                          />
                          <span style={{ fontSize: '13px' }}>{role.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Profiles Tab */}
                {activeTab === 'profiles' && (
                  <div style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                    <p>User profiles define authorization objects and their values.</p>
                    <p style={{ marginTop: '12px' }}>Profiles are automatically assigned based on selected roles.</p>
                  </div>
                )}

                {/* Groups Tab */}
                {activeTab === 'groups' && (
                  <div style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                    <p>User group: <strong>{createForm.userGroup}</strong></p>
                    <p style={{ marginTop: '12px' }}>User groups are used for authorization checks and reporting.</p>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div style={{
                backgroundColor: '#d4dce8',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                borderTop: '1px solid #8b9dc3',
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setActiveTab('address');
                    setCreateForm({
                      username: '',
                      alias: '',
                      userType: 'Dialog',
                      password: '',
                      passwordStatus: 'Productive password',
                      roles: [],
                      userGroup: 'SUPER',
                      validFrom: '',
                      validThrough: '',
                      accountingNumber: '',
                      costCenter: '',
                      timeZone: 'UTC',
                      dateFormat: 'DD.MM.YYYY',
                      profiles: [],
                    });
                  }}
                  style={{
                    padding: '8px 20px',
                    border: '1px solid #8b9dc3',
                    backgroundColor: '#e8eef7',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#5b7fa6',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal - SAP Style */}
      {showPasswordModal && (
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
            backgroundColor: '#e8eef7',
            borderRadius: '4px',
            width: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '2px solid #5b7fa6',
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#5b7fa6',
              color: 'white',
              padding: '12px 20px',
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>Change User: {selectedUser}</span>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordTab('logon');
                  setPasswordForm({ newPassword: '', confirmPassword: '' });
                  setSelectedUser(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '0 8px',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                backgroundColor: '#d4dce8',
                borderBottom: '2px solid #5b7fa6',
                padding: '0 8px',
              }}>
                {[
                  { id: 'address', label: 'Address' },
                  { id: 'logon', label: 'Logon data' },
                  { id: 'snc', label: 'SNC' },
                  { id: 'defaults', label: 'Defaults' },
                  { id: 'parameters', label: 'Parameters' },
                  { id: 'roles', label: 'Roles' },
                  { id: 'profiles', label: 'Profiles' },
                  { id: 'groups', label: 'Groups' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPasswordTab(tab.id)}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      backgroundColor: passwordTab === tab.id ? '#e8eef7' : 'transparent',
                      color: '#000',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: passwordTab === tab.id ? 600 : 400,
                      borderTop: passwordTab === tab.id ? '2px solid #5b7fa6' : 'none',
                      borderLeft: passwordTab === tab.id ? '1px solid #5b7fa6' : 'none',
                      borderRight: passwordTab === tab.id ? '1px solid #5b9dc3' : 'none',
                      marginTop: passwordTab === tab.id ? '0' : '2px',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ padding: '20px', minHeight: '350px' }}>
                {/* Address Tab */}
                {passwordTab === 'address' && (
                  <div>
                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Username</label>
                      <div style={{
                        padding: '6px 8px',
                        backgroundColor: '#f0f0f0',
                        fontSize: '13px',
                        border: '1px solid #8b9dc3',
                        maxWidth: '300px',
                        color: '#666',
                      }}>
                        {selectedUser}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>User Type</label>
                      <div style={{
                        padding: '6px 8px',
                        backgroundColor: '#f0f0f0',
                        fontSize: '13px',
                        border: '1px solid #8b9dc3',
                        maxWidth: '200px',
                        color: '#666',
                      }}>
                        Dialog
                      </div>
                    </div>

                    <div style={{ padding: '20px', marginTop: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
                        ℹ️ User address information is read-only in change mode. To modify address details, use the full user maintenance transaction.
                      </p>
                    </div>
                  </div>
                )}

                {/* Logon Data Tab */}
                {passwordTab === 'logon' && (
                  <div>
                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      Change Password
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Username</label>
                      <div style={{
                        padding: '6px 8px',
                        backgroundColor: '#f0f0f0',
                        fontSize: '13px',
                        border: '1px solid #8b9dc3',
                        maxWidth: '300px',
                        color: '#666',
                      }}>
                        {selectedUser}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>New Password *</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        placeholder="Enter new password"
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                          maxWidth: '300px',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Confirm Password *</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                        placeholder="Confirm new password"
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #8b9dc3',
                          backgroundColor: 'white',
                          fontSize: '13px',
                          maxWidth: '300px',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Password Status</label>
                      <div style={{
                        padding: '6px 8px',
                        backgroundColor: '#e8eef7',
                        fontSize: '13px',
                        border: '1px solid #8b9dc3',
                        maxWidth: '300px',
                      }}>
                        Will be set to: Productive password
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginTop: '24px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      User Group for Authorization Check
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>User group</label>
                      <div style={{
                        padding: '6px 8px',
                        backgroundColor: '#f0f0f0',
                        fontSize: '13px',
                        border: '1px solid #8b9dc3',
                        maxWidth: '200px',
                        color: '#666',
                      }}>
                        SUPER - User With All Authorizations
                      </div>
                    </div>
                  </div>
                )}

                {/* SNC Tab */}
                {passwordTab === 'snc' && (
                  <div style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      Secure Network Communication (SNC)
                    </div>
                    <p>SNC settings for user: <strong>{selectedUser}</strong></p>
                    <p style={{ marginTop: '12px' }}>No SNC configuration required for this user type.</p>
                  </div>
                )}

                {/* Defaults Tab */}
                {passwordTab === 'defaults' && (
                  <div>
                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      Validity Period
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Valid from</label>
                      <div style={{
                        padding: '6px 8px',
                        backgroundColor: '#f0f0f0',
                        fontSize: '13px',
                        border: '1px solid #8b9dc3',
                        maxWidth: '200px',
                        color: '#666',
                      }}>
                        {new Date().toLocaleDateString('en-GB')}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Valid through</label>
                      <div style={{
                        padding: '6px 8px',
                        backgroundColor: '#f0f0f0',
                        fontSize: '13px',
                        border: '1px solid #8b9dc3',
                        maxWidth: '200px',
                        color: '#666',
                      }}>
                        31.12.9999
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginTop: '24px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      Other Data
                    </div>

                    <div style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                      <p>Additional user defaults are read-only in password change mode.</p>
                    </div>
                  </div>
                )}

                {/* Parameters Tab */}
                {passwordTab === 'parameters' && (
                  <div>
                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      User Parameters
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Time Zone</label>
                      <div style={{
                        padding: '6px 8px',
                        backgroundColor: '#f0f0f0',
                        fontSize: '13px',
                        border: '1px solid #8b9dc3',
                        maxWidth: '200px',
                        color: '#666',
                      }}>
                        UTC
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500 }}>Date Format</label>
                      <div style={{
                        padding: '6px 8px',
                        backgroundColor: '#f0f0f0',
                        fontSize: '13px',
                        border: '1px solid #8b9dc3',
                        maxWidth: '200px',
                        color: '#666',
                      }}>
                        DD.MM.YYYY
                      </div>
                    </div>
                  </div>
                )}

                {/* Roles Tab */}
                {passwordTab === 'roles' && (
                  <div>
                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      Assigned Roles
                    </div>

                    <div style={{ padding: '12px', backgroundColor: 'white', border: '1px solid #8b9dc3' }}>
                      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666' }}>
                        Current roles for user: <strong>{selectedUser}</strong>
                      </p>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        Role assignments are read-only in password change mode.
                      </div>
                    </div>
                  </div>
                )}

                {/* Profiles Tab */}
                {passwordTab === 'profiles' && (
                  <div style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      User Profiles
                    </div>
                    <p>User profiles define authorization objects and their values.</p>
                    <p style={{ marginTop: '12px' }}>Profiles are automatically assigned based on roles.</p>
                  </div>
                )}

                {/* Groups Tab */}
                {passwordTab === 'groups' && (
                  <div style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                    <div style={{
                      backgroundColor: '#c8d4e3',
                      padding: '8px 12px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #8b9dc3',
                    }}>
                      User Groups
                    </div>
                    <p>User group: <strong>SUPER</strong></p>
                    <p style={{ marginTop: '12px' }}>User groups are used for authorization checks and reporting.</p>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div style={{
                backgroundColor: '#d4dce8',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                borderTop: '1px solid #8b9dc3',
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordTab('logon');
                    setPasswordForm({ newPassword: '', confirmPassword: '' });
                    setSelectedUser(null);
                  }}
                  style={{
                    padding: '8px 20px',
                    border: '1px solid #8b9dc3',
                    backgroundColor: '#e8eef7',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#5b7fa6',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

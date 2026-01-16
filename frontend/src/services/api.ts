/**
 * API Service Layer
 * Requirement 8.1 - API client with JWT interceptor
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8100/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT token storage
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
};

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  refresh: (token: string) =>
    api.post('/auth/refresh', { token }),
};

// Tickets API
export const ticketsApi = {
  list: (params?: { module?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/tickets', { params }),
  create: (data: { module: string; ticket_type: string; priority: string; title: string; description?: string; created_by: string }) =>
    api.post('/tickets', data),
  get: (ticketId: string) =>
    api.get(`/tickets/${ticketId}`),
  updateStatus: (ticketId: string, newStatus: string, changedBy: string, comment?: string) =>
    api.patch(`/tickets/${ticketId}/status`, { new_status: newStatus, changed_by: changedBy, comment }),
  getAudit: (ticketId: string) =>
    api.get(`/tickets/${ticketId}/audit`),
};

// PM API
export const pmApi = {
  // Assets
  createAsset: (data: any) => api.post('/pm/assets', data),
  listAssets: (params?: any) => api.get('/pm/assets', { params }),
  getAsset: (assetId: string) => api.get(`/pm/assets/${assetId}`),
  // Maintenance Orders
  createMaintenanceOrder: (data: any) => api.post('/pm/maintenance-orders', data),
  listMaintenanceOrders: (params?: any) => api.get('/pm/maintenance-orders', { params }),
  // Incidents
  createIncident: (data: any) => api.post('/pm/incidents', data),
};

// MM API
export const mmApi = {
  // Materials
  createMaterial: (data: any) => api.post('/mm/materials', data),
  listMaterials: (params?: any) => api.get('/mm/materials', { params }),
  getMaterial: (materialId: string) => api.get(`/mm/materials/${materialId}`),
  // Stock Transactions
  createTransaction: (data: any) => api.post('/mm/stock-transactions', data),
  getTransactionHistory: (materialId: string) => api.get(`/mm/materials/${materialId}/transactions`),
  // Requisitions
  createRequisition: (data: any) => api.post('/mm/purchase-requisitions', data),
  listRequisitions: (params?: any) => api.get('/mm/purchase-requisitions', { params }),
};

// FI API
export const fiApi = {
  // Cost Centers
  createCostCenter: (data: any) => api.post('/fi/cost-centers', data),
  listCostCenters: (params?: any) => api.get('/fi/cost-centers', { params }),
  getCostCenter: (costCenterId: string) => api.get(`/fi/cost-centers/${costCenterId}`),
  // Cost Entries
  createCostEntry: (data: any) => api.post('/fi/cost-entries', data),
  listCostEntries: (params?: any) => api.get('/fi/cost-entries', { params }),
  // Approvals
  createApproval: (data: any) => api.post('/fi/approval-requests', data),
  listApprovals: (params?: any) => api.get('/fi/approval-requests', { params }),
  approveRequest: (approvalId: string, decidedBy: string, comment?: string) =>
    api.post(`/fi/approval-requests/${approvalId}/approve`, { decided_by: decidedBy, comment }),
  rejectRequest: (approvalId: string, decidedBy: string, comment?: string) =>
    api.post(`/fi/approval-requests/${approvalId}/reject`, { decided_by: decidedBy, comment }),
};

export default api;

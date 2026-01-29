/**
 * API Service Layer
 * Requirement 8.1 - API client with JWT interceptor
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import logger from '../utils/logger';
import { trackApiCall } from '../utils/performance';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:2004/api/v1';

// Log the API URL for debugging
console.log('🔗 API Base URL:', API_BASE_URL);

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

// Request interceptor - add JWT token and logging
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log API call
    logger.apiCall(
      config.method?.toUpperCase() || 'UNKNOWN',
      config.url || 'unknown',
      config.data,
      'API'
    );

    return config;
  },
  (error) => {
    logger.error('API request interceptor error', error, 'API');
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and logging
api.interceptors.response.use(
  (response) => {
    // Log successful API response
    logger.apiSuccess(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      response.config.url || 'unknown',
      {
        status: response.status,
        statusText: response.statusText,
        dataSize: JSON.stringify(response.data).length,
      },
      'API'
    );
    return response;
  },
  (error: AxiosError) => {
    // Log API error
    logger.apiError(
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      error.config?.url || 'unknown',
      error,
      'API'
    );

    if (error.response?.status === 401) {
      logger.warn('Authentication failed, redirecting to login', { status: 401 }, 'AUTH');
      setAuthToken(null);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Enhanced API call wrapper with performance tracking
const apiCall = async <T>(call: () => Promise<T>, method: string, url: string): Promise<T> => {
  return trackApiCall(method, url, call);
};

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    apiCall(() => api.post('/auth/login', { username, password }), 'POST', '/auth/login'),
  refresh: (token: string) =>
    apiCall(() => api.post('/auth/refresh', { token }), 'POST', '/auth/refresh'),
};

// Tickets API
export const ticketsApi = {
  list: (params?: { module?: string; status?: string; page?: number; limit?: number }) =>
    apiCall(() => api.get('/tickets', { params }), 'GET', '/tickets'),
  create: (data: { module: string; ticket_type: string; priority: string; title: string; description?: string; created_by: string }) =>
    apiCall(() => api.post('/tickets', data), 'POST', '/tickets'),
  get: (ticketId: string) =>
    apiCall(() => api.get(`/tickets/${ticketId}`), 'GET', `/tickets/${ticketId}`),
  updateStatus: (ticketId: string, newStatus: string, changedBy: string, comment?: string) =>
    apiCall(() => api.patch(`/tickets/${ticketId}/status`, { new_status: newStatus, changed_by: changedBy, comment }), 'PATCH', `/tickets/${ticketId}/status`),
  getAudit: (ticketId: string) =>
    apiCall(() => api.get(`/tickets/${ticketId}/audit`), 'GET', `/tickets/${ticketId}/audit`),
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

// Users API (Admin only)
export const usersApi = {
  list: () =>
    apiCall(() => api.get('/users'), 'GET', '/users'),
  create: (data: { username: string; password: string; roles: string[] }) =>
    apiCall(() => api.post('/users', data), 'POST', '/users'),
  get: (username: string) =>
    apiCall(() => api.get(`/users/${username}`), 'GET', `/users/${username}`),
  changePassword: (username: string, newPassword: string) =>
    apiCall(() => api.patch(`/users/${username}/password`, { username, new_password: newPassword }), 'PATCH', `/users/${username}/password`),
  delete: (username: string) =>
    apiCall(() => api.delete(`/users/${username}`), 'DELETE', `/users/${username}`),
};

export default api;

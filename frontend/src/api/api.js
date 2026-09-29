import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://blockchain-document-wallet-32237917665.asia-south2.run.app/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
let refreshing;
api.interceptors.response.use(r => r, async error => {
  const config = error.config;
  if ([401,403].includes(error.response?.status) && config && !config._retry && !config.url.includes('/admin/login')) {
    config._retry = true;
    try {
      refreshing ||= axios.post(`${API_BASE_URL}/admin/refresh`, { refreshToken: sessionStorage.getItem('admin_refresh') }).then(({data}) => {
        sessionStorage.setItem('admin_token', data.accessToken); sessionStorage.setItem('admin_refresh', data.refreshToken);
      }).finally(() => { refreshing = null; });
      await refreshing;
      return api(config);
    } catch { window.dispatchEvent(new Event('admin-session-expired')); }
  }
  return Promise.reject(error);
});
export const adminApi = {
  // Admin Authentication
  login: (email, password) => api.post('/admin/login', { email, password }),

  // Citizen Document Verification Pipeline
  getDocuments: () => api.get('/admin/documents'),
  verifyDocument: (data) => api.post('/admin/verify', data), // action: APPROVE | REJECT | CHANGE_TAG | UNDER_REVIEW

  // Police Officer Account Verification Pipeline
  getPoliceOfficers: () => api.get('/admin/officers'),
  verifyOfficer: (data) => api.post('/admin/verify-officer', data), // officerId, status: APPROVED | REJECTED | SUSPENDED | DEACTIVATED

  // User Management
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (data) => api.post('/admin/users/status', data),
  getUserById: (userId) => api.get(`/police/lookup/${userId}`),

  // Blockchain Ledger Monitoring
  getBlockchainRecords: () => api.get('/admin/blockchain-records'),
  getBlockchainStatus: (documentId) => api.get(`/documents/${documentId}/blockchain-status`),

  // Audit Logs
  getAuditLogs: () => api.get('/admin/audit-logs-full'),
};

export default api;

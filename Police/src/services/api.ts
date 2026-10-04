import axios from 'axios';
import { Platform } from 'react-native';
import { tokenStorage } from './tokenStorage';

// Configured for local development on Android emulator (10.0.2.2:5000) & Cloud Run production
const DEV_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1';
const PROD_API_URL = 'https://blockchain-document-wallet-32237917665.asia-south2.run.app/api/v1';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// SECTION 17: Inject Access Token from secure Keychain into Authorization Bearer Header
api.interceptors.request.use(
  async config => {
    try {
      const { accessToken } = await tokenStorage.getTokens();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (e) {
      console.warn('Failed to retrieve officer access token from Keychain', e);
    }
    return config;
  },
  error => Promise.reject(error),
);

// SECTION 17: Silent Token Refresh Interceptor on HTTP 401
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = await tokenStorage.getTokens();
        if (refreshToken) {
          const refreshRes = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {
              refreshToken,
            },
          );

          const { accessToken: newAccess, refreshToken: newRefresh } =
            refreshRes.data;
          if (newAccess) {
            await tokenStorage.saveTokens(
              newAccess,
              newRefresh || refreshToken,
            );
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshErr) {
        console.warn(
          'Officer refresh token expired, clearing Keychain session',
        );
        await tokenStorage.clearTokens();
      }
    }

    return Promise.reject(error);
  },
);

export const policeApi = {
  getNotifications: async () => (await api.get('/notifications')).data,
  getProfile: async () => (await api.get('/police/profile')).data,
  logout: async (refreshToken: string | null) =>
    (await api.post('/auth/logout', { refreshToken })).data,
  changePassword: async (payload: object) =>
    (await api.post('/police/profile/password', payload)).data,
  updateContact: async (payload: object) =>
    (await api.patch('/police/profile/contact', payload)).data,
  /**
   * SECTION 22: Police Search API (POST /v1/police/search)
   * Evaluates strictly: verificationStatus == APPROVED AND adminApprovedTag == VEHICLE
   */
  lookupCitizenByUserId: async (userPublicId: string) => {
    const formattedId = userPublicId.trim().toUpperCase();
    try {
      const response = await api.post('/police/search', {
        userId: formattedId,
      });
      return response.data;
    } catch (e) {
      const response = await api.get(`/police/lookup/${formattedId}`);
      return response.data;
    }
  },

  getSearchHistory: async () => {
    const response = await api.get('/police/search-history');
    return response.data;
  },
};

export default api;

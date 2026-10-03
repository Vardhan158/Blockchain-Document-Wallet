import axios from 'axios';
import { tokenStorage } from './tokenStorage';

// Default base URL configured for Cloud Run deployment
export const API_BASE_URL = 'https://blockchain-document-wallet-32237917665.asia-south2.run.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  // Cloud Run may need a cold start; registration also triggers OTP delivery.
  // Keep enough time for the API to respond while still failing predictably.
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject Access Token from secure Keychain
api.interceptors.request.use(
  async config => {
    try {
      const { accessToken } = await tokenStorage.getTokens();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (e) {
      console.warn('Failed to retrieve access token from secure storage', e);
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor to handle token expiration & Section 64 error formatting
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // SECTION 64: Section 401 Unauthorized handling with Silent Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = await tokenStorage.getTokens();
        if (refreshToken) {
          // Attempt silent token refresh
          const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken: newAccess, refreshToken: newRefresh } = refreshRes.data;
          if (newAccess) {
            await tokenStorage.saveTokens(newAccess, newRefresh || refreshToken);
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshErr) {
        console.warn('Refresh token expired or invalid, executing secure session logout');
        await tokenStorage.clearTokens();
      }
    }

    // SECTION 64: User-friendly error message formatting
    if (!error.response) {
      error.userFriendlyTitle = 'Upload Failed';
      error.userFriendlyMessage = "We couldn't upload your document. Please check your internet connection and try again.";
    } else if (error.response.status >= 500) {
      error.userFriendlyTitle = 'Something Went Wrong';
      error.userFriendlyMessage = 'Please try again.';
    }

    return Promise.reject(error);
  }
);

export default api;

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { tokenStorage } from '../services/tokenStorage';
import { User } from '../types/models';

export interface RegisterData {
  fullName: string;
  dob?: string;
  phone: string;
  email: string;
  password: string;
  gender?: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  initAuth: () => Promise<boolean>;
  fetchProfile: () => Promise<void>;
  login: (email: string, pass: string) => Promise<{ success: boolean; requiresVerification?: boolean; email?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; requiresVerification?: boolean; email?: string; otpDemo?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; userId?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; message: string; otpDemo?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,

  initAuth: async () => {
    set({ isLoading: true });
    try {
      const { accessToken } = await tokenStorage.getTokens(true);

      if (accessToken) {
        // Validate token in real-time with backend
        try {
          const res = await api.get('/auth/profile', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (res.data?.user) {
            set({
              token: accessToken,
              user: res.data.user,
              isLoading: false,
            });
            await AsyncStorage.setItem('auth_user', JSON.stringify(res.data.user));
            return true;
          }
        } catch (apiError: any) {
          // If backend rejects access token, clear stale credentials
          if (apiError.response?.status === 401) {
            await tokenStorage.clearTokens();
          } else {
            // Network issue: fallback to cached user if available
            const storedUser = await AsyncStorage.getItem('auth_user');
            if (storedUser) {
              set({
                token: accessToken,
                user: JSON.parse(storedUser),
                isLoading: false,
              });
              return true;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load stored auth state', e);
    }

    set({ token: null, user: null, isLoading: false });
    return false;
  },

  fetchProfile: async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data?.user) {
        set({ user: res.data.user });
        await AsyncStorage.setItem('auth_user', JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.warn('Failed to fetch profile', e);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, token, user } = response.data;
      const activeAccess = accessToken || token;

      if (activeAccess) {
        // Securely store Access Token (15m) & Refresh Token (7d) in Keychain
        await tokenStorage.saveTokens(activeAccess, refreshToken);
        await AsyncStorage.setItem('auth_user', JSON.stringify(user));

        set({ token: activeAccess, user, isLoading: false });

        return { success: true };
      }
      set({ isLoading: false });
      return { success: false };
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        const msg = err.response?.data?.message || 'Please verify your email address.';
        set({ error: msg, isLoading: false });
        return { success: false, requiresVerification: true, email: err.response.data.email };
      }
      const msg = err.response?.data?.message || 'Invalid email or password. Please check credentials.';
      set({ error: msg, isLoading: false });
      return { success: false };
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', data);
      set({ isLoading: false });
      return {
        success: true,
        requiresVerification: response.data.requiresVerification ?? true,
        email: data.email,
        otpDemo: response.data.otpDemo,
      };
    } catch (err: any) {
      const msg = err.response?.data?.message ||
        (err.code === 'ECONNABORTED'
          ? 'Registration is taking longer than expected. Please check your email before trying again.'
          : 'Unable to reach the registration service. Please check your internet connection and try again.');
      set({ error: msg, isLoading: false });
      return { success: false };
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const { accessToken, refreshToken, token, user } = response.data;
      const activeAccess = accessToken || token;

      if (activeAccess && user) {
        // Securely store Access Token (15m) & Refresh Token (7d) in Keychain
        await tokenStorage.saveTokens(activeAccess, refreshToken);
        await AsyncStorage.setItem('auth_user', JSON.stringify(user));

        set({ token: activeAccess, user, isLoading: false });

        return { success: true, userId: user.userId };
      }
      set({ isLoading: false });
      return { success: false };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP code.';
      set({ error: msg, isLoading: false });
      return { success: false };
    }
  },

  resendOtp: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/resend-otp', { email });
      set({ isLoading: false });
      return {
        success: true,
        message: response.data.message || 'Fresh OTP code sent to your email.',
        otpDemo: response.data.otpDemo,
      };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to resend OTP code.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      // Revoke the currently held refresh token when possible. A logout must
      // remove the encrypted session as well as the in-memory app state.
      const { refreshToken } = await tokenStorage.getTokens();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      // Local credential removal is still required when the device is offline.
      console.warn('Server logout could not be completed; clearing local session.', error);
    } finally {
      await tokenStorage.clearTokens();
      set({ user: null, token: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;

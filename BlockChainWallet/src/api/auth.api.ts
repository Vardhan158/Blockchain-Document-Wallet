import api from '../services/api';

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  resendOtp: (email: string) => api.post('/auth/resend-otp', { email }),
  login: (email: string, pass: string) => api.post('/auth/login', { email, password: pass }),
  logout: (refreshToken?: string) => api.post('/auth/logout', { refreshToken }),
  refreshTokens: (refreshToken: string) => api.post('/auth/refresh-token', { refreshToken }),
  initiateForgotPassword: (emailOrPhone: string) => api.post('/auth/forgot-password/initiate', { emailOrPhone }),
  verifyForgotPasswordOtp: (email: string, otp: string) => api.post('/auth/forgot-password/verify', { email, otp }),
  resetForgotPassword: (data: any) => api.post('/auth/forgot-password/reset', data),
  getProfile: () => api.get('/auth/profile'),
};

export default authApi;

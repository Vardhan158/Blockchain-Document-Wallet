import api from '../services/api';

export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  getPublicUserId: () => api.get('/users/me/user-id'),
  registerDeviceToken: (fcmToken: string) => api.post('/v1/devices/register', { fcmToken }),
  deregisterDevice: (deviceId: string) => api.delete(`/devices/${deviceId}`),
};

export default userApi;

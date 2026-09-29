import { create } from 'zustand';
import api from '../services/api';
import { NotificationItem } from '../types/models';
import { triggerSystemStatusBarNotification } from '../services/systemNotificationService';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/notifications');
      const notifs: NotificationItem[] = response.data.notifications || [];

      notifs.forEach(n => {
        if (!n.read) {
          triggerSystemStatusBarNotification(n.id, n.title, n.message);
        }
      });

      set({
        notifications: notifs,
        unreadCount: response.data.unreadCount || 0,
        isLoading: false,
      });
    } catch {
      set({ error: 'Failed to load notifications', isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      const updated = get().notifications.map(n => (n.id === id ? { ...n, read: true } : n));
      const unread = updated.filter(n => !n.read).length;
      set({ notifications: updated, unreadCount: unread });
    } catch (e) {
      console.warn('Failed to mark notification read', e);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true,
        })),
        unreadCount: 0,
      }));
    } catch (e) {
      console.warn('Failed to mark all notifications read', e);
    }
  },
}));

export default useNotificationStore;


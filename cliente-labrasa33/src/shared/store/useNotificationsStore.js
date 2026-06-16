import { create } from 'zustand';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notifications.js';

const POLL_MS = 30000;

let pollTimer = null;

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const res = await getNotifications();
      const data = res.data ?? res;
      set({
        notifications: data.notifications ?? [],
        unreadCount: data.unreadCount ?? 0,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    try {
      await markNotificationRead(id);
      set({
        notifications: get().notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch { /* ignore */ }
  },

  markAllRead: async () => {
    try {
      await markAllNotificationsRead();
      set({
        notifications: get().notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      });
    } catch { /* ignore */ }
  },

  startPolling: () => {
    if (pollTimer) return;
    get().fetchNotifications();
    pollTimer = setInterval(() => get().fetchNotifications(), POLL_MS);
  },

  stopPolling: () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  },
}));

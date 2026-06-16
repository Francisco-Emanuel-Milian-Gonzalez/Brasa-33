import { axiosAdmin } from './api';

export const getNotifications = () =>
  axiosAdmin.get('/notifications').then((r) => r.data);

export const markNotificationRead = (id) =>
  axiosAdmin.put(`/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () =>
  axiosAdmin.put('/notifications/read-all').then((r) => r.data);

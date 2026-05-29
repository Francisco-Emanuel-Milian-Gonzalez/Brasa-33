import {
  getNotificationsByUser,
  markNotificationRead,
  markAllNotificationsRead,
  countUnreadNotifications,
} from './notification.model.js';

export const getMyNotifications = async (userId) => {
  const [notifications, unreadCount] = await Promise.all([
    getNotificationsByUser(userId),
    countUnreadNotifications(userId),
  ]);
  return { notifications, unreadCount };
};

export const markAsRead = async (id, userId) => {
  const notification = await markNotificationRead(id, userId);
  if (!notification) {
    const error = new Error('Notificación no encontrada');
    error.status = 404;
    throw error;
  }
  return notification;
};

export const markAllAsRead = async (userId) => {
  await markAllNotificationsRead(userId);
  return { success: true };
};

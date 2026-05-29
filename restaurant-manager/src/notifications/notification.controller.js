import {
  getMyNotifications as getMyNotificationsService,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
} from './notification.service.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const data = await getMyNotificationsService(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await markAsReadService(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await markAllAsReadService(req.user.id);
    res.status(200).json({ success: true, message: 'Todas marcadas como leídas' });
  } catch (error) {
    next(error);
  }
};

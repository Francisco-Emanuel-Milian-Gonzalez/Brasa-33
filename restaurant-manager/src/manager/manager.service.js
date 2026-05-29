import { getRestaurantByManagerUserId } from './manager.model.js';

export const getMyRestaurant = async (userId) => {
  if (!userId) {
    const error = new Error('Usuario no autenticado');
    error.status = 401;
    throw error;
  }
  return getRestaurantByManagerUserId(userId);
};

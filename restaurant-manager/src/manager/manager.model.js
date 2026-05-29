import { getManagerRestaurant } from '../utils/managerRestaurant.js';

export const getRestaurantByManagerUserId = async (userId) =>
  getManagerRestaurant(userId);

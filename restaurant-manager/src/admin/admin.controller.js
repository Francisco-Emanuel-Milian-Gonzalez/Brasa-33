import {
  getGlobalStats as getGlobalStatsService,
  getRestaurantPerformance as getRestaurantPerformanceService,
  getAllRestaurantsAdmin as getAllRestaurantsAdminService,
  toggleRestaurantActive as toggleRestaurantActiveService,
  getPendingPromotions as getPendingPromotionsService,
} from './admin.service.js';

export const getGlobalStats = async (req, res, next) => {
  try {
    const stats = await getGlobalStatsService();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantPerformance = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const performance = await getRestaurantPerformanceService(restaurantId);
    res.status(200).json({ success: true, data: performance });
  } catch (error) {
    next(error);
  }
};

export const getAllRestaurantsAdmin = async (req, res, next) => {
  try {
    const restaurants = await getAllRestaurantsAdminService();
    res.status(200).json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
};

export const toggleRestaurantActive = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'El campo is_active debe ser booleano' });
    }
    const restaurant = await toggleRestaurantActiveService(restaurantId, is_active);
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

export const getPendingPromotions = async (req, res, next) => {
  try {
    const promotions = await getPendingPromotionsService();
    res.status(200).json({ success: true, data: promotions });
  } catch (error) {
    next(error);
  }
};
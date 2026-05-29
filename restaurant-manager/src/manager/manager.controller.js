import { getMyRestaurant as getMyRestaurantService } from './manager.service.js';

export const getMyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await getMyRestaurantService(req.user.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el restaurante asignado a tu cuenta',
      });
    }
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

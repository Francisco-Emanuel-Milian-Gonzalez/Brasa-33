import {
  createRestaurant as createRestaurantService,
  getRestaurants as getRestaurantsService,
  getRestaurantById as getRestaurantByIdService,
  updateRestaurant as updateRestaurantService,
  assignManager as assignManagerService,
  deleteRestaurant as deleteRestaurantService,
} from './restaurant.service.js';

export const createRestaurant = async (req, res, next) => {
  try {
    const restaurant = await createRestaurantService(req.body, req.file);
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

export const getRestaurants = async (req, res, next) => {
  try {
    const restaurants = await getRestaurantsService();
    res.status(200).json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await getRestaurantByIdService(req.params.id);
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await updateRestaurantService(req.params.id, req.body, req.file);
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

export const assignManager = async (req, res, next) => {
  try {
    const { manager_id: managerId } = req.body;
    const restaurant = await assignManagerService(req.params.id, managerId ?? null);
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurant = async (req, res, next) => {
  try {
    await deleteRestaurantService(req.params.id);
    res.status(200).json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    next(error);
  }
};
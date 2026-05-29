import {
  createDish as createDishService,
  getDishes as getDishesService,
  getDishById as getDishByIdService,
  getDishesByRestaurant as getDishesByRestaurantService,
  updateDish as updateDishService,
  updateDishStock as updateDishStockService,
  deleteDish as deleteDishService,
} from './menu.service.js';

export const createDish = async (req, res, next) => {
  try {
    const dish = await createDishService(req.user, req.body, req.file);
    res.status(201).json({ success: true, data: dish });
  } catch (error) {
    next(error);
  }
};

export const getDishes = async (req, res, next) => {
  try {
    const restaurantId = req.query.restaurant_id;
    const dishes = restaurantId
      ? await getDishesByRestaurantService(restaurantId)
      : await getDishesService();
    res.status(200).json({ success: true, data: dishes });
  } catch (error) {
    next(error);
  }
};

export const getDishById = async (req, res, next) => {
  try {
    const dish = await getDishByIdService(req.params.id);
    res.status(200).json({ success: true, data: dish });
  } catch (error) {
    next(error);
  }
};

export const getDishesByRestaurant = async (req, res, next) => {
  try {
    const dishes = await getDishesByRestaurantService(req.params.restaurantId);
    res.status(200).json({ success: true, data: dishes });
  } catch (error) {
    next(error);
  }
};

export const updateDish = async (req, res, next) => {
  try {
    const dish = await updateDishService(req.params.id, req.user, req.body, req.file);
    res.status(200).json({ success: true, data: dish });
  } catch (error) {
    next(error);
  }
};

export const updateDishStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    const dish = await updateDishStockService(req.params.id, Number(stock), req.user);
    res.status(200).json({ success: true, data: dish });
  } catch (error) {
    next(error);
  }
};

export const deleteDish = async (req, res, next) => {
  try {
    await deleteDishService(req.params.id, req.user);
    res.status(200).json({ success: true, message: 'Dish deleted successfully' });
  } catch (error) {
    next(error);
  }
};

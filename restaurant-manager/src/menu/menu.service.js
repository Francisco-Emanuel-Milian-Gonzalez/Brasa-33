import {
  createDish as createDishModel,
  getAllDishes,
  getDishById as getDishByIdModel,
  getDishesByRestaurant as getDishesByRestaurantModel,
  updateDish as updateDishModel,
  updateDishStock as updateDishStockModel,
  deleteDish as deleteDishModel,
  getRestaurantById,
} from './menu.model.js';
import { uploadImageBuffer } from '../utils/cloudinaryUpload.js';
import {
  resolveRestaurantIdForUser,
  assertManagerCanAccess,
  isManagerRole,
} from '../utils/managerRestaurant.js';

const parsePayload = (body) => ({
  name: body.name,
  description: body.description ?? '',
  price: body.price !== undefined ? Number(body.price) : undefined,
  stock: body.stock !== undefined ? Number(body.stock) : undefined,
  category: body.category ?? 'main',
  ingredients: body.ingredients ?? null,
});

const validateDishPayload = (payload, requireAll = true) => {
  const { name, description, price, stock } = payload;
  if (requireAll && (!name || description === undefined || price === undefined || stock === undefined)) {
    const error = new Error('Los campos name, description, price y stock son obligatorios');
    error.status = 400;
    throw error;
  }
  if (price !== undefined && (Number.isNaN(price) || price <= 0)) {
    const error = new Error('El precio debe ser un número mayor a 0');
    error.status = 400;
    throw error;
  }
  if (stock !== undefined && (Number.isNaN(stock) || stock < 0)) {
    const error = new Error('El stock debe ser un número mayor o igual a 0');
    error.status = 400;
    throw error;
  }
};

export const createDish = async (user, body, file) => {
  const payload = parsePayload(body);
  validateDishPayload(payload);

  const restaurant_id = await resolveRestaurantIdForUser(user, body.restaurant_id);

  const restaurant = await getRestaurantById(restaurant_id);
  if (!restaurant) {
    const error = new Error('Restaurante no encontrado');
    error.status = 404;
    throw error;
  }

  let image_url = null;
  if (file) image_url = await uploadImageBuffer(file.buffer, 'brasa33/menu');

  return createDishModel({ ...payload, restaurant_id, image_url });
};

export const getDishes = async (restaurantId) => {
  if (restaurantId) {
    return getDishesByRestaurant(restaurantId);
  }
  return getAllDishes();
};

export const getDishById = async (id) => {
  const dish = await getDishByIdModel(id);
  if (!dish) {
    const error = new Error('Dish not found');
    error.status = 404;
    throw error;
  }
  return dish;
};

export const getDishesByRestaurant = async (restaurantId) => {
  const restaurant = await getRestaurantById(restaurantId);
  if (!restaurant) {
    const error = new Error('Restaurant not found');
    error.status = 404;
    throw error;
  }
  return getDishesByRestaurantModel(restaurantId);
};

export const updateDish = async (id, user, body, file) => {
  const dish = await getDishByIdModel(id);
  if (!dish) {
    const error = new Error('Dish not found');
    error.status = 404;
    throw error;
  }

  if (isManagerRole(user.role)) {
    await assertManagerCanAccess(user, dish.restaurant_id);
  }

  const payload = parsePayload(body);
  validateDishPayload(payload, false);

  let image_url;
  if (file) image_url = await uploadImageBuffer(file.buffer, 'brasa33/menu');

  const updateFields = { ...payload };
  if (image_url) updateFields.image_url = image_url;

  return updateDishModel(id, updateFields);
};

export const updateDishStock = async (id, stock, user) => {
  if (typeof stock !== 'number' || stock < 0) {
    const error = new Error('El stock debe ser un número mayor o igual a 0');
    error.status = 400;
    throw error;
  }

  const dish = await getDishByIdModel(id);
  if (!dish) {
    const error = new Error('Dish not found');
    error.status = 404;
    throw error;
  }

  if (user && isManagerRole(user.role)) {
    await assertManagerCanAccess(user, dish.restaurant_id);
  }

  return updateDishStockModel(id, stock);
};

export const deleteDish = async (id, user) => {
  const dish = await getDishByIdModel(id);
  if (!dish) {
    const error = new Error('Dish not found');
    error.status = 404;
    throw error;
  }

  if (user && isManagerRole(user.role)) {
    await assertManagerCanAccess(user, dish.restaurant_id);
  }

  await deleteDishModel(id);
};

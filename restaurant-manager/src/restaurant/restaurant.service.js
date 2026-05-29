import {
  createRestaurant as createRestaurantModel,
  getAllRestaurants,
  getRestaurantById as getRestaurantByIdModel,
  updateRestaurant as updateRestaurantModel,
  assignManagerToRestaurant as assignManagerModel,
  deleteRestaurant as deleteRestaurantModel,
} from './restaurant.model.js';
import { pool } from '../config/db.js';
import { uploadImageBuffer } from '../utils/cloudinaryUpload.js';

const validateRestaurantPayload = ({ name, address, phone }) => {
  if (!name || !address || !phone) {
    const error = new Error('Los campos name, address y phone son obligatorios');
    error.status = 400;
    throw error;
  }
};

export const createRestaurant = async (payload, file) => {
  validateRestaurantPayload(payload);
  let logo_url = null;
  if (file) logo_url = await uploadImageBuffer(file.buffer, 'brasa33/restaurants');
  return await createRestaurantModel({ ...payload, logo_url });
};

export const getRestaurants = async () => await getAllRestaurants();

export const getRestaurantById = async (id) => {
  const restaurant = await getRestaurantByIdModel(id);
  if (!restaurant) {
    const error = new Error('Restaurant not found');
    error.status = 404;
    throw error;
  }
  return restaurant;
};

export const updateRestaurant = async (id, payload, file) => {
  const restaurant = await getRestaurantByIdModel(id);
  if (!restaurant) {
    const error = new Error('Restaurant not found');
    error.status = 404;
    throw error;
  }
  validateRestaurantPayload(payload);
  let logo_url = null;
  if (file) logo_url = await uploadImageBuffer(file.buffer, 'brasa33/restaurants');
  return await updateRestaurantModel(id, { ...payload, logo_url });
};

export const assignManager = async (restaurantId, managerId) => {
  const restaurant = await getRestaurantByIdModel(restaurantId);
  if (!restaurant) {
    const error = new Error('Restaurante no encontrado');
    error.status = 404;
    throw error;
  }

  if (managerId) {
    const { rows } = await pool.query(
      'SELECT id FROM restaurants WHERE manager_id = $1 AND id != $2',
      [managerId, restaurantId],
    );
    if (rows.length > 0) {
      const error = new Error('Este gerente ya tiene otro restaurante asignado');
      error.status = 409;
      throw error;
    }
  }

  return await assignManagerModel(restaurantId, managerId);
};

export const deleteRestaurant = async (id) => {
  const restaurant = await getRestaurantByIdModel(id);
  if (!restaurant) {
    const error = new Error('Restaurant not found');
    error.status = 404;
    throw error;
  }
  await deleteRestaurantModel(id);
};

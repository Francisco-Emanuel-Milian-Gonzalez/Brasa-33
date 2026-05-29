import {
  getInventoryByRestaurant,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryItemById,
} from './inventory.model.js';
import { requireManagerRestaurantId } from '../utils/managerRestaurant.js';

const getRestaurantId = async (userId) => requireManagerRestaurantId(userId);

export const listInventory = async (userId) => {
  const restaurantId = await getRestaurantId(userId);
  return getInventoryByRestaurant(restaurantId);
};

export const addInventoryItem = async (userId, payload) => {
  const restaurantId = await getRestaurantId(userId);
  if (!payload.ingredient?.trim()) {
    const error = new Error('El ingrediente es obligatorio');
    error.status = 400;
    throw error;
  }
  return createInventoryItem({
    restaurant_id: restaurantId,
    ingredient: payload.ingredient.trim(),
    quantity: payload.quantity,
    unit: payload.unit,
    min_stock: payload.min_stock,
  });
};

export const editInventoryItem = async (id, userId, payload) => {
  const restaurantId = await getRestaurantId(userId);
  const existing = await getInventoryItemById(id, restaurantId);
  if (!existing) {
    const error = new Error('Ingrediente no encontrado');
    error.status = 404;
    throw error;
  }
  return updateInventoryItem(id, restaurantId, payload);
};

export const removeInventoryItem = async (id, userId) => {
  const restaurantId = await getRestaurantId(userId);
  const deleted = await deleteInventoryItem(id, restaurantId);
  if (!deleted) {
    const error = new Error('Ingrediente no encontrado');
    error.status = 404;
    throw error;
  }
};

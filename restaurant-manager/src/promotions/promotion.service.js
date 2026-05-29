import {
  createPromotion as createPromotionModel,
  getAllPromotions as getAllPromotionsModel,
  getPromotionById as getPromotionByIdModel,
  getPromotionsByRestaurant as getPromotionsByRestaurantModel,
  updatePromotion as updatePromotionModel,
  updatePromotionStatus as updatePromotionStatusModel,
  deletePromotion as deletePromotionModel,
} from './promotion.model.js';
import { pool } from '../config/db.js';
import { resolveRestaurantIdForUser } from '../utils/managerRestaurant.js';

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'active', 'expired'];

const getRestaurantById = async (id) => {
  const { rows } = await pool.query('SELECT id FROM restaurants WHERE id = $1', [id]);
  return rows[0];
};

const validatePromotionPayload = ({ restaurant_id, title, discount_percent, start_date, end_date }) => {
  if (!restaurant_id || !title) {
    const error = new Error('Los campos restaurant_id y title son obligatorios');
    error.status = 400;
    throw error;
  }
  if (title.trim().length === 0) {
    const error = new Error('El título no puede estar vacío');
    error.status = 400;
    throw error;
  }
  if (discount_percent !== undefined && discount_percent !== null) {
    const d = Number(discount_percent);
    if (isNaN(d) || d < 0 || d > 100) {
      const error = new Error('El descuento debe ser un número entre 0 y 100');
      error.status = 400;
      throw error;
    }
  }
  if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
    const error = new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    error.status = 400;
    throw error;
  }
};

export const createPromotion = async (payload, userId, user) => {
  const restaurant_id = user
    ? await resolveRestaurantIdForUser(user, payload.restaurant_id)
    : payload.restaurant_id;

  validatePromotionPayload({ ...payload, restaurant_id });

  const restaurant = await getRestaurantById(restaurant_id);
  if (!restaurant) {
    const error = new Error('Restaurante no encontrado');
    error.status = 404;
    throw error;
  }

  return await createPromotionModel({ ...payload, restaurant_id });
};

export const getPublicPromotions = async () => {
  return await getAllPromotionsModel('active');
};

export const getAllPromotions = async () => {
  return await getAllPromotionsModel();
};

export const getPromotionById = async (id) => {
  const promotion = await getPromotionByIdModel(id);
  if (!promotion) {
    const error = new Error('Promoción no encontrada');
    error.status = 404;
    throw error;
  }
  return promotion;
};

export const getPromotionsByRestaurant = async (restaurantId) => {
  const restaurant = await getRestaurantById(restaurantId);
  if (!restaurant) {
    const error = new Error('Restaurante no encontrado');
    error.status = 404;
    throw error;
  }
  return await getPromotionsByRestaurantModel(restaurantId);
};

export const updatePromotion = async (id, payload, userId, userRole) => {
  const promotion = await getPromotionByIdModel(id);
  if (!promotion) {
    const error = new Error('Promoción no encontrada');
    error.status = 404;
    throw error;
  }

  if (userRole === 'manager') {
    if (['approved', 'active'].includes(promotion.status)) {
      const error = new Error('No se puede editar una promoción ya aprobada o activa');
      error.status = 403;
      throw error;
    }
  }

  const { title, description, discount_percent, start_date, end_date } = payload;

  if (discount_percent !== undefined && discount_percent !== null) {
    const d = Number(discount_percent);
    if (isNaN(d) || d < 0 || d > 100) {
      const error = new Error('El descuento debe ser un número entre 0 y 100');
      error.status = 400;
      throw error;
    }
  }

  const updated = await updatePromotionModel(id, { title, description, discount_percent, start_date, end_date });
  if (!updated) {
    const error = new Error('No se proporcionaron campos para actualizar');
    error.status = 400;
    throw error;
  }
  return updated;
};

export const approvePromotion = async (id) => {
  const promotion = await getPromotionByIdModel(id);
  if (!promotion) {
    const error = new Error('Promoción no encontrada');
    error.status = 404;
    throw error;
  }
  if (promotion.status !== 'pending') {
    const error = new Error('Solo se pueden aprobar promociones en estado pendiente');
    error.status = 400;
    throw error;
  }
  return await updatePromotionStatusModel(id, 'approved');
};

export const rejectPromotion = async (id) => {
  const promotion = await getPromotionByIdModel(id);
  if (!promotion) {
    const error = new Error('Promoción no encontrada');
    error.status = 404;
    throw error;
  }
  if (!['pending', 'approved'].includes(promotion.status)) {
    const error = new Error('Solo se pueden rechazar promociones en estado pendiente o aprobado');
    error.status = 400;
    throw error;
  }
  return await updatePromotionStatusModel(id, 'rejected');
};

export const deletePromotion = async (id) => {
  const promotion = await getPromotionByIdModel(id);
  if (!promotion) {
    const error = new Error('Promoción no encontrada');
    error.status = 404;
    throw error;
  }
  await deletePromotionModel(id);
};

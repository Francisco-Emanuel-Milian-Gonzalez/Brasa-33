import {
  createReview as createReviewModel,
  getReviewsByRestaurant as getReviewsByRestaurantModel,
  getReviewsByDish as getReviewsByDishModel,
  getReviewsByUser as getReviewsByUserModel,
  getReviewById as getReviewByIdModel,
  updateReview as updateReviewModel,
  deleteReview as deleteReviewModel,
  getAverageRatingByRestaurant as getAvgRestaurantModel,
  getAverageRatingByDish as getAvgDishModel,
} from './review.model.js';
import { pool } from '../config/db.js';

const getEntityById = async (table, id) => {
  const { rows } = await pool.query(`SELECT id FROM ${table} WHERE id = $1`, [id]);
  return rows[0];
};

const validateReviewPayload = ({ restaurant_id, menu_id, rating }) => {
  if (!restaurant_id && !menu_id) {
    const error = new Error('Debes proporcionar restaurant_id o menu_id para la reseña');
    error.status = 400;
    throw error;
  }
  if (rating === undefined || rating === null) {
    const error = new Error('El campo rating es obligatorio');
    error.status = 400;
    throw error;
  }
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    const error = new Error('El rating debe ser un entero entre 1 y 5');
    error.status = 400;
    throw error;
  }
};

export const createReview = async (payload, userId) => {
  const { restaurant_id, menu_id } = payload;
  validateReviewPayload(payload);

  if (restaurant_id) {
    const rest = await getEntityById('restaurants', restaurant_id);
    if (!rest) {
      const error = new Error('Restaurante no encontrado');
      error.status = 404;
      throw error;
    }
  }

  if (menu_id) {
    const dish = await getEntityById('menu', menu_id);
    if (!dish) {
      const error = new Error('Plato no encontrado');
      error.status = 404;
      throw error;
    }
  }

  return await createReviewModel({ ...payload, user_id: userId });
};

export const getReviewsByRestaurant = async (restaurantId) => {
  const rest = await getEntityById('restaurants', restaurantId);
  if (!rest) {
    const error = new Error('Restaurante no encontrado');
    error.status = 404;
    throw error;
  }
  const [reviews, stats] = await Promise.all([
    getReviewsByRestaurantModel(restaurantId),
    getAvgRestaurantModel(restaurantId),
  ]);
  return { reviews, stats };
};

export const getReviewsByDish = async (menuId) => {
  const dish = await getEntityById('menu', menuId);
  if (!dish) {
    const error = new Error('Plato no encontrado');
    error.status = 404;
    throw error;
  }
  const [reviews, stats] = await Promise.all([
    getReviewsByDishModel(menuId),
    getAvgDishModel(menuId),
  ]);
  return { reviews, stats };
};

export const getMyReviews = async (userId) => {
  return await getReviewsByUserModel(userId);
};

export const updateReview = async (id, payload, userId, userRole) => {
  const review = await getReviewByIdModel(id);
  if (!review) {
    const error = new Error('Reseña no encontrada');
    error.status = 404;
    throw error;
  }

  if (userRole !== 'admin' && review.user_id !== userId) {
    const error = new Error('No tienes permiso para editar esta reseña');
    error.status = 403;
    throw error;
  }

  const { rating, comment } = payload;
  if (rating !== undefined) {
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      const error = new Error('El rating debe ser un entero entre 1 y 5');
      error.status = 400;
      throw error;
    }
  }

  return await updateReviewModel(id, { rating, comment });
};

export const deleteReview = async (id, userId, userRole) => {
  const review = await getReviewByIdModel(id);
  if (!review) {
    const error = new Error('Reseña no encontrada');
    error.status = 404;
    throw error;
  }

  if (userRole !== 'admin' && review.user_id !== userId) {
    const error = new Error('No tienes permiso para eliminar esta reseña');
    error.status = 403;
    throw error;
  }

  await deleteReviewModel(id);
};

import { pool } from '../config/db.js';

export const createReview = async ({ user_id, restaurant_id, menu_id, rating, comment }) => {
  const query = `
    INSERT INTO reviews (user_id, restaurant_id, menu_id, rating, comment)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, restaurant_id, menu_id, rating, comment, created_at
  `;
  const { rows } = await pool.query(query, [
    user_id,
    restaurant_id || null,
    menu_id || null,
    rating,
    comment || null,
  ]);
  return rows[0];
};

export const getReviewsByRestaurant = async (restaurantId) => {
  const query = `
    SELECT r.id, r.user_id, r.restaurant_id, r.menu_id, r.rating, r.comment, r.created_at,
           rest.name AS restaurant_name
    FROM reviews r
    LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
    WHERE r.restaurant_id = $1
    ORDER BY r.created_at DESC
  `;
  const { rows } = await pool.query(query, [restaurantId]);
  return rows;
};

export const getReviewsByDish = async (menuId) => {
  const query = `
    SELECT r.id, r.user_id, r.restaurant_id, r.menu_id, r.rating, r.comment, r.created_at,
           m.name AS dish_name
    FROM reviews r
    LEFT JOIN menu m ON r.menu_id = m.id
    WHERE r.menu_id = $1
    ORDER BY r.created_at DESC
  `;
  const { rows } = await pool.query(query, [menuId]);
  return rows;
};

export const getReviewsByUser = async (userId) => {
  const query = `
    SELECT r.id, r.user_id, r.restaurant_id, r.menu_id, r.rating, r.comment, r.created_at,
           rest.name AS restaurant_name,
           m.name    AS dish_name
    FROM reviews r
    LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
    LEFT JOIN menu m ON r.menu_id = m.id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

export const getReviewById = async (id) => {
  const query = `
    SELECT r.id, r.user_id, r.restaurant_id, r.menu_id, r.rating, r.comment, r.created_at,
           rest.name AS restaurant_name,
           m.name    AS dish_name
    FROM reviews r
    LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
    LEFT JOIN menu m ON r.menu_id = m.id
    WHERE r.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const updateReview = async (id, { rating, comment }) => {
  const query = `
    UPDATE reviews
    SET rating  = COALESCE($1, rating),
        comment = COALESCE($2, comment)
    WHERE id = $3
    RETURNING id, user_id, restaurant_id, menu_id, rating, comment, created_at
  `;
  const { rows } = await pool.query(query, [rating || null, comment || null, id]);
  return rows[0];
};

export const deleteReview = async (id) => {
  await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
};

export const getAverageRatingByRestaurant = async (restaurantId) => {
  const query = `
    SELECT
      COUNT(*)::INT            AS total_reviews,
      ROUND(AVG(rating), 2)    AS average_rating
    FROM reviews
    WHERE restaurant_id = $1
  `;
  const { rows } = await pool.query(query, [restaurantId]);
  return rows[0];
};

export const getAverageRatingByDish = async (menuId) => {
  const query = `
    SELECT
      COUNT(*)::INT            AS total_reviews,
      ROUND(AVG(rating), 2)    AS average_rating
    FROM reviews
    WHERE menu_id = $1
  `;
  const { rows } = await pool.query(query, [menuId]);
  return rows[0];
};

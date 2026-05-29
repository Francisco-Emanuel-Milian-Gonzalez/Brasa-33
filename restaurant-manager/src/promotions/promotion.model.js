import { pool } from '../config/db.js';

export const createPromotion = async ({
  restaurant_id, title, description, discount_percent, start_date, end_date,
}) => {
  const query = `
    INSERT INTO promotions (restaurant_id, title, description, discount_percent, start_date, end_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, restaurant_id, title, description, discount_percent, start_date, end_date, status, created_at
  `;
  const { rows } = await pool.query(query, [
    restaurant_id,
    title,
    description || null,
    discount_percent || null,
    start_date || null,
    end_date || null,
  ]);
  return rows[0];
};

export const getAllPromotions = async (statusFilter = null) => {
  const query = statusFilter
    ? `SELECT p.*, r.name AS restaurant_name
       FROM promotions p
       JOIN restaurants r ON p.restaurant_id = r.id
       WHERE p.status = $1
       ORDER BY p.created_at DESC`
    : `SELECT p.*, r.name AS restaurant_name
       FROM promotions p
       JOIN restaurants r ON p.restaurant_id = r.id
       ORDER BY p.created_at DESC`;
  const { rows } = statusFilter
    ? await pool.query(query, [statusFilter])
    : await pool.query(query);
  return rows;
};

export const getPromotionById = async (id) => {
  const query = `
    SELECT p.*, r.name AS restaurant_name
    FROM promotions p
    JOIN restaurants r ON p.restaurant_id = r.id
    WHERE p.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const getPromotionsByRestaurant = async (restaurantId) => {
  const query = `
    SELECT id, restaurant_id, title, description, discount_percent, start_date, end_date, status, created_at
    FROM promotions
    WHERE restaurant_id = $1
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [restaurantId]);
  return rows;
};

export const updatePromotion = async (id, fields) => {
  const allowed = ['title', 'description', 'discount_percent', 'start_date', 'end_date'];
  const updates = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = $${idx}`);
      values.push(fields[key]);
      idx++;
    }
  }

  if (updates.length === 0) return null;

  values.push(id);
  const query = `
    UPDATE promotions SET ${updates.join(', ')}
    WHERE id = $${idx}
    RETURNING id, restaurant_id, title, description, discount_percent, start_date, end_date, status, created_at
  `;
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const updatePromotionStatus = async (id, status) => {
  const query = `
    UPDATE promotions SET status = $1
    WHERE id = $2
    RETURNING id, restaurant_id, title, description, discount_percent, start_date, end_date, status, created_at
  `;
  const { rows } = await pool.query(query, [status, id]);
  return rows[0];
};

export const deletePromotion = async (id) => {
  await pool.query('DELETE FROM promotions WHERE id = $1', [id]);
};

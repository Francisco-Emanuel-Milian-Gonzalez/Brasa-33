import { pool } from '../config/db.js';

export const createNotification = async ({ userId, title, message, type = 'info' }) => {
  const query = `
    INSERT INTO notifications (user_id, title, message, type)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, title, message, type, read, created_at
  `;
  const { rows } = await pool.query(query, [userId, title, message, type]);
  return rows[0];
};

export const notifyRestaurantManager = async (restaurantId, { title, message, type }) => {
  const { rows } = await pool.query(
    'SELECT manager_id FROM restaurants WHERE id = $1 AND manager_id IS NOT NULL',
    [restaurantId],
  );
  if (!rows[0]?.manager_id) return null;
  return createNotification({
    userId: rows[0].manager_id,
    title,
    message,
    type,
  });
};

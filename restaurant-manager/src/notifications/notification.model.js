import { pool } from '../config/db.js';

export const getNotificationsByUser = async (userId) => {
  const query = `
    SELECT id, user_id, title, message, type, read, created_at
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 50
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

export const markNotificationRead = async (id, userId) => {
  const query = `
    UPDATE notifications
    SET read = TRUE
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, title, message, type, read, created_at
  `;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0];
};

export const markAllNotificationsRead = async (userId) => {
  await pool.query(
    'UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE',
    [userId],
  );
};

export const countUnreadNotifications = async (userId) => {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read = FALSE',
    [userId],
  );
  return rows[0]?.count ?? 0;
};

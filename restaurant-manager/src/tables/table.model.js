import { pool } from '../config/db.js';

export const createTable = async ({ restaurant_id, number, capacity, location, available_from, available_to }) => {
  const query = `
    INSERT INTO tables (restaurant_id, number, capacity, location, available_from, available_to)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, restaurant_id, number, capacity, location, status, available_from, available_to, created_at
  `;
  const { rows } = await pool.query(query, [
    restaurant_id,
    number,
    capacity,
    location || null,
    available_from || null,
    available_to || null,
  ]);
  return rows[0];
};

export const getTablesByRestaurant = async (restaurantId) => {
  const query = `
    SELECT id, restaurant_id, number, capacity, location, status, available_from, available_to, created_at
    FROM tables
    WHERE restaurant_id = $1
    ORDER BY number ASC
  `;
  const { rows } = await pool.query(query, [restaurantId]);
  return rows;
};

export const getTableById = async (id) => {
  const query = `
    SELECT t.id, t.restaurant_id, t.number, t.capacity, t.location, t.status, t.created_at,
           r.name AS restaurant_name
    FROM tables t
    JOIN restaurants r ON t.restaurant_id = r.id
    WHERE t.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const updateTable = async (id, fields) => {
  const allowed = ['number', 'capacity', 'location', 'status', 'available_from', 'available_to'];
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
    UPDATE tables
    SET ${updates.join(', ')}
    WHERE id = $${idx}
    RETURNING id, restaurant_id, number, capacity, location, status, available_from, available_to, created_at
  `;
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const updateTableStatus = async (id, status) => {
  const query = `
    UPDATE tables
    SET status = $1
    WHERE id = $2
    RETURNING id, restaurant_id, number, capacity, location, status, available_from, available_to, created_at
  `;
  const { rows } = await pool.query(query, [status, id]);
  return rows[0];
};

export const deleteTable = async (id) => {
  await pool.query('DELETE FROM tables WHERE id = $1', [id]);
};

export const tableNumberExistsInRestaurant = async (restaurantId, number, excludeId = null) => {
  const query = excludeId
    ? 'SELECT id FROM tables WHERE restaurant_id = $1 AND number = $2 AND id <> $3'
    : 'SELECT id FROM tables WHERE restaurant_id = $1 AND number = $2';
  const params = excludeId ? [restaurantId, number, excludeId] : [restaurantId, number];
  const { rows } = await pool.query(query, params);
  return rows.length > 0;
};

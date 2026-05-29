import { pool } from '../config/db.js';

export const createReservation = async (userId, restaurantId, date, time, peopleCount, type = 'table', notes = null) => {
  const query = `
    INSERT INTO reservations (user_id, restaurant_id, date, time, people_count, type, notes, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
    RETURNING id, user_id, restaurant_id, date, time, people_count, type, notes, status, created_at
  `;
  const { rows } = await pool.query(query, [userId, restaurantId, date, time, peopleCount, type, notes]);
  return rows[0];
};

export const getAllReservations = async () => {
  const query = `
    SELECT 
      r.id, r.user_id, r.restaurant_id, r.date, r.time,
      r.people_count, r.type, r.notes, r.status, r.created_at,
      rest.name AS restaurant_name, rest.address AS restaurant_address
    FROM reservations r
    JOIN restaurants rest ON r.restaurant_id = rest.id
    ORDER BY r.date DESC, r.time DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getReservationsByRestaurant = async (restaurantId) => {
  const query = `
    SELECT 
      r.id, r.user_id, r.restaurant_id, r.date, r.time,
      r.people_count, r.type, r.notes, r.status, r.created_at,
      rest.name AS restaurant_name, rest.address AS restaurant_address
    FROM reservations r
    JOIN restaurants rest ON r.restaurant_id = rest.id
    WHERE r.restaurant_id = $1
    ORDER BY r.date DESC, r.time DESC
  `;
  const { rows } = await pool.query(query, [restaurantId]);
  return rows;
};

export const updateReservation = async (id, fields) => {
  const allowed = ['date', 'time', 'people_count', 'type', 'notes'];
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
    UPDATE reservations SET ${updates.join(', ')}
    WHERE id = $${idx}
    RETURNING id, user_id, restaurant_id, date, time, people_count, type, notes, status, created_at
  `;
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const getReservationById = async (id) => {
  const query = `
    SELECT 
      r.id, r.user_id, r.restaurant_id, r.date, r.time,
      r.people_count, r.type, r.notes, r.status, r.created_at,
      rest.name AS restaurant_name, rest.address AS restaurant_address
    FROM reservations r
    JOIN restaurants rest ON r.restaurant_id = rest.id
    WHERE r.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const getReservationsByUserId = async (userId) => {
  const query = `
    SELECT 
      r.id, r.user_id, r.restaurant_id, r.date, r.time,
      r.people_count, r.type, r.notes, r.status, r.created_at,
      rest.name AS restaurant_name, rest.address AS restaurant_address
    FROM reservations r
    JOIN restaurants rest ON r.restaurant_id = rest.id
    WHERE r.user_id = $1
    ORDER BY r.date DESC, r.time DESC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

export const updateReservationStatus = async (id, status) => {
  const query = `
    UPDATE reservations
    SET status = $1
    WHERE id = $2
    RETURNING id, user_id, restaurant_id, date, time, people_count, type, notes, status, created_at
  `;
  const values = [status, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const getRestaurantById = async (id) => {
  const query = `
    SELECT id, name, address, phone, created_at
    FROM restaurants
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

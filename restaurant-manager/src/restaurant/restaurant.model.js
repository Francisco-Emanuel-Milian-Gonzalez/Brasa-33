import { pool } from '../config/db.js';

const RESTAURANT_COLUMNS = `
  r.id, r.name, r.address, r.phone, r.email, r.description, r.logo_url,
  r.is_active, r.manager_id, r.category, r.opening_time, r.closing_time, r.created_at
`;

export const createRestaurant = async ({
  name,
  address,
  phone,
  email,
  description,
  logo_url,
  category,
  opening_time,
  closing_time,
}) => {
  const query = `
    INSERT INTO restaurants (name, address, phone, email, description, logo_url, category, opening_time, closing_time)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, name, address, phone, email, description, logo_url, is_active, manager_id,
              category, opening_time, closing_time, created_at
  `;
  const { rows } = await pool.query(query, [
    name,
    address,
    phone,
    email ?? null,
    description ?? null,
    logo_url ?? null,
    category ?? null,
    opening_time || null,
    closing_time || null,
  ]);
  return rows[0];
};

export const getAllRestaurants = async () => {
  const query = `
    SELECT
      ${RESTAURANT_COLUMNS},
      COALESCE(AVG(rv.rating), 0)::numeric(3,2) AS average_rating,
      COUNT(rv.id)::int AS review_count
    FROM restaurants r
    LEFT JOIN reviews rv ON rv.restaurant_id = r.id
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getRestaurantById = async (id) => {
  const query = `
    SELECT
      ${RESTAURANT_COLUMNS},
      COALESCE(AVG(rv.rating), 0)::numeric(3,2) AS average_rating,
      COUNT(rv.id)::int AS review_count
    FROM restaurants r
    LEFT JOIN reviews rv ON rv.restaurant_id = r.id
    WHERE r.id = $1
    GROUP BY r.id
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const updateRestaurant = async (id, fields) => {
  const query = `
    UPDATE restaurants
    SET name = $1,
        address = $2,
        phone = $3,
        email = $4,
        description = $5,
        logo_url = COALESCE($6, logo_url),
        category = $7,
        opening_time = $8,
        closing_time = $9
    WHERE id = $10
    RETURNING id, name, address, phone, email, description, logo_url, is_active, manager_id,
              category, opening_time, closing_time, created_at
  `;
  const { rows } = await pool.query(query, [
    fields.name,
    fields.address,
    fields.phone,
    fields.email ?? null,
    fields.description ?? null,
    fields.logo_url ?? null,
    fields.category ?? null,
    fields.opening_time || null,
    fields.closing_time || null,
    id,
  ]);
  return rows[0];
};

export const assignManagerToRestaurant = async (restaurantId, managerId) => {
  const query = `
    UPDATE restaurants
    SET manager_id = $1
    WHERE id = $2
    RETURNING id, name, address, phone, email, description, logo_url, is_active, manager_id,
              category, opening_time, closing_time, created_at
  `;
  const { rows } = await pool.query(query, [managerId || null, restaurantId]);
  return rows[0];
};

export const deleteRestaurant = async (id) => {
  await pool.query(`DELETE FROM restaurants WHERE id = $1`, [id]);
};

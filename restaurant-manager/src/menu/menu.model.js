import { pool } from '../config/db.js';

const dishColumns = `
  id, name, description, price, stock, restaurant_id, category, ingredients,
  image_url, is_available, created_at
`;

export const createDish = async ({
  name, description, price, stock, restaurant_id, category, ingredients, image_url,
}) => {
  const query = `
    INSERT INTO menu (name, description, price, stock, restaurant_id, category, ingredients, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING ${dishColumns}
  `;
  const values = [
    name,
    description ?? '',
    price,
    stock,
    restaurant_id,
    category ?? 'main',
    ingredients ?? null,
    image_url ?? null,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const getAllDishes = async () => {
  const query = `SELECT ${dishColumns} FROM menu ORDER BY created_at DESC`;
  const { rows } = await pool.query(query);
  return rows;
};

export const getDishById = async (id) => {
  const query = `SELECT ${dishColumns} FROM menu WHERE id = $1`;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const getDishesByRestaurant = async (restaurantId) => {
  const query = `
    SELECT ${dishColumns}
    FROM menu
    WHERE restaurant_id = $1 AND (is_available IS NULL OR is_available = true)
    ORDER BY category, name
  `;
  const { rows } = await pool.query(query, [restaurantId]);
  return rows;
};

export const updateDish = async (id, fields) => {
  const allowed = ['name', 'description', 'price', 'stock', 'category', 'ingredients', 'image_url'];
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

  if (updates.length === 0) {
    const error = new Error('No fields to update');
    error.status = 400;
    throw error;
  }

  values.push(id);
  const query = `
    UPDATE menu SET ${updates.join(', ')}
    WHERE id = $${idx}
    RETURNING ${dishColumns}
  `;
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const updateDishStock = async (id, stock) => {
  const query = `
    UPDATE menu SET stock = $1 WHERE id = $2
    RETURNING ${dishColumns}
  `;
  const { rows } = await pool.query(query, [stock, id]);
  return rows[0];
};

export const deleteDish = async (id) => {
  await pool.query(`DELETE FROM menu WHERE id = $1`, [id]);
};

export const getRestaurantById = async (id) => {
  const { rows } = await pool.query('SELECT id FROM restaurants WHERE id = $1', [id]);
  return rows[0];
};

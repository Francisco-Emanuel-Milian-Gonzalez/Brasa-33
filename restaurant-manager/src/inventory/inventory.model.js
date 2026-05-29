import { pool } from '../config/db.js';

export const getInventoryByRestaurant = async (restaurantId) => {
  const query = `
    SELECT id, restaurant_id, ingredient, quantity, unit, min_stock, created_at, updated_at
    FROM inventory
    WHERE restaurant_id = $1
    ORDER BY ingredient ASC
  `;
  const { rows } = await pool.query(query, [restaurantId]);
  return rows;
};

export const createInventoryItem = async ({ restaurant_id, ingredient, quantity, unit, min_stock }) => {
  const query = `
    INSERT INTO inventory (restaurant_id, ingredient, quantity, unit, min_stock)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, restaurant_id, ingredient, quantity, unit, min_stock, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [
    restaurant_id,
    ingredient,
    quantity ?? 0,
    unit ?? null,
    min_stock ?? 0,
  ]);
  return rows[0];
};

export const updateInventoryItem = async (id, restaurantId, fields) => {
  const allowed = ['ingredient', 'quantity', 'unit', 'min_stock'];
  const updates = ['updated_at = NOW()'];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = $${idx}`);
      values.push(fields[key]);
      idx++;
    }
  }

  values.push(id, restaurantId);
  const query = `
    UPDATE inventory
    SET ${updates.join(', ')}
    WHERE id = $${idx} AND restaurant_id = $${idx + 1}
    RETURNING id, restaurant_id, ingredient, quantity, unit, min_stock, created_at, updated_at
  `;
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const deleteInventoryItem = async (id, restaurantId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM inventory WHERE id = $1 AND restaurant_id = $2',
    [id, restaurantId],
  );
  return rowCount > 0;
};

export const getInventoryItemById = async (id, restaurantId) => {
  const query = `
    SELECT id, restaurant_id, ingredient, quantity, unit, min_stock, created_at, updated_at
    FROM inventory
    WHERE id = $1 AND restaurant_id = $2
  `;
  const { rows } = await pool.query(query, [id, restaurantId]);
  return rows[0];
};

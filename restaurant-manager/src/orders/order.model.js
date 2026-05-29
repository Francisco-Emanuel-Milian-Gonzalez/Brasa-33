import { pool } from '../config/db.js';

export const createOrder = async (
  client,
  userId,
  total,
  restaurantId = null,
  notes = null,
  paymentMethod = 'cash',
  cardLastFour = null,
  status = 'pending',
  paidAt = null,
) => {
  const query = `
    INSERT INTO orders (user_id, total, status, restaurant_id, notes, payment_method, card_last_four, paid_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, user_id, total, status, restaurant_id, notes, payment_method, card_last_four, paid_at, created_at
  `;
  const { rows } = await client.query(query, [
    userId,
    total,
    status,
    restaurantId,
    notes,
    paymentMethod,
    cardLastFour,
    paidAt,
  ]);
  return rows[0];
};

export const createOrderStandalone = async (userId, total, restaurantId = null, notes = null) => {
  const query = `
    INSERT INTO orders (user_id, total, status, restaurant_id, notes)
    VALUES ($1, $2, 'pending', $3, $4)
    RETURNING id, user_id, total, status, restaurant_id, notes, created_at
  `;
  const { rows } = await pool.query(query, [userId, total, restaurantId, notes]);
  return rows[0];
};

export const createOrderItems = async (client, orderId, items) => {
  const query = `
    INSERT INTO order_items (order_id, menu_id, quantity, price)
    VALUES ($1, $2, $3, $4)
  `;
  for (const item of items) {
    await client.query(query, [orderId, item.menu_id, item.quantity, item.price]);
  }
};

export const createOrderItemsStandalone = async (orderId, items) => {
  const query = `
    INSERT INTO order_items (order_id, menu_id, quantity, price)
    VALUES ($1, $2, $3, $4)
  `;
  for (const item of items) {
    await pool.query(query, [orderId, item.menu_id, item.quantity, item.price]);
  }
};

export const getAllOrders = async () => {
  const query = `
    SELECT o.id, o.user_id, o.total, o.status, o.restaurant_id, o.notes,
           o.payment_method, o.card_last_four, o.created_at,
           r.name AS restaurant_name
    FROM orders o
    LEFT JOIN restaurants r ON o.restaurant_id = r.id
    ORDER BY o.created_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getOrdersByRestaurant = async (restaurantId) => {
  const query = `
    SELECT id, user_id, total, status, restaurant_id, notes, created_at
    FROM orders
    WHERE restaurant_id = $1
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [restaurantId]);
  return rows;
};

export const getOrderById = async (id) => {
  const query = `
    SELECT id, user_id, total, status, restaurant_id, notes, payment_method, paid_at, created_at
    FROM orders
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const getOrdersByUserId = async (userId) => {
  const query = `
    SELECT id, user_id, total, status, restaurant_id, notes, created_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

export const updateOrderStatus = async (id, status) => {
  const query = `
    UPDATE orders
    SET status = $1::varchar,
        paid_at = CASE
          WHEN $1::text = 'completed' THEN COALESCE(paid_at, NOW())
          ELSE paid_at
        END
    WHERE id = $2
    RETURNING id, user_id, total, status, payment_method, paid_at, created_at
  `;
  const { rows } = await pool.query(query, [status, id]);
  return rows[0];
};

export const getDishById = async (id) => {
  const query = `
    SELECT id, name, price, stock, restaurant_id
    FROM menu
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const decrementDishStock = async (dishId, quantity) => {
  const query = `
    UPDATE menu
    SET stock = stock - $1
    WHERE id = $2
  `;
  const values = [quantity, dishId];
  await pool.query(query, values);
};

export const restoreDishStock = async (dishId, quantity) => {
  const query = `
    UPDATE menu
    SET stock = stock + $1
    WHERE id = $2
  `;
  const values = [quantity, dishId];
  await pool.query(query, values);
};

export const getOrderWithItems = async (orderId) => {
  const orderQuery = `
    SELECT id, user_id, total, status, restaurant_id, notes, payment_method, paid_at, created_at
    FROM orders
    WHERE id = $1
  `;
  const { rows: orderRows } = await pool.query(orderQuery, [orderId]);

  if (orderRows.length === 0) {
    return null;
  }

  const order = orderRows[0];

  const itemsQuery = `
    SELECT 
      oi.id,
      oi.menu_id,
      oi.quantity,
      oi.price,
      m.name,
      m.description,
      m.restaurant_id
    FROM order_items oi
    JOIN menu m ON oi.menu_id = m.id
    WHERE oi.order_id = $1
  `;
  const { rows: itemRows } = await pool.query(itemsQuery, [orderId]);

  return {
    ...order,
    items: itemRows,
  };
};

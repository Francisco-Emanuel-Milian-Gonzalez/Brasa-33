import { pool } from '../config/db.js';

export const createInvoice = async ({ order_id, user_id, subtotal, tax, total, notes }) => {
  const query = `
    INSERT INTO invoices (order_id, user_id, subtotal, tax, total, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, order_id, user_id, subtotal, tax, total, notes, issued_at
  `;
  const { rows } = await pool.query(query, [
    order_id, user_id, subtotal, tax, total, notes || null,
  ]);
  return rows[0];
};

export const getInvoiceById = async (id) => {
  const query = `
    SELECT
      i.id, i.order_id, i.user_id, i.subtotal, i.tax, i.total, i.notes, i.issued_at,
      o.status   AS order_status,
      o.restaurant_id
    FROM invoices i
    JOIN orders o ON i.order_id = o.id
    WHERE i.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const getInvoiceByOrderId = async (orderId) => {
  const query = `
    SELECT
      i.id, i.order_id, i.user_id, i.subtotal, i.tax, i.total, i.notes, i.issued_at,
      o.status   AS order_status,
      o.restaurant_id
    FROM invoices i
    JOIN orders o ON i.order_id = o.id
    WHERE i.order_id = $1
  `;
  const { rows } = await pool.query(query, [orderId]);
  return rows[0];
};

export const getInvoicesByUser = async (userId) => {
  const query = `
    SELECT
      i.id, i.order_id, i.user_id, i.subtotal, i.tax, i.total, i.notes, i.issued_at,
      o.status   AS order_status
    FROM invoices i
    JOIN orders o ON i.order_id = o.id
    WHERE i.user_id = $1
    ORDER BY i.issued_at DESC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

export const getAllInvoices = async () => {
  const query = `
    SELECT
      i.id, i.order_id, i.user_id, i.subtotal, i.tax, i.total, i.notes, i.issued_at,
      o.status AS order_status
    FROM invoices i
    JOIN orders o ON i.order_id = o.id
    ORDER BY i.issued_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getOrderWithItemsForInvoice = async (orderId) => {
  const orderQuery = `
    SELECT id, user_id, restaurant_id, total, status, notes, created_at
    FROM orders
    WHERE id = $1
  `;
  const { rows: orderRows } = await pool.query(orderQuery, [orderId]);
  if (orderRows.length === 0) return null;

  const order = orderRows[0];

  const itemsQuery = `
    SELECT
      oi.id,
      oi.menu_id,
      oi.quantity,
      oi.price,
      m.name,
      m.description,
      (oi.quantity * oi.price) AS line_total
    FROM order_items oi
    JOIN menu m ON oi.menu_id = m.id
    WHERE oi.order_id = $1
  `;
  const { rows: items } = await pool.query(itemsQuery, [orderId]);

  return { ...order, items };
};

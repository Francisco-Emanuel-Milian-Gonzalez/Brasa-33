import { pool } from '../config/db.js';

const buildDateFilter = (startDate, endDate, column, paramOffset = 0) => {
  const conditions = [];
  const values = [];
  let idx = paramOffset + 1;

  if (startDate) {
    conditions.push(`${column} >= $${idx}`);
    values.push(startDate);
    idx++;
  }
  if (endDate) {
    conditions.push(`${column} <= $${idx}`);
    values.push(endDate + ' 23:59:59');
    idx++;
  }
  return { conditions, values };
};

const appendRestaurantFilter = (restaurantId, column, conditions, values) => {
  if (restaurantId) {
    conditions.push(`${column} = $${values.length + 1}`);
    values.push(restaurantId);
  }
};

export const getTotalRevenue = async (startDate = null, endDate = null, restaurantId = null) => {
  const { conditions, values } = buildDateFilter(startDate, endDate, 'o.created_at');
  appendRestaurantFilter(restaurantId, 'restaurant_id', conditions, values);
  conditions.push(`status = 'completed'`);

  const where = `WHERE ${conditions.join(' AND ')}`;

  const query = `
    SELECT 
      COALESCE(SUM(total), 0) AS total_revenue,
      COUNT(*)::INT             AS total_orders
    FROM orders
    ${where}
  `;
  const { rows } = await pool.query(query, values);
  const row = rows[0];
  const totalOrders = row.total_orders || 0;
  const totalRevenue = parseFloat(row.total_revenue) || 0;
  return {
    total_revenue: totalRevenue,
    total_orders: totalOrders,
    average_order: totalOrders > 0 ? totalRevenue / totalOrders : 0,
  };
};

export const getSalesByDate = async (startDate = null, endDate = null, restaurantId = null) => {
  const { conditions, values } = buildDateFilter(startDate, endDate, 'created_at');
  appendRestaurantFilter(restaurantId, 'restaurant_id', conditions, values);
  conditions.push(`status = 'completed'`);

  const where = `WHERE ${conditions.join(' AND ')}`;

  const query = `
    SELECT 
      created_at::DATE           AS date,
      COUNT(*)::INT              AS transactions,
      COUNT(*)::INT              AS unique_orders,
      COALESCE(SUM(total), 0)    AS daily_revenue
    FROM orders
    ${where}
    GROUP BY created_at::DATE
    ORDER BY created_at::DATE DESC
    LIMIT 90
  `;
  const { rows } = await pool.query(query, values);
  return rows;
};

export const getTopProducts = async (limit = 20, startDate = null, endDate = null, restaurantId = null) => {
  const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const conditions = [];
  const values = [];

  if (startDate) {
    conditions.push(`o.created_at >= $${values.length + 1}`);
    values.push(startDate);
  }
  if (endDate) {
    conditions.push(`o.created_at <= $${values.length + 1}`);
    values.push(endDate + ' 23:59:59');
  }
  appendRestaurantFilter(restaurantId, 'o.restaurant_id', conditions, values);
  conditions.push(`o.status = 'completed'`);

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      m.id,
      m.name,
      m.price,
      m.category,
      SUM(oi.quantity)::INT                   AS total_sold,
      COUNT(DISTINCT oi.order_id)::INT         AS times_ordered,
      COALESCE(SUM(oi.quantity * oi.price), 0) AS total_revenue
    FROM order_items oi
    JOIN menu m ON oi.menu_id = m.id
    JOIN orders o ON oi.order_id = o.id
    ${whereClause}
    GROUP BY m.id, m.name, m.price, m.category
    ORDER BY total_sold DESC
    LIMIT ${safeLimit}
  `;
  const { rows } = await pool.query(query, values);
  return rows;
};

export const getOrdersByStatus = async (startDate = null, endDate = null, restaurantId = null) => {
  const { conditions, values } = buildDateFilter(startDate, endDate, 'created_at');
  appendRestaurantFilter(restaurantId, 'restaurant_id', conditions, values);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      status,
      COUNT(*)::INT                  AS count,
      COALESCE(SUM(total), 0)        AS total_amount
    FROM orders
    ${where}
    GROUP BY status
    ORDER BY count DESC
  `;
  const { rows } = await pool.query(query, values);
  return rows;
};

export const getReservationsReport = async (startDate = null, endDate = null, restaurantId = null) => {
  const { conditions, values } = buildDateFilter(startDate, endDate, 'created_at');
  appendRestaurantFilter(restaurantId, 'restaurant_id', conditions, values);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      status,
      COUNT(*)::INT                    AS count,
      ROUND(AVG(people_count), 2)      AS avg_people,
      MAX(people_count)::INT           AS max_people,
      MIN(people_count)::INT           AS min_people
    FROM reservations
    ${where}
    GROUP BY status
    ORDER BY count DESC
  `;
  const { rows } = await pool.query(query, values);

  const summary = rows.reduce(
    (acc, row) => {
      acc.total += row.count;
      if (row.status === 'pending') acc.pending = row.count;
      if (row.status === 'confirmed') acc.confirmed = row.count;
      if (row.status === 'completed') acc.completed = row.count;
      if (row.status === 'cancelled') acc.cancelled = row.count;
      return acc;
    },
    { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
  );

  return { summary, byStatus: rows };
};

export const getTopCustomers = async (restaurantId, limit = 5) => {
  if (!restaurantId) return [];

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20);
  const query = `
    SELECT
      o.user_id,
      COUNT(o.id)::INT           AS total_orders,
      COALESCE(SUM(o.total), 0) AS total_spent
    FROM orders o
    WHERE o.restaurant_id = $1
      AND o.status = 'completed'
    GROUP BY o.user_id
    ORDER BY total_orders DESC
    LIMIT ${safeLimit}
  `;
  const { rows } = await pool.query(query, [restaurantId]);
  return rows;
};

import { pool } from '../config/db.js';

export const getGlobalStats = async () => {
  const [
    restaurants,
    orders,
    revenue,
    reservations,
    reviews,
    topRestaurants,
    ordersByStatus,
    revenueByRestaurant,
    revenueLastDays,
    promotionsByStatus,
  ] = await Promise.all([
    pool.query(`SELECT COUNT(*)::INT AS total, COUNT(*) FILTER (WHERE is_active = TRUE)::INT AS active FROM restaurants`),
    pool.query(`SELECT COUNT(*)::INT AS total, COUNT(*) FILTER (WHERE status = 'completed')::INT AS completed, COUNT(*) FILTER (WHERE status = 'cancelled')::INT AS cancelled, COUNT(*) FILTER (WHERE status = 'pending')::INT AS pending FROM orders`),
    pool.query(`SELECT COALESCE(SUM(amount), 0)::NUMERIC AS total_revenue FROM payments WHERE status = 'paid'`),
    pool.query(`SELECT COUNT(*)::INT AS total, COUNT(*) FILTER (WHERE status = 'confirmed')::INT AS confirmed, COUNT(*) FILTER (WHERE status = 'cancelled')::INT AS cancelled FROM reservations`),
    pool.query(`SELECT COUNT(*)::INT AS total, ROUND(AVG(rating), 2) AS average_rating FROM reviews`),
    pool.query(`
      SELECT r.id, r.name, r.address,
             COUNT(DISTINCT o.id)::INT     AS total_orders,
             COALESCE(SUM(p.amount), 0)    AS revenue,
             ROUND(AVG(rv.rating), 2)      AS avg_rating,
             COUNT(DISTINCT rv.id)::INT    AS review_count
      FROM restaurants r
      LEFT JOIN orders o       ON o.restaurant_id = r.id
      LEFT JOIN payments p     ON p.order_id = o.id AND p.status = 'paid'
      LEFT JOIN reviews rv     ON rv.restaurant_id = r.id
      GROUP BY r.id, r.name, r.address
      ORDER BY revenue DESC
      LIMIT 10
    `),
    pool.query(`SELECT status, COUNT(*)::INT AS count FROM orders GROUP BY status`),
    pool.query(`
      SELECT r.id, r.name,
             COALESCE(SUM(p.amount), 0) AS revenue
      FROM restaurants r
      LEFT JOIN orders o   ON o.restaurant_id = r.id
      LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'paid'
      GROUP BY r.id, r.name
      ORDER BY revenue DESC
    `),
    pool.query(`
      SELECT DATE(p.created_at) AS date,
             COUNT(*)::INT       AS transactions,
             SUM(p.amount)       AS revenue
      FROM payments p
      WHERE p.status = 'paid'
        AND p.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(p.created_at)
      ORDER BY date DESC
    `),
    pool.query(`SELECT status, COUNT(*)::INT AS count FROM promotions GROUP BY status`),
  ]);

  return {
    summary: {
      restaurants: restaurants.rows[0],
      orders: orders.rows[0],
      total_revenue: revenue.rows[0].total_revenue,
      reservations: reservations.rows[0],
      reviews: reviews.rows[0],
    },
    top_restaurants: topRestaurants.rows,
    orders_by_status: ordersByStatus.rows,
    revenue_by_restaurant: revenueByRestaurant.rows,
    revenue_last_30_days: revenueLastDays.rows,
    promotions_by_status: promotionsByStatus.rows,
  };
};

export const getRestaurantPerformance = async (restaurantId) => {
  const { rows: check } = await pool.query('SELECT id, name FROM restaurants WHERE id = $1', [restaurantId]);
  if (check.length === 0) {
    const error = new Error('Restaurante no encontrado');
    error.status = 404;
    throw error;
  }

  const [orders, revenue, reservations, reviews, topDishes] = await Promise.all([
    pool.query(`
      SELECT COUNT(*)::INT AS total,
             COUNT(*) FILTER (WHERE status = 'completed')::INT AS completed,
             COUNT(*) FILTER (WHERE status = 'cancelled')::INT AS cancelled
      FROM orders WHERE restaurant_id = $1
    `, [restaurantId]),
    pool.query(`
      SELECT COALESCE(SUM(p.amount), 0) AS total_revenue
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE o.restaurant_id = $1 AND p.status = 'paid'
    `, [restaurantId]),
    pool.query(`
      SELECT COUNT(*)::INT AS total,
             COUNT(*) FILTER (WHERE status = 'confirmed')::INT  AS confirmed,
             COUNT(*) FILTER (WHERE status = 'cancelled')::INT  AS cancelled
      FROM reservations WHERE restaurant_id = $1
    `, [restaurantId]),
    pool.query(`
      SELECT COUNT(*)::INT AS total, ROUND(AVG(rating), 2) AS average_rating
      FROM reviews WHERE restaurant_id = $1
    `, [restaurantId]),
    pool.query(`
      SELECT m.id, m.name, SUM(oi.quantity)::INT AS total_sold,
             SUM(oi.quantity * oi.price) AS revenue
      FROM order_items oi
      JOIN menu m ON oi.menu_id = m.id
      WHERE m.restaurant_id = $1
      GROUP BY m.id, m.name
      ORDER BY total_sold DESC
      LIMIT 10
    `, [restaurantId]),
  ]);

  return {
    restaurant: check[0],
    orders: orders.rows[0],
    revenue: revenue.rows[0].total_revenue,
    reservations: reservations.rows[0],
    reviews: reviews.rows[0],
    top_dishes: topDishes.rows,
  };
};

export const getAllRestaurantsAdmin = async () => {
  const { rows } = await pool.query(`
    SELECT r.id, r.name, r.address, r.phone, r.email, r.is_active, r.created_at,
           COUNT(DISTINCT m.id)::INT       AS menu_items,
           COUNT(DISTINCT t.id)::INT       AS tables_count,
           COUNT(DISTINCT o.id)::INT       AS total_orders,
           ROUND(AVG(rv.rating), 2)        AS avg_rating
    FROM restaurants r
    LEFT JOIN menu m         ON m.restaurant_id = r.id
    LEFT JOIN tables t       ON t.restaurant_id = r.id
    LEFT JOIN orders o       ON o.restaurant_id = r.id
    LEFT JOIN reviews rv     ON rv.restaurant_id = r.id
    GROUP BY r.id, r.name, r.address, r.phone, r.email, r.is_active, r.created_at
    ORDER BY r.created_at DESC
  `);
  return rows;
};

export const toggleRestaurantActive = async (restaurantId, isActive) => {
  const { rows: check } = await pool.query('SELECT id FROM restaurants WHERE id = $1', [restaurantId]);
  if (check.length === 0) {
    const error = new Error('Restaurante no encontrado');
    error.status = 404;
    throw error;
  }
  const { rows } = await pool.query(
    'UPDATE restaurants SET is_active = $1 WHERE id = $2 RETURNING id, name, is_active',
    [isActive, restaurantId],
  );
  return rows[0];
};

export const getPendingPromotions = async () => {
  const { rows } = await pool.query(`
    SELECT p.*, r.name AS restaurant_name
    FROM promotions p
    JOIN restaurants r ON p.restaurant_id = r.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at ASC
  `);
  return rows;
};
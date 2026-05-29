import {
  getTotalRevenue as getTotalRevenueService,
  getSalesByDate as getSalesByDateService,
  getTopProducts as getTopProductsService,
  getOrdersByStatus as getOrdersByStatusService,
  getReservationsReport as getReservationsReportService,
  getTopCustomers as getTopCustomersService,
} from './report.service.js';

const parseRestaurantId = (req) => {
  const id = req.query.restaurant_id;
  return id ? parseInt(id, 10) : null;
};

export const getTotalRevenue = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const restaurantId = parseRestaurantId(req);
    const revenue = await getTotalRevenueService(start_date, end_date, restaurantId);
    res.status(200).json({ success: true, data: revenue });
  } catch (error) {
    next(error);
  }
};

export const getSalesByDate = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const restaurantId = parseRestaurantId(req);
    const sales = await getSalesByDateService(start_date, end_date, restaurantId);
    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (req, res, next) => {
  try {
    const { limit, start_date, end_date } = req.query;
    const restaurantId = parseRestaurantId(req);
    const topProducts = await getTopProductsService(limit, start_date, end_date, restaurantId);
    res.status(200).json({ success: true, data: topProducts });
  } catch (error) {
    next(error);
  }
};

export const getOrdersByStatus = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const restaurantId = parseRestaurantId(req);
    const ordersByStatus = await getOrdersByStatusService(start_date, end_date, restaurantId);
    res.status(200).json({ success: true, data: ordersByStatus });
  } catch (error) {
    next(error);
  }
};

export const getReservationsReport = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const restaurantId = parseRestaurantId(req);
    const reservationsReport = await getReservationsReportService(start_date, end_date, restaurantId);
    res.status(200).json({ success: true, data: reservationsReport });
  } catch (error) {
    next(error);
  }
};

export const getTopCustomers = async (req, res, next) => {
  try {
    const restaurantId = parseRestaurantId(req);
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'restaurant_id es requerido' });
    }
    const customers = await getTopCustomersService(restaurantId, req.query.limit);
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

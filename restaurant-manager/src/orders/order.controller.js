import {
  createOrder as createOrderService,
  getOrders as getOrdersService,
  getOrdersByRestaurant as getOrdersByRestaurantService,
  getMyOrders as getMyOrdersService,
  getOrderById as getOrderByIdService,
  confirmOrder as confirmOrderService,
  updateOrderStatus as updateOrderStatusService,
  cancelOrder as cancelOrderService,
} from './order.service.js';

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      items,
      restaurant_id,
      notes,
      payment_method = 'cash',
      card_last_four = null,
    } = req.body;
    const order = await createOrderService(
      userId,
      items,
      restaurant_id,
      notes,
      payment_method,
      card_last_four,
    );
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getOrdersByRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const orders = await getOrdersByRestaurantService(restaurantId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await getOrdersService();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await getMyOrdersService(userId);

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await getOrderByIdService(id);

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const confirmOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await confirmOrderService(id);

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await updateOrderStatusService(id, status);

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await cancelOrderService(id, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

import {
  createOrder as createOrderModel,
  createOrderItems,
  getAllOrders,
  getOrderById as getOrderByIdModel,
  getOrdersByUserId,
  getOrdersByRestaurant as getOrdersByRestaurantModel,
  updateOrderStatus as updateOrderStatusModel,
  getDishById,
  restoreDishStock,
  getOrderWithItems,
} from './order.model.js';
import { pool } from '../config/db.js';
import { createPayment, getPaymentByOrderId } from '../payments/payment.model.js';
import { createInvoiceForOrder } from '../invoices/invoice.service.js';
import { createNotification, notifyRestaurantManager } from '../utils/notifications.js';

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

/** Pago y factura al marcar el pedido como completado (cualquier método de pago). */
const finalizeOrderOnComplete = async (order) => {
  const orderTotal = parseFloat(order.total) || 0;
  if (orderTotal <= 0) return;

  const method = order.payment_method || 'cash';

  const existingPayment = await getPaymentByOrderId(order.id);
  if (!existingPayment) {
    await createPayment(order.id, order.user_id, orderTotal, method);
  }

  try {
    await createInvoiceForOrder(order.id, order.user_id);
  } catch (err) {
    if (err.status !== 409) throw err;
  }
};

const validateOrderItems = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Items debe ser un array no vacío con al menos un plato');
    error.status = 400;
    throw error;
  }

  items.forEach((item) => {
    if (!item.menu_id || !item.quantity) {
      const error = new Error('Cada item debe tener menu_id y quantity');
      error.status = 400;
      throw error;
    }

    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      const error = new Error('Quantity debe ser un número mayor a 0');
      error.status = 400;
      throw error;
    }
  });
};

export const createOrder = async (userId, items, restaurantId = null, notes = null, paymentMethod = 'cash', cardLastFour = null) => {
  validateOrderItems(items);

  let total = 0;
  const validatedItems = [];
  let resolvedRestaurantId = restaurantId != null ? Number(restaurantId) : null;

  for (const item of items) {
    const dish = await getDishById(item.menu_id);

    if (!dish) {
      const error = new Error(`Plato con ID ${item.menu_id} no encontrado`);
      error.status = 404;
      throw error;
    }

    if (dish.stock < item.quantity) {
      const error = new Error(`Stock insuficiente para ${dish.name}. Disponibles: ${dish.stock}`);
      error.status = 400;
      throw error;
    }

    if (!resolvedRestaurantId && dish.restaurant_id) {
      resolvedRestaurantId = dish.restaurant_id;
    } else if (
      resolvedRestaurantId
      && dish.restaurant_id
      && Number(dish.restaurant_id) !== Number(resolvedRestaurantId)
    ) {
      const error = new Error('Todos los platos deben ser del mismo restaurante');
      error.status = 400;
      throw error;
    }

    total += parseFloat(dish.price) * item.quantity;
    validatedItems.push({
      menu_id: item.menu_id,
      quantity: item.quantity,
      price: dish.price,
    });
  }

  const orderTotal = parseFloat(total.toFixed(2));
  const orderStatus = 'pending';
  const paidAt = null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const order = await createOrderModel(
      client,
      userId,
      orderTotal,
      resolvedRestaurantId,
      notes,
      paymentMethod,
      cardLastFour,
      orderStatus,
      paidAt,
    );
    await createOrderItems(client, order.id, validatedItems);
    for (const item of validatedItems) {
      await client.query(
        'UPDATE menu SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.menu_id],
      );
    }
    await client.query('COMMIT');

    if (resolvedRestaurantId) {
      await notifyRestaurantManager(resolvedRestaurantId, {
        title: 'Nuevo pedido recibido',
        message: `Pedido #${order.id} — ${paymentMethod === 'card' ? 'tarjeta' : 'contra entrega'}`,
        type: 'order',
      });
    }

    await createNotification({
      userId,
      title: 'Pedido registrado',
      message: `Tu pedido #${order.id} está pendiente. El restaurante lo confirmará pronto.`,
      type: 'order',
    });

    return await getOrderWithItems(order.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getOrders = async () => {
  return await getAllOrders();
};

export const getOrdersByRestaurant = async (restaurantId) => {
  return await getOrdersByRestaurantModel(restaurantId);
};

export const getMyOrders = async (userId) => {
  return await getOrdersByUserId(userId);
};

export const getOrderById = async (id) => {
  const order = await getOrderWithItems(id);

  if (!order) {
    const error = new Error('Order not found');
    error.status = 404;
    throw error;
  }

  return order;
};

export const confirmOrder = async (id) => {
  const order = await getOrderByIdModel(id);

  if (!order) {
    const error = new Error('Order not found');
    error.status = 404;
    throw error;
  }

  if (order.status !== 'pending') {
    const error = new Error('Solo se pueden confirmar órdenes en estado pending');
    error.status = 400;
    throw error;
  }

  await updateOrderStatusModel(id, 'confirmed');
  return await getOrderWithItems(id);
};

export const updateOrderStatus = async (id, status) => {
  if (!VALID_STATUSES.includes(status)) {
    const error = new Error(`Estado inválido. Estados válidos: ${VALID_STATUSES.join(', ')}`);
    error.status = 400;
    throw error;
  }

  const order = await getOrderByIdModel(id);

  if (!order) {
    const error = new Error('Order not found');
    error.status = 404;
    throw error;
  }

  // No permitir cambiar de completed o cancelled
  if (order.status === 'completed' || order.status === 'cancelled') {
    const error = new Error(`No se puede cambiar el estado de una orden ${order.status}`);
    error.status = 400;
    throw error;
  }

  await updateOrderStatusModel(id, status);

  if (status === 'completed') {
    const completedOrder = await getOrderWithItems(id);
    await finalizeOrderOnComplete(completedOrder);
  }

  const updated = await getOrderWithItems(id);

  if (status === 'ready' && order.user_id) {
    await createNotification({
      userId: order.user_id,
      title: 'Tu pedido está listo',
      message: `El pedido #${id} está listo para recoger o entrega.`,
      type: 'order',
    });
  }

  return updated;
};

export const cancelOrder = async (id, userId = null, userRole = null) => {
  const order = await getOrderWithItems(id);

  if (!order) {
    const error = new Error('Order not found');
    error.status = 404;
    throw error;
  }

  if (userRole === 'client' && order.user_id !== userId) {
    const error = new Error('No tienes permiso para cancelar esta orden');
    error.status = 403;
    throw error;
  }

  if (order.status === 'completed') {
    const error = new Error('No se puede cancelar una orden completada');
    error.status = 400;
    throw error;
  }

  if (order.status === 'cancelled') {
    const error = new Error('La orden ya está cancelada');
    error.status = 400;
    throw error;
  }

  for (const item of order.items) {
    await restoreDishStock(item.menu_id, item.quantity);
  }

  await updateOrderStatusModel(id, 'cancelled');
  return await getOrderWithItems(id);
};

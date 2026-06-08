import {
  createInvoice as createInvoiceModel,
  getInvoiceById as getInvoiceByIdModel,
  getInvoiceByOrderId as getInvoiceByOrderIdModel,
  getInvoicesByUser as getInvoicesByUserModel,
  getAllInvoices as getAllInvoicesModel,
  getOrderWithItemsForInvoice,
} from './invoice.model.js';

const TAX_RATE = 0.12;

const mapOrderItemsForInvoice = (items = []) =>
  items.map((item) => {
    const qty = Number(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const subtotal = parseFloat(item.line_total ?? qty * price) || 0;
    return {
      name: item.name,
      quantity: qty,
      price,
      subtotal,
    };
  });

export const buildInvoiceResponse = async (invoiceRow) => {
  if (!invoiceRow) return null;

  const order = await getOrderWithItemsForInvoice(invoiceRow.order_id);
  const items = mapOrderItemsForInvoice(order?.items);

  return {
    id: invoiceRow.id,
    order_id: invoiceRow.order_id,
    user_id: invoiceRow.user_id,
    subtotal: parseFloat(invoiceRow.subtotal) || 0,
    tax: parseFloat(invoiceRow.tax) || 0,
    total: parseFloat(invoiceRow.total) || 0,
    notes: invoiceRow.notes,
    issued_at: invoiceRow.issued_at,
    items,
  };
};

export const buildInvoiceAmounts = (orderTotal) => {
  const subtotal = parseFloat(orderTotal) || 0;
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));
  return { subtotal, tax, total };
};

export const createInvoiceForOrder = async (orderId, userId) => {
  const order = await getOrderWithItemsForInvoice(orderId);
  if (!order) {
    const error = new Error('Pedido no encontrado');
    error.status = 404;
    throw error;
  }

  const existing = await getInvoiceByOrderIdModel(orderId);
  if (existing) return existing;

  const orderTotal = parseFloat(order.total) || 0;
  if (orderTotal <= 0) {
    const error = new Error('El pedido no tiene un total válido para facturar');
    error.status = 400;
    throw error;
  }

  const { subtotal, tax, total } = buildInvoiceAmounts(orderTotal);

  return createInvoiceModel({
    order_id: orderId,
    user_id: userId ?? order.user_id,
    subtotal,
    tax,
    total,
  });
};

export const generateInvoice = async (orderId, userId, userRole) => {
  const order = await getOrderWithItemsForInvoice(orderId);
  if (!order) {
    const error = new Error('Pedido no encontrado');
    error.status = 404;
    throw error;
  }

  if (!['confirmed', 'completed'].includes(order.status)) {
    const error = new Error('Solo se puede generar factura para pedidos confirmados o completados');
    error.status = 400;
    throw error;
  }

  const existing = await getInvoiceByOrderIdModel(orderId);
  if (existing) {
    const error = new Error('Ya existe una factura para este pedido');
    error.status = 409;
    throw error;
  }

  const invoice = await createInvoiceForOrder(orderId, order.user_id);
  return buildInvoiceResponse(invoice);
};

export const getInvoiceById = async (id, userId, userRole) => {
  const invoice = await getInvoiceByIdModel(id);
  if (!invoice) {
    const error = new Error('Factura no encontrada');
    error.status = 404;
    throw error;
  }

  if (userRole !== 'ADMIN_ROLE' && userRole !== 'MANAGER_ROLE' && invoice.user_id !== userId) {
    const error = new Error('No tienes permiso para ver esta factura');
    error.status = 403;
    throw error;
  }

  return buildInvoiceResponse(invoice);
};

export const getInvoiceByOrder = async (orderId, userId, userRole) => {
  const invoice = await getInvoiceByOrderIdModel(orderId);
  if (!invoice) {
    const error = new Error('No existe factura para este pedido');
    error.status = 404;
    throw error;
  }

  if (userRole !== 'ADMIN_ROLE' && userRole !== 'MANAGER_ROLE' && invoice.user_id !== userId) {
    const error = new Error('No tienes permiso para ver esta factura');
    error.status = 403;
    throw error;
  }

  return buildInvoiceResponse(invoice);
};

export const getMyInvoices = async (userId) => {
  return await getInvoicesByUserModel(userId);
};

export const getAllInvoices = async () => {
  return await getAllInvoicesModel();
};

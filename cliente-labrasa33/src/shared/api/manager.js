import { axiosAdmin } from './api';

// ─── MANAGER (restaurante asignado) ─────────────────────
export const getMyRestaurant = () =>
  axiosAdmin.get('/manager/my-restaurant').then(r => r.data);

// ─── MESAS ────────────────────────────────────────────────────
export const getTablesByRestaurant = (restaurantId) =>
  axiosAdmin.get(`/tables/restaurant/${restaurantId}`).then(r => r.data);

export const createTable = (data) =>
  axiosAdmin.post('/tables', data).then(r => r.data);

export const updateTable = (id, data) =>
  axiosAdmin.put(`/tables/${id}`, data).then(r => r.data);

export const updateTableStatus = (id, status) =>
  axiosAdmin.patch(`/tables/${id}/status`, { status }).then(r => r.data);

export const deleteTable = (id) =>
  axiosAdmin.delete(`/tables/${id}`).then(r => r.data);

// ─── MENÚ (GERENTE) ───────────────────────────────────────────
export const getDishesByRestaurant = (restaurantId) =>
  axiosAdmin.get(`/menu/restaurant/${restaurantId}`).then(r => r.data);

export const getDishById = (id) =>
  axiosAdmin.get(`/menu/${id}`).then(r => r.data);

export const createDish = (formData) =>
  axiosAdmin.post('/menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const updateDish = (id, formData) =>
  axiosAdmin.put(`/menu/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const updateDishStock = (id, stock) =>
  axiosAdmin.patch(`/menu/${id}/stock`, { stock }).then(r => r.data);

export const deleteDish = (id) =>
  axiosAdmin.delete(`/menu/${id}`).then(r => r.data);

// ─── PEDIDOS (GERENTE) ────────────────────────────────────────
export const getOrdersByRestaurant = (restaurantId) =>
  axiosAdmin.get(`/orders/restaurant/${restaurantId}`).then(r => r.data);

export const confirmOrderManager = (id) =>
  axiosAdmin.patch(`/orders/${id}/confirm`).then(r => r.data);

export const updateOrderStatusManager = (id, status) =>
  axiosAdmin.patch(`/orders/${id}/status`, { status }).then(r => r.data);

// ─── RESERVACIONES (GERENTE) ──────────────────────────────────
export const getReservationsByRestaurant = (restaurantId) =>
  axiosAdmin.get(`/reservations/restaurant/${restaurantId}`).then(r => r.data);

/**
 * Actualiza datos de una reservación (fecha, hora, personas, notas, type).
 * Backend: PUT /reservations/:id
 */
export const updateReservationManager = (id, data) =>
  axiosAdmin.put(`/reservations/${id}`, data).then(r => r.data);

/**
 * Marca una reservación como completada.
 * Backend: PATCH /reservations/:id/complete
 */
export const completeReservation = (id) =>
  axiosAdmin.patch(`/reservations/${id}/complete`).then(r => r.data);

/**
 * Cancela una reservación desde el panel del gerente.
 * Backend: PATCH /reservations/:id/cancel
 */
export const cancelReservationManager = (id) =>
  axiosAdmin.patch(`/reservations/${id}/cancel`).then(r => r.data);

// ─── FACTURAS ─────────────────────────────────────────────────
export const generateInvoice = (orderId) =>
  axiosAdmin.post(`/invoices/generate/${orderId}`).then(r => r.data);

export const getInvoiceByOrder = (orderId) =>
  axiosAdmin.get(`/invoices/order/${orderId}`).then(r => r.data);

export const getAllInvoices = () =>
  axiosAdmin.get('/invoices/all').then(r => r.data);

// ─── REPORTES (ADMIN + GERENTE) ───────────────────────────────
export const getReportRevenue = (params = {}) =>
  axiosAdmin.get('/reports/total-revenue', { params }).then(r => r.data);

export const getReportSalesByDate = (params = {}) =>
  axiosAdmin.get('/reports/sales-by-date', { params }).then(r => r.data);

export const getReportTopProducts = (params = {}) =>
  axiosAdmin.get('/reports/top-products', { params }).then(r => r.data);

export const getReportOrdersByStatus = (params = {}) =>
  axiosAdmin.get('/reports/orders-by-status', { params }).then(r => r.data);

export const getReportReservations = (params = {}) =>
  axiosAdmin.get('/reports/reservations-report', { params }).then(r => r.data);

export const getReportTopCustomers = (params = {}) =>
  axiosAdmin.get('/reports/manager/top-customers', { params }).then(r => r.data);

// ─── ESTADÍSTICAS (ADMIN) ─────────────────────────────────────
export const getGlobalStats = () =>
  axiosAdmin.get('/admin/stats').then(r => r.data);

export const getRestaurantPerformance = (restaurantId) =>
  axiosAdmin.get(`/admin/restaurants/${restaurantId}/performance`).then(r => r.data);

export const getAllRestaurantsAdmin = () =>
  axiosAdmin.get('/admin/restaurants').then(r => r.data);

export const toggleRestaurantActive = (restaurantId) =>
  axiosAdmin.patch(`/admin/restaurants/${restaurantId}/toggle-active`).then(r => r.data);

// ─── PROMOCIONES (ADMIN + GERENTE) ────────────────────────────
export const getPublicPromotions = () =>
  axiosAdmin.get('/promotions').then(r => r.data);

export const getAllPromotions = () =>
  axiosAdmin.get('/promotions/all').then(r => r.data);

export const getPendingPromotions = () =>
  axiosAdmin.get('/admin/promotions/pending').then(r => r.data);

export const getPromotionsByRestaurant = (restaurantId) =>
  axiosAdmin.get(`/promotions/restaurant/${restaurantId}`).then(r => r.data);

export const createPromotion = (data) =>
  axiosAdmin.post('/promotions', data).then(r => r.data);

export const updatePromotion = (id, data) =>
  axiosAdmin.put(`/promotions/${id}`, data).then(r => r.data);

export const deletePromotion = (id) =>
  axiosAdmin.delete(`/promotions/${id}`).then(r => r.data);

export const approvePromotion = (id) =>
  axiosAdmin.patch(`/promotions/${id}/approve`).then(r => r.data);

export const rejectPromotion = (id) =>
  axiosAdmin.patch(`/promotions/${id}/reject`).then(r => r.data);

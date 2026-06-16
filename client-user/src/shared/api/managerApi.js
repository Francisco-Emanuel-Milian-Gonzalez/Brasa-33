// client-user/src/shared/api/managerApi.js
import restaurantClient from './restaurantClient';

const unwrap = (response) => response.data?.data ?? response.data;

export const getMyRestaurant = () =>
  restaurantClient.get('/manager/my-restaurant').then(unwrap);

export const getOrdersByRestaurant = (restaurantId) =>
  restaurantClient.get(`/orders/restaurant/${restaurantId}`).then(unwrap);

export const updateOrderStatus = (id, status) =>
  restaurantClient.patch(`/orders/${id}/status`, { status }).then(unwrap);

export const confirmOrder = (id) =>
  restaurantClient.patch(`/orders/${id}/confirm`).then(unwrap);

export const generateInvoice = (orderId) =>
  restaurantClient.post(`/invoices/generate/${orderId}`).then(unwrap);

export const getInvoiceByOrder = (orderId) =>
  restaurantClient.get(`/invoices/order/${orderId}`).then(unwrap);

export const getTablesByRestaurant = (restaurantId) =>
  restaurantClient.get(`/tables/restaurant/${restaurantId}`).then(unwrap);

export const updateTableStatus = (id, status) =>
  restaurantClient.patch(`/tables/${id}/status`, { status }).then(unwrap);

export const getDishesByRestaurant = (restaurantId) =>
  restaurantClient.get(`/menu/restaurant/${restaurantId}`).then(unwrap);

export const updateDishStock = (id, stock) =>
  restaurantClient.patch(`/menu/${id}/stock`, { stock }).then(unwrap);

export const deleteDish = (id) =>
  restaurantClient.delete(`/menu/${id}`).then(unwrap);

export const getInventory = () =>
  restaurantClient.get('/inventory').then(unwrap);

export const getReservationsByRestaurant = (restaurantId) =>
  restaurantClient.get(`/reservations/restaurant/${restaurantId}`).then(unwrap);

export const completeReservation = (id) =>
  restaurantClient.patch(`/reservations/${id}/complete`).then(unwrap);

export const cancelReservationManager = (id) =>
  restaurantClient.patch(`/reservations/${id}/cancel`).then(unwrap);

export const getReportRevenue = (params) =>
  restaurantClient.get('/reports/total-revenue', { params }).then(unwrap);

export const getReportOrdersByStatus = (params) =>
  restaurantClient.get('/reports/orders-by-status', { params }).then(unwrap);

export const getReportTopProducts = (params) =>
  restaurantClient.get('/reports/top-products', { params }).then(unwrap);

export const getReportReservations = (params) =>
  restaurantClient.get('/reports/reservations-report', { params }).then(unwrap);

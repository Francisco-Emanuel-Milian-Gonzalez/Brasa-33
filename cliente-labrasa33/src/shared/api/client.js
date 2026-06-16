import { axiosAdmin } from './api';

// ─── RESTAURANTES (PÚBLICO) ───────────────────────────────
export const getRestaurantsPublic = () =>
  axiosAdmin.get('/restaurants').then(r => r.data);

export const getRestaurantByIdPublic = (id) =>
  axiosAdmin.get(`/restaurants/${id}`).then(r => r.data);

// ─── MENÚ (PÚBLICO) ───────────────────────────────────────
export const getMenuByRestaurant = (restaurantId) =>
  axiosAdmin.get('/menu', { params: { restaurant_id: restaurantId } }).then(r => r.data);

// ─── RESERVACIONES (CLIENTE) ──────────────────────────────
export const createReservation = (data) =>
  axiosAdmin.post('/reservations', data).then(r => r.data);

export const getMyReservations = () =>
  axiosAdmin.get('/reservations/my-reservations').then(r => r.data);

export const updateReservation = (id, data) =>
  axiosAdmin.put(`/reservations/${id}`, data).then(r => r.data);

export const cancelReservation = (id) =>
  axiosAdmin.patch(`/reservations/${id}/cancel`).then(r => r.data);

// ─── PEDIDOS (CLIENTE) ────────────────────────────────────
export const createClientOrder = (data) =>
  axiosAdmin.post('/orders', data).then(r => r.data);

export const getClientOrders = () =>
  axiosAdmin.get('/orders/my-orders').then(r => r.data);

export const cancelClientOrder = (id) =>
  axiosAdmin.patch(`/orders/${id}/cancel`).then(r => r.data);

// ─── RESEÑAS (CLIENTE) ────────────────────────────────────
export const createReview = (data) =>
  axiosAdmin.post('/reviews', data).then(r => r.data);

export const getMyReviews = () =>
  axiosAdmin.get('/reviews/my-reviews').then(r => r.data);

export const getReviewsByRestaurant = (restaurantId) =>
  axiosAdmin.get(`/reviews/restaurant/${restaurantId}`).then(r => r.data);

export const updateReview = (id, data) =>
  axiosAdmin.put(`/reviews/${id}`, data).then(r => r.data);

export const deleteReview = (id) =>
  axiosAdmin.delete(`/reviews/${id}`).then(r => r.data);

// ─── FACTURAS (CLIENTE) ───────────────────────────────────
export const getMyInvoices = () =>
  axiosAdmin.get('/invoices/my-invoices').then(r => r.data);

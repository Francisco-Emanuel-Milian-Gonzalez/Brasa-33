import { create } from 'zustand';
import {
  getRestaurantsPublic,
  getMenuByRestaurant,
  createReservation,
  getMyReservations,
  updateReservation,
  cancelReservation,
  createClientOrder,
  getClientOrders,
  cancelClientOrder,
  createReview,
  getMyReviews,
  getReviewsByRestaurant,
  updateReview,
  deleteReview,
  getMyInvoices,
} from '../../../shared/api/client.js';
import { getPublicPromotions } from '../../../shared/api/manager.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

const mapReservation = (r) => ({
  ...r,
  reservation_date: r.reservation_date ?? r.date,
  reservation_time: r.reservation_time ?? r.time,
  party_size: r.party_size ?? r.people_count,
});

export const useClientStore = create((set, get) => ({
  restaurants: [],
  currentMenu: [],
  reservations: [],
  orders: [],
  reviews: [],
  restaurantReviews: [],
  invoices: [],
  promotions: [],
  loading: false,
  cart: [],

  /* ── RESTAURANTS ── */
  fetchRestaurants: async () => {
    try {
      set({ loading: true });
      const res = await getRestaurantsPublic();
      set({
        restaurants: (res.data || []).map((r) => ({
          ...r,
          avg_rating: Number(r.average_rating ?? r.avg_rating ?? 0),
          review_count: Number(r.review_count ?? 0),
        })),
      });
    } catch {
      showError('Error al cargar restaurantes');
    } finally {
      set({ loading: false });
    }
  },

  fetchMenu: async (restaurantId) => {
    try {
      const res = await getMenuByRestaurant(restaurantId);
      set({ currentMenu: res.data || [] });
    } catch {
      showError('Error al cargar menú');
    }
  },

  /* ── CART ── */
  addToCart: (dish) => {
    const cart = get().cart;
    const existing = cart.find(i => i.id === dish.id);
    if (existing) {
      set({ cart: cart.map(i => i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      set({ cart: [...cart, { ...dish, quantity: 1 }] });
    }
  },

  removeFromCart: (dishId) => {
    const cart = get().cart;
    const item = cart.find(i => i.id === dishId);
    if (item?.quantity > 1) {
      set({ cart: cart.map(i => i.id === dishId ? { ...i, quantity: i.quantity - 1 } : i) });
    } else {
      set({ cart: cart.filter(i => i.id !== dishId) });
    }
  },

  clearCart: () => set({ cart: [] }),

  /* ── RESERVATIONS ── */
  fetchReservations: async () => {
    try {
      set({ loading: true });
      const res = await getMyReservations();
      set({ reservations: (res.data || []).map(mapReservation) });
    } catch {
      showError('Error al cargar reservaciones');
    } finally {
      set({ loading: false });
    }
  },

  makeReservation: async (data) => {
    try {
      const res = await createReservation(data);
      const newRes = mapReservation(res.data);
      set({ reservations: [newRes, ...get().reservations] });
      showSuccess('Reservación creada');
      return { success: true, data: newRes };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear reservación';
      showError(msg);
      return { success: false };
    }
  },

  modifyReservation: async (id, data) => {
    try {
      const res = await updateReservation(id, data);
      set({
        reservations: get().reservations.map(r =>
          r.id === id ? mapReservation(res.data) : r
        ),
      });
      showSuccess('Reservación actualizada');
    } catch (err) {
      showError(err.response?.data?.message || 'Error al actualizar reservación');
    }
  },

  cancelReservation: async (id) => {
    try {
      await cancelReservation(id);
      set({
        reservations: get().reservations.map(r =>
          r.id === id ? { ...r, status: 'cancelled' } : r
        ),
      });
      showSuccess('Reservación cancelada');
    } catch {
      showError('Error al cancelar reservación');
    }
  },

  /* ── ORDERS ── */
  fetchMyOrders: async () => {
    try {
      set({ loading: true });
      const res = await getClientOrders();
      set({ orders: res.data || [] });
    } catch {
      showError('Error al cargar pedidos');
    } finally {
      set({ loading: false });
    }
  },

  placeOrder: async (data) => {
    try {
      const res = await createClientOrder(data);
      const newOrder = res.data;
      set({ orders: [newOrder, ...get().orders] });
      showSuccess('Pedido realizado');
      return { success: true, data: newOrder };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al realizar pedido';
      showError(msg);
      return { success: false };
    }
  },

  cancelOrder: async (id) => {
    try {
      await cancelClientOrder(id);
      set({
        orders: get().orders.map(o =>
          o.id === id ? { ...o, status: 'cancelled' } : o
        ),
      });
      showSuccess('Pedido cancelado');
    } catch {
      showError('Error al cancelar pedido');
    }
  },

  /* ── REVIEWS ── */
  fetchMyReviews: async () => {
    try {
      const res = await getMyReviews();
      set({ reviews: res.data || [] });
    } catch {
      showError('Error al cargar reseñas');
    }
  },

  submitReview: async (data) => {
    try {
      const res = await createReview(data);
      set({ reviews: [res.data, ...get().reviews] });
      showSuccess('Reseña enviada');
      return { success: true };
    } catch (err) {
      showError(err.response?.data?.message || 'Error al enviar reseña');
      return { success: false };
    }
  },

  editReview: async (id, data) => {
    try {
      const res = await updateReview(id, data);
      set({ reviews: get().reviews.map(r => r.id === id ? res.data : r) });
      showSuccess('Reseña actualizada');
    } catch {
      showError('Error al actualizar reseña');
    }
  },

  removeReview: async (id) => {
    try {
      await deleteReview(id);
      set({ reviews: get().reviews.filter(r => r.id !== id) });
      showSuccess('Reseña eliminada');
    } catch {
      showError('Error al eliminar reseña');
    }
  },

  fetchReviewsByRestaurant: async (restaurantId) => {
    try {
      const res = await getReviewsByRestaurant(restaurantId);
      set({ restaurantReviews: res.data ?? res ?? [] });
    } catch {
      showError('Error al cargar reseñas');
    }
  },

  /* ── INVOICES ── */
  fetchMyInvoices: async () => {
    try {
      set({ loading: true });
      const res = await getMyInvoices();
      set({ invoices: res.data ?? res ?? [] });
    } catch {
      showError('Error al cargar facturas');
    } finally {
      set({ loading: false });
    }
  },

  /* ── PUBLIC PROMOTIONS ── */
  fetchPromotions: async () => {
    try {
      const res = await getPublicPromotions();
      set({ promotions: res.data ?? res ?? [] });
    } catch {
      // promotions are optional — fail silently
    }
  },
}));

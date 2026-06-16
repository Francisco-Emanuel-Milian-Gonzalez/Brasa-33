import { create } from 'zustand';
import {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  confirmOrder,
  updateOrderStatus,
  cancelOrder,
} from '../../../shared/api';

export const useOrdersStore = create((set, get) => ({
  orders: [],
  currentOrder: null,

  loading: false,
  error: null,

  getOrders: async () => {
    try {
      set({ loading: true, error: null });

      const res = await getOrders();

      set({
        orders: res.data.data || res.data,
      });
    } catch (err) {
      set({ error: 'Error al obtener órdenes' });
    } finally {
      set({ loading: false });
    }
  },

  getMyOrders: async () => {
    try {
      set({ loading: true, error: null });

      const res = await getMyOrders();

      set({
        orders: res.data.data || res.data,
      });
    } catch (err) {
      set({ error: 'Error al obtener mis órdenes' });
    } finally {
      set({ loading: false });
    }
  },

  getOrderById: async (id) => {
    try {
      set({ loading: true, error: null });

      const res = await getOrderById(id);

      set({
        currentOrder: res.data.data || res.data,
      });

      return res.data.data || res.data;
    } catch (err) {
      set({ error: 'Error al obtener la orden' });
    } finally {
      set({ loading: false });
    }
  },

  createOrder: async (data) => {
    try {
      set({ loading: true, error: null });

      const res = await createOrder(data);

      const newOrder = res.data.data || res.data;

      set({
        orders: [newOrder, ...get().orders],
      });

      return newOrder;
    } catch (err) {
      set({ error: 'Error al crear orden' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  confirmOrder: async (id) => {
    try {
      const res = await confirmOrder(id);
      const updated = res.data.data || res.data;

      set({
        orders: get().orders.map((o) =>
          o.id === id ? updated : o
        ),
      });

      return updated;
    } catch (err) {
      set({ error: 'Error al confirmar orden' });
    }
  },


  updateOrderStatus: async (id, status) => {
    try {
      const res = await updateOrderStatus(id, { status });
      const updated = res.data.data || res.data;

      set({
        orders: get().orders.map((o) =>
          o.id === id ? updated : o
        ),
      });

      return updated;
    } catch (err) {
      set({ error: 'Error al actualizar estado de orden' });
    }
  },

  cancelOrder: async (id) => {
    try {
      const res = await cancelOrder(id);
      const updated = res.data.data || res.data;
      set({ orders: get().orders.map((o) => (o.id === id ? updated : o)) });
      return updated;
    } catch (err) {
      set({ error: 'Error al cancelar orden' });
    }
  },

  deleteOrder: async (id) => {
    try {
      await cancelOrder(id);
      set({ orders: get().orders.filter((o) => o.id !== id) });
    } catch (err) {
      set({ error: 'Error al eliminar orden' });
    }
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },
}));
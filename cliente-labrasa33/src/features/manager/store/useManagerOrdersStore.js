import { create } from 'zustand';
import {
  getOrdersByRestaurant,
  confirmOrderManager,
  updateOrderStatusManager,
  generateInvoice,
  getInvoiceByOrder,
} from '../../../shared/api/manager.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

/** Normaliza respuesta de factura (plana o anidada invoice + order). */
const normalizeInvoice = (data) => {
  if (!data) return null;
  if (data.id && data.subtotal != null) return data;
  if (data.invoice) {
    const inv = data.invoice;
    const items = (data.order?.items || []).map((item) => {
      const qty = Number(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return {
        name: item.name,
        quantity: qty,
        subtotal: parseFloat(item.line_total ?? qty * price) || 0,
      };
    });
    return { ...inv, items };
  }
  return data;
};

export const useManagerOrdersStore = create((set, get) => ({
  orders: [],
  invoice: null,
  loading: false,

  fetchOrders: async (restaurantId) => {
    if (!restaurantId) return;
    try {
      set({ loading: true });
      const res = await getOrdersByRestaurant(restaurantId);
      set({ orders: res.data || [] });
    } catch {
      showError('Error al cargar pedidos');
    } finally {
      set({ loading: false });
    }
  },

  confirmOrder: async (id) => {
    try {
      await confirmOrderManager(id);
      set({
        orders: get().orders.map(o =>
          o.id === id ? { ...o, status: 'confirmed' } : o
        ),
      });
      showSuccess('Pedido confirmado');
    } catch {
      showError('Error al confirmar pedido');
    }
  },

  setStatus: async (id, status) => {
    try {
      await updateOrderStatusManager(id, status);
      set({
        orders: get().orders.map(o =>
          o.id === id ? { ...o, status } : o
        ),
      });
      showSuccess(`Estado: ${status}`);
    } catch {
      showError('Error al cambiar estado');
    }
  },

  generateInvoice: async (orderId) => {
    try {
      const res = await generateInvoice(orderId);
      set({ invoice: normalizeInvoice(res.data) });
      showSuccess('Factura generada');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al generar factura';
      showError(msg);
      return null;
    }
  },

  fetchInvoice: async (orderId) => {
    try {
      const res = await getInvoiceByOrder(orderId);
      set({ invoice: normalizeInvoice(res.data) });
      return res.data;
    } catch {
      return null;
    }
  },

  clearInvoice: () => set({ invoice: null }),
}));

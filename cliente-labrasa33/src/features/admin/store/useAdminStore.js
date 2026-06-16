import { create } from 'zustand';
import {
  getGlobalStats,
  getPendingPromotions,
  getAllPromotions,
  approvePromotion,
  rejectPromotion,
} from '../../../shared/api/manager.js';
import { showError } from '../../../shared/utils/toast.js';

export const useAdminStore = create((set, get) => ({
  stats: null,
  promotions: [],
  pendingPromotions: [],
  loading: false,
  error: null,

  fetchStats: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getGlobalStats();
      set({ stats: res.data });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al obtener estadísticas';
      set({ error: msg });
      showError(msg);
    } finally {
      set({ loading: false });
    }
  },

  fetchAllPromotions: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getAllPromotions();
      set({ promotions: res.data || [] });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al obtener promociones';
      set({ error: msg });
      showError(msg);
    } finally {
      set({ loading: false });
    }
  },

  fetchPendingPromotions: async () => {
    try {
      const res = await getPendingPromotions();
      set({ pendingPromotions: res.data || [] });
    } catch (err) {
      showError('Error al obtener promociones pendientes');
    }
  },

  approvePromotion: async (id) => {
    try {
      await approvePromotion(id);
      set({
        promotions: get().promotions.map(p =>
          p.id === id ? { ...p, status: 'approved' } : p
        ),
        pendingPromotions: get().pendingPromotions.filter(p => p.id !== id),
      });
    } catch (err) {
      showError('Error al aprobar promoción');
    }
  },

  rejectPromotion: async (id) => {
    try {
      await rejectPromotion(id);
      set({
        promotions: get().promotions.map(p =>
          p.id === id ? { ...p, status: 'rejected' } : p
        ),
        pendingPromotions: get().pendingPromotions.filter(p => p.id !== id),
      });
    } catch (err) {
      showError('Error al rechazar promoción');
    }
  },
}));

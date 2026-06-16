import { create } from 'zustand';
import {
  getTablesByRestaurant,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
} from '../../../shared/api/manager.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

export const useTablesStore = create((set, get) => ({
  tables: [],
  loading: false,

  fetchTables: async (restaurantId) => {
    if (!restaurantId) return;
    try {
      set({ loading: true });
      const res = await getTablesByRestaurant(restaurantId);
      set({ tables: res.data || [] });
    } catch {
      showError('Error al cargar mesas');
    } finally {
      set({ loading: false });
    }
  },

  createTable: async (data) => {
    try {
      const res = await createTable(data);
      set({ tables: [...get().tables, res.data] });
      showSuccess('Mesa creada');
    } catch (err) {
      showError(err.response?.data?.message || 'Error al crear mesa');
      throw err;
    }
  },

  updateTable: async (id, data) => {
    try {
      const res = await updateTable(id, data);
      set({ tables: get().tables.map(t => t.id === id ? res.data : t) });
      showSuccess('Mesa actualizada');
    } catch (err) {
      showError(err.response?.data?.message || 'Error al actualizar mesa');
      throw err;
    }
  },

  setTableStatus: async (id, status) => {
    try {
      const res = await updateTableStatus(id, status);
      set({ tables: get().tables.map(t => t.id === id ? res.data : t) });
    } catch {
      showError('Error al cambiar estado');
    }
  },

  deleteTable: async (id) => {
    try {
      await deleteTable(id);
      set({ tables: get().tables.filter(t => t.id !== id) });
      showSuccess('Mesa eliminada');
    } catch {
      showError('Error al eliminar mesa');
    }
  },
}));

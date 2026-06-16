import { create } from 'zustand';
import {
  getDishesByRestaurant,
  createDish,
  updateDish,
  updateDishStock,
  deleteDish,
} from '../../../shared/api/manager.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

export const useManagerMenuStore = create((set, get) => ({
  dishes: [],
  loading: false,

  fetchDishes: async (restaurantId) => {
    if (!restaurantId) return;
    try {
      set({ loading: true });
      const res = await getDishesByRestaurant(restaurantId);
      set({ dishes: res.data || [] });
    } catch {
      showError('Error al cargar menú');
    } finally {
      set({ loading: false });
    }
  },

  createDish: async (data) => {
    try {
      const res = await createDish(data);
      set({ dishes: [...get().dishes, res.data] });
      showSuccess('Plato creado');
    } catch (err) {
      showError(err.response?.data?.message || 'Error al crear plato');
      throw err;
    }
  },

  updateDish: async (id, data) => {
    try {
      const res = await updateDish(id, data);
      set({ dishes: get().dishes.map(d => d.id === id ? res.data : d) });
      showSuccess('Plato actualizado');
    } catch (err) {
      showError(err.response?.data?.message || 'Error al actualizar plato');
      throw err;
    }
  },

  updateStock: async (id, stock) => {
    try {
      const res = await updateDishStock(id, stock);
      set({ dishes: get().dishes.map(d => d.id === id ? res.data : d) });
      showSuccess('Stock actualizado');
    } catch {
      showError('Error al actualizar stock');
    }
  },

  deleteDish: async (id) => {
    try {
      await deleteDish(id);
      set({ dishes: get().dishes.filter(d => d.id !== id) });
      showSuccess('Plato eliminado');
    } catch {
      showError('Error al eliminar plato');
    }
  },
}));

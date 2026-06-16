import { create } from 'zustand';
import {
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../../../shared/api';

export const useRestaurantsStore = create((set, get) => ({
  restaurants: [],
  loading: false,
  error: null,

  getRestaurants: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getRestaurants();
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      set({ restaurants: list, loading: false });
    } catch {
      set({ error: 'Error al obtener restaurantes', loading: false });
    }
  },

  createRestaurant: async (formData) => {
    try {
      set({ loading: true, error: null });
      const res = await createRestaurant(formData);
      const newRestaurant = res.data.data || res.data;
      set({ restaurants: [newRestaurant, ...get().restaurants], loading: false });
    } catch {
      set({ error: 'Error al crear restaurante', loading: false });
    }
  },

  updateRestaurant: async (id, formData) => {
    try {
      set({ loading: true, error: null });
      const res = await updateRestaurant(id, formData);
      const updated = res.data.data || res.data;
      set({
        restaurants: get().restaurants.map((r) => (r.id === id ? updated : r)),
        loading: false,
      });
    } catch {
      set({ error: 'Error al actualizar restaurante', loading: false });
    }
  },

  deleteRestaurant: async (id) => {
    try {
      await deleteRestaurant(id);
      set({ restaurants: get().restaurants.filter((r) => r.id !== id) });
    } catch {
      set({ error: 'Error al eliminar restaurante' });
    }
  },
}));
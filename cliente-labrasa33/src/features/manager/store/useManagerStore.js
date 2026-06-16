import { create } from 'zustand';
import { getMyRestaurant } from '../../../shared/api/manager.js';

export const useManagerStore = create((set) => ({
  myRestaurant: null,
  restaurantId: null,
  loading: false,
  error: null,

  fetchMyRestaurant: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getMyRestaurant();
      const restaurant = res.data ?? null;
      set({
        myRestaurant: restaurant,
        restaurantId: restaurant?.id ?? null,
        loading: false,
      });
      return restaurant;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'No se encontró el restaurante asignado a tu cuenta';
      set({ myRestaurant: null, restaurantId: null, loading: false, error: message });
      return null;
    }
  },

  clearRestaurant: () =>
    set({ myRestaurant: null, restaurantId: null, error: null }),
}));

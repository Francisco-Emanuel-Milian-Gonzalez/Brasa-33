// client-user/src/features/manager/store/useManagerStore.js
import { create } from 'zustand';
import { getMyRestaurant } from '../../../shared/api/managerApi';

export const useManagerStore = create((set) => ({
  myRestaurant: null,
  restaurantId: null,
  loading: false,
  error: null,

  fetchMyRestaurant: async () => {
    try {
      set({ loading: true, error: null });
      const restaurant = await getMyRestaurant();
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

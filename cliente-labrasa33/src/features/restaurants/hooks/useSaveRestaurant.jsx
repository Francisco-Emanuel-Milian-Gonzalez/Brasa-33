import { useRestaurantsStore } from '../store/useRestaurantStore.js';

export const useSaveRestaurant = () => {
  const createRestaurant = useRestaurantsStore((s) => s.createRestaurant);
  const updateRestaurant = useRestaurantsStore((s) => s.updateRestaurant);

  const saveRestaurant = async (data, id = null) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('address', data.address);
    formData.append('phone', data.phone);
    if (data.email)       formData.append('email', data.email);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.opening_time) formData.append('opening_time', data.opening_time);
    if (data.closing_time) formData.append('closing_time', data.closing_time);
    if (data.logo?.[0])   formData.append('logo', data.logo[0]);

    try {
      if (id) return await updateRestaurant(id, formData);
      return await createRestaurant(formData);
    } catch (err) {
      console.error('Error saving restaurant:', err);
      throw err;
    }
  };

  return { saveRestaurant };
};
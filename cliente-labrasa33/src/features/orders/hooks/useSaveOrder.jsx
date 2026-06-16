import { useOrdersStore } from '../store/useOrdersStore.js';

export const useSaveOrder = () => {
  const createOrder = useOrdersStore((s) => s.createOrder);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);

  const saveOrder = async (data, id = null) => {
    try {
      if (!id) {
        const payload = {
          items: (data.items || []).map((item) => ({
            menu_id: item.menu_id,
            quantity: item.quantity,
            price: item.price,
          })),
        };

        return await createOrder(payload);
      }

      return await updateOrderStatus(id, data.status);
    } catch (err) {
      console.error('Error saving order:', err);
      throw err;
    }
  };

  return { saveOrder };
};
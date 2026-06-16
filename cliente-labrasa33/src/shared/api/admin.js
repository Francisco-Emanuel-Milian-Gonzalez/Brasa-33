import { axiosAdmin } from './api';

// RESTAURANTES

// OBTENER TODOS
export const getRestaurants = async () => {
  const { data } = await axiosAdmin.get('/restaurants');
  return data;
};

// OBTENER UNO
export const getRestaurantById = async (id) => {
  const { data } = await axiosAdmin.get(`/restaurants/${id}`);
  return data;
};

// CREAR
export const createRestaurant = async (formData) => {
  return await axiosAdmin.post('/restaurants', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateRestaurant = async (id, formData) => {
  return await axiosAdmin.put(`/restaurants/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ELIMINAR
export const deleteRestaurant = async (id) => {
  return await axiosAdmin.delete(`/restaurants/${id}`);
};

export const assignRestaurantManager = async (restaurantId, managerId) => {
  const { data } = await axiosAdmin.put(`/restaurants/${restaurantId}/assign-manager`, {
    manager_id: managerId || null,
  });
  return data;
};

// PEDIDOS

// CREAR ORDEN
export const createOrder = async (data) => {
  return await axiosAdmin.post('/orders', data);
};

// OBTENER TODAS (ADMIN)
export const getOrders = async () => {
  const { data } = await axiosAdmin.get('/orders');
  return data;
};

// OBTENER MIS ÓRDENES (USER)
export const getMyOrders = async () => {
  const { data } = await axiosAdmin.get('/orders/my-orders');
  return data;
};

// OBTENER POR ID
export const getOrderById = async (id) => {
  const { data } = await axiosAdmin.get(`/orders/${id}`);
  return data;
};

// CONFIRMAR ORDEN
export const confirmOrder = async (id) => {
  const { data } = await axiosAdmin.patch(`/orders/${id}/confirm`);
  return data;
};

// ACTUALIZAR STATUS
export const updateOrderStatus = async (id, data) => {
  const { data: res } = await axiosAdmin.patch(
    `/orders/${id}/status`,
    data
  );
  return res;
};

// CANCELAR ORDEN
export const cancelOrder = async (id) => {
  const { data } = await axiosAdmin.patch(`/orders/${id}/cancel`);
  return data;
};
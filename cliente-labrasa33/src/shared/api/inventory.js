import { axiosAdmin } from './api';

export const getInventory = () =>
  axiosAdmin.get('/inventory').then((r) => r.data);

export const createInventoryItem = (data) =>
  axiosAdmin.post('/inventory', data).then((r) => r.data);

export const updateInventoryItem = (id, data) =>
  axiosAdmin.put(`/inventory/${id}`, data).then((r) => r.data);

export const deleteInventoryItem = (id) =>
  axiosAdmin.delete(`/inventory/${id}`).then((r) => r.data);

import { axiosAuth } from './api';

export const login = async (data) => {
  return await axiosAuth.post('/auth/login', data);
};

export const register = async (data) => {
  return await axiosAuth.post('/auth/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const verifyEmail = async (token) => {
  return await axiosAuth.post('/auth/verify-email', { token });
};

export const forgotPassword = async (email) => {
  const { data } = await axiosAuth.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await axiosAuth.post('/auth/reset-password', { token, newPassword: password });
  return data;
};

// ── User management (admin only) ─────────────────────────────────────────

export const getAllUsers = async () => {
  const { data } = await axiosAuth.get('/users');
  return { users: data.users ?? data };
};

export const updateUserRole = async (userId, roleName) => {
  const { data } = await axiosAuth.put(`/users/${userId}/role`, { roleName });
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await axiosAuth.delete(`/users/${userId}`);
  return data;
};

export const getProfile = async () => {
  const { data } = await axiosAuth.get('/auth/profile');
  return data;
};

export const updateProfile = async (formData) => {
  const { data } = await axiosAuth.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await axiosAuth.put('/users/change-password', payload);
  return data;
};

export const deleteMyAccount = async (payload) => {
  const { data } = await axiosAuth.delete('/users/me', { data: payload });
  return data;
};

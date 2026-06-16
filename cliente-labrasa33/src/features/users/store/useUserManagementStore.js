import { create } from 'zustand';
import {
  getAllUsers as getAllUsersRequest,
  updateUserRole as updateUserRoleRequest,
  deleteUser as deleteUserRequest,
} from '../../../shared/api';

export const useUserManagementStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,
  filters: {},

  setFilters: (filters) => set({ filters }),
  setUsers:   (users)   => set({ users }),

  getAllUsers: async (apiFn = getAllUsersRequest, options = {}) => {
    try {
      const { force = false } = options;
      const state = get();

      if (state.loading) return;
      if (!force && state.users.length > 0) return;

      set({ loading: true, error: null });

      const fetcher = typeof apiFn === 'function' ? apiFn : getAllUsersRequest;
      const response = await fetcher();

      set({ users: response.users ?? response, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Error al obtener los usuarios',
        loading: false,
      });
    }
  },

  updateUserRole: async (userId, roleName) => {
    set({ loading: true, error: null });
    try {
      await updateUserRoleRequest(userId, roleName);
      await get().getAllUsers(getAllUsersRequest, { force: true });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al actualizar el rol';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await deleteUserRequest(userId);
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al eliminar el usuario';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },
}));

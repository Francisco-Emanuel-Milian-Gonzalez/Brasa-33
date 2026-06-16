import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginRequest, register as registerRequest } from '../../../shared/api';
import { showError } from '../../../shared/utils/toast.js';
import { useManagerStore } from '../../manager/store/useManagerStore.js';

export const ROLES = {
  ADMIN: 'ADMIN_ROLE',
  MANAGER: 'MANAGER_ROLE',
  CLIENT: 'CLIENT_ROLE',
};

const ALL_ROLES = Object.values(ROLES);

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      loading: false,
      error: null,
      isLoadingAuth: true,
      isAuthenticated: false,

      checkAuth: async () => {
        const token = get().token;
        const role = get().user?.role;
        const hasValidRole = ALL_ROLES.includes(role);
        if (token && !hasValidRole) {
          set({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            isAuthenticated: false,
            isLoadingAuth: false,
            error: 'No tienes permisos para acceder a esta aplicación',
          });
          useManagerStore.getState().clearRestaurant();
          return;
        }
        set({
          isLoadingAuth: false,
          isAuthenticated: Boolean(token) && hasValidRole,
        });
        if (token && role === ROLES.MANAGER) {
          await useManagerStore.getState().fetchMyRestaurant();
        }
      },

      logout: () => {
        useManagerStore.getState().clearRestaurant();
        set({
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
        });
      },

      login: async ({ emailOrUsername, password }) => {
        try {
          set({ loading: true, error: null });
          const { data } = await loginRequest({ emailOrUsername, password });
          const role = data?.userDetails?.role;

          if (!ALL_ROLES.includes(role)) {
            const message = 'No tienes permisos para acceder a esta aplicación';
            set({
              user: null,
              token: null,
              refreshToken: null,
              expiresAt: null,
              isAuthenticated: false,
              isLoadingAuth: false,
              error: message,
              loading: false,
            });
            showError(message);
            return { success: false, error: message };
          }

          set({
            user: data.userDetails,
            token: data.accessToken,
            refreshToken: data.refreshToken,
            expiresAt: data.expiresIn,
            isAuthenticated: true,
            loading: false,
          });

          if (role === ROLES.MANAGER) {
            await useManagerStore.getState().fetchMyRestaurant();
          } else {
            useManagerStore.getState().clearRestaurant();
          }

          return { success: true, role };
        } catch (err) {
          const message = err.response?.data?.message || 'Error al iniciar sesión';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      setUser: (user) => set({ user }),

      register: async (formData) => {
        try {
          set({ loading: true, error: null });
          const { data } = await registerRequest(formData);
          return {
            success: true,
            emailVerificationRequired: data?.emailVerificationRequired,
            data,
          };
        } catch (err) {
          const message =
            err.response?.data?.message ||
            err.response?.data?.error ||
            (typeof err.response?.data === 'string' ? err.response.data : null) ||
            'Error al registrar usuario';
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-la33-store',
      // Persist only stable auth data to avoid saving transient UI state
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

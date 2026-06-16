// client-user/src/shared/store/authStore.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Clave bajo la que se guarda el refresh token en el almacenamiento seguro.
export const REFRESH_TOKEN_KEY = 'brasa33_refresh_token';

/**
 * Store de autenticación.
 * - token y user se persisten en AsyncStorage (vía zustand/persist).
 * - El refresh token se guarda únicamente en SecureStore (nunca en AsyncStorage).
 * - _hasHydrated indica si el estado persistido ya fue restaurado al arrancar.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      /**
       * Inicia sesión: guarda el refresh token en SecureStore y
       * el access token + usuario en el estado persistido.
       */
      login: async (accessToken, user, refreshToken) => {
        if (refreshToken) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        }
        set({ token: accessToken, user, isAuthenticated: true });
      },

      /** Cierra sesión: limpia el estado y elimina el refresh token. */
      logout: async () => {
        try {
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        } catch {
          // Si no existe la clave, no hay nada que borrar.
        }
        set({ token: null, user: null, isAuthenticated: false });
      },

      /** Reemplaza el access token (usado por el flujo de refresh). */
      setAccessToken: (token) => set({ token }),

      /** Actualiza parcialmente los datos del usuario. */
      updateUser: (partialUser) =>
        set((state) => ({ user: { ...state.user, ...partialUser } })),

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'brasa33-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

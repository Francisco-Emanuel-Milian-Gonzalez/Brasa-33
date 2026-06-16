// client-user/src/shared/api/authClient.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from '../constants/endpoints';
import { REFRESH_TOKEN_KEY, useAuthStore } from '../store/authStore';

// Rutas de autenticación en las que un 401 NO debe disparar el flujo de refresh
// (credenciales inválidas, no token expirado).
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Promesa compartida del refresh en curso. Mientras exista, todas las
// peticiones que reciban 401 se encolan esperando este mismo resultado,
// de modo que solo se hace UNA llamada a /auth/refresh aunque fallen
// varias peticiones a la vez.
let refreshPromise = null;

/**
 * Renueva el access token usando el refresh token de SecureStore.
 * Devuelve el nuevo access token o lanza error si no es posible renovar.
 */
export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      // Se usa axios "puro" para no pasar por los interceptores y evitar bucles.
      const { data } = await axios.post(`${ENDPOINTS.AUTH}/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken = data.accessToken ?? data.token;
      if (!newAccessToken) {
        throw new Error('Respuesta de refresh inválida');
      }

      useAuthStore.getState().setAccessToken(newAccessToken);

      // Si el backend rota el refresh token, se guarda el nuevo.
      if (data.refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
      }

      return newAccessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Configura en un cliente axios:
 * - Header Authorization: Bearer <token> en cada petición.
 * - Reintento tras refresh cuando llega un 401 (con cola de concurrentes).
 * - logout() si el refresh falla.
 *
 * @param {import('axios').AxiosInstance} client
 * @param {object} [options]
 * @param {string[]} [options.skipRefreshPaths] - Rutas excluidas del refresh.
 */
export function attachAuthInterceptors(client, { skipRefreshPaths = [] } = {}) {
  client.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;

      const isSkipped = skipRefreshPaths.some((path) =>
        originalRequest?.url?.includes(path),
      );

      if (status !== 401 || originalRequest?._retry || isSkipped) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    },
  );

  return client;
}

/** Cliente HTTP del servicio de autenticación (.NET). */
const authClient = axios.create({
  baseURL: ENDPOINTS.AUTH,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

attachAuthInterceptors(authClient, { skipRefreshPaths: NO_REFRESH_PATHS });

export default authClient;

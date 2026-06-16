// client-user/src/shared/api/restaurantClient.js
import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints';
import { attachAuthInterceptors } from './authClient';

/**
 * Cliente HTTP del backend de restaurantes (Node.js/Express).
 * Comparte con authClient el flujo de refresh: en un 401 se renueva el
 * access token (una sola llamada aunque haya peticiones concurrentes)
 * y se reintenta; si el refresh falla, se cierra la sesión.
 */
const restaurantClient = axios.create({
  baseURL: ENDPOINTS.RESTAURANT,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

attachAuthInterceptors(restaurantClient);

export default restaurantClient;

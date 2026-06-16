// client-user/src/shared/constants/endpoints.js
// URLs base de los servicios. Ver .env.example para configuración en emulador/dispositivo.
import { Platform } from 'react-native';

const AUTH_PORT = process.env.EXPO_PUBLIC_AUTH_PORT || '5218';
const RESTAURANT_PORT = process.env.EXPO_PUBLIC_RESTAURANT_PORT || '3021';

/**
 * Resuelve el host del PC de desarrollo según la plataforma.
 * - Android emulador: 10.0.2.2 → localhost del PC host
 * - iOS simulador / web: localhost
 * - Dispositivo físico: EXPO_PUBLIC_DEV_HOST (IP Wi-Fi, la misma que muestra Metro)
 */
function resolveDevHost() {
  if (process.env.EXPO_PUBLIC_DEV_HOST) {
    return process.env.EXPO_PUBLIC_DEV_HOST;
  }
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
}

export const ENDPOINTS = {
  AUTH:
    process.env.EXPO_PUBLIC_AUTH_URL ||
    `http://${resolveDevHost()}:${AUTH_PORT}/api/v1`,
  RESTAURANT:
    process.env.EXPO_PUBLIC_RESTAURANT_URL ||
    `http://${resolveDevHost()}:${RESTAURANT_PORT}/brasa33/v1`,
};

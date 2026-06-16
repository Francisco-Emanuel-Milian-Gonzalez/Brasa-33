// client-user/src/shared/utils/alerts.js
import { Alert } from 'react-native';

export const isInactiveAccountMessage = (message) =>
  /no está activa|verifica tu correo|cuenta no activa/i.test(message || '');

/** Muestra alerta nativa según el tipo de error de login. */
export function showLoginErrorAlert(message, fallback = 'Credenciales incorrectas. Intenta de nuevo.') {
  const text = message || fallback;
  Alert.alert(
    isInactiveAccountMessage(text) ? 'Cuenta no activa' : 'Error al iniciar sesión',
    text,
  );
}

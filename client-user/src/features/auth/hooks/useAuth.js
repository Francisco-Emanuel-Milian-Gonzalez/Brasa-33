// client-user/src/features/auth/hooks/useAuth.js
import { useState } from 'react';
import authClient from '../../../shared/api/authClient';
import { ROLES } from '../../../shared/constants/roles';
import { useAuthStore } from '../../../shared/store/authStore';
import { showLoginErrorAlert } from '../../../shared/utils/alerts';

/** Extrae un mensaje legible del error de axios. */
function getErrorMessage(err, fallback) {
  return (
    err.response?.data?.message ||
    err.response?.data?.title ||
    (err.request && !err.response
      ? 'No se pudo conectar con el servidor. Verifica tu conexión.'
      : fallback)
  );
}

const ADMIN_BLOCKED_MSG =
  'Los administradores deben iniciar sesión desde la plataforma web.';

/**
 * Hook de autenticación: login, registro y logout contra el auth-service.
 * Expone { handleLogin, handleRegister, loading, error, logout }.
 */
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  /**
   * Inicia sesión con { emailOrUsername, password }.
   * Respuesta esperada: { accessToken, refreshToken, userDetails }
   * (se toleran las variantes token/user de otros backends).
   */
  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authClient.post('/auth/login', credentials);

      const accessToken = data.accessToken ?? data.token;
      const user = data.userDetails ?? data.user;
      if (!accessToken) {
        throw new Error('Respuesta de login inválida');
      }

      if (user?.role === ROLES.ADMIN) {
        const message = ADMIN_BLOCKED_MSG;
        setError(message);
        showLoginErrorAlert(message);
        return { success: false, error: message };
      }

      await login(accessToken, user, data.refreshToken);
      return { success: true, role: user?.role };
    } catch (err) {
      const message = getErrorMessage(
        err,
        'Credenciales incorrectas. Intenta de nuevo.',
      );
      setError(message);
      showLoginErrorAlert(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra un usuario con { name, surname, username, email, password, phone, profilePicture? }.
   * El backend espera multipart/form-data ([FromForm] en AuthController).
   */
  const handleRegister = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const { profilePicture, ...fields } = values;
      const formData = new FormData();

      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      if (profilePicture?.uri) {
        const uriParts = profilePicture.uri.split('/');
        const fallbackName = uriParts[uriParts.length - 1] || 'profile.jpg';
        formData.append('ProfilePicture', {
          uri: profilePicture.uri,
          name: profilePicture.fileName || fallbackName,
          type: profilePicture.mimeType || 'image/jpeg',
        });
      }

      const { data } = await authClient.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return { success: true, data };
    } catch (err) {
      const message = getErrorMessage(
        err,
        'No se pudo completar el registro. Intenta de nuevo.',
      );
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, handleRegister, loading, error, logout };
}

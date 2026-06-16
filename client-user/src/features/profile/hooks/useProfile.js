// client-user/src/features/profile/hooks/useProfile.js
import { useCallback, useState } from 'react';
import authClient from '../../../shared/api/authClient';
import { useAuthStore } from '../../../shared/store/authStore';

/**
 * Hook de perfil contra auth-service.
 * GET /auth/profile · PUT /users/profile (multipart/form-data).
 */
export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const updateUser = useAuthStore((state) => state.updateUser);

  /** GET /auth/profile */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authClient.get('/auth/profile');
      const data = response.data.data || response.data;
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el perfil');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** PUT /users/profile — actualiza datos y sincroniza el store. */
  const updateProfile = useCallback(
    async ({ name, surname, phone }) => {
      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('surname', surname);
        if (phone) formData.append('phone', phone);

        const response = await authClient.put('/users/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const data = response.data.data || response.data;

        updateUser({
          name: data.name,
          surname: data.surname,
          fullName: `${data.name || ''} ${data.surname || ''}`.trim(),
          phone: data.phone,
          profilePicture: data.profilePicture,
          email: data.email,
          username: data.username,
        });

        return { success: true, data };
      } catch (err) {
        const message = err.response?.data?.message || 'No se pudo actualizar el perfil';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [updateUser],
  );

  return { loading, error, fetchProfile, updateProfile };
}

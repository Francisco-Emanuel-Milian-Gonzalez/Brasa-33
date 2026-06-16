import { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useManagerStore } from '../store/useManagerStore.js';
import { useAuthStore, ROLES } from '../../auth/store/authStore.js';

const ORANGE = '#E17522';

export const ManagerRestaurantGuard = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const { myRestaurant, loading, error, fetchMyRestaurant } = useManagerStore();

  const isManager = user?.role === ROLES.MANAGER;

  useEffect(() => {
    if (isManager) fetchMyRestaurant();
  }, [isManager, fetchMyRestaurant]);

  if (!isManager) return children;

  if (loading && !myRestaurant) {
    return (
      <div className="flex justify-center py-20">
        <div
          className="h-10 w-10 rounded-full border-2 animate-spin"
          style={{ borderColor: `${ORANGE} transparent` }}
        />
      </div>
    );
  }

  if (!myRestaurant) {
    return (
      <div
        className="mx-6 mt-6 rounded-2xl border p-6 flex items-start gap-3"
        style={{ background: 'rgba(225,117,34,0.08)', borderColor: 'rgba(225,117,34,0.35)' }}
      >
        <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0" style={{ color: ORANGE }} />
        <div>
          <p className="font-semibold text-sm" style={{ color: '#F2F2F2' }}>
            No tienes un restaurante asignado
          </p>
          <p className="text-xs mt-1" style={{ color: '#A6A6A6' }}>
            {error || 'Contacta al administrador para que te asigne un restaurante.'}
          </p>
        </div>
      </div>
    );
  }

  return children;
};

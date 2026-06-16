import { Navigate } from 'react-router-dom';
import { useAuthStore, ROLES } from '../../features/auth/store/authStore.js';
import { Spinner } from '../../features/auth/components/Spinner.jsx';

const roleHome = {
  [ROLES.ADMIN]:   '/dashboard/stats',
  [ROLES.MANAGER]: '/dashboard/monitor',
  [ROLES.CLIENT]:  '/dashboard/explore',
};

export const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth);
  const user = useAuthStore((s) => s.user);

  if (isLoadingAuth) return <Spinner />;
  if (isAuthenticated && user?.role) {
    return <Navigate to={roleHome[user.role] ?? '/dashboard'} replace />;
  }

  return children;
};

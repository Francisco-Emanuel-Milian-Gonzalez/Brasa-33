import { Navigate } from 'react-router-dom';
import { useAuthStore, ROLES } from '../../features/auth/store/authStore';

const roleHome = {
  [ROLES.ADMIN]:   '/dashboard/stats',
  [ROLES.MANAGER]: '/dashboard/monitor',
  [ROLES.CLIENT]:  '/dashboard/explore',
};

export const RoleGuard = ({ children, allowedRoles = [] }) => {
  const user            = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const hasAccess = isAuthenticated && allowedRoles.includes(user?.role);

  if (!hasAccess) {
    // If user is logged in but wrong role, send to their own home
    if (isAuthenticated && user?.role) {
      return <Navigate to={roleHome[user.role] ?? '/'} replace />;
    }
    return <Navigate to='/' replace />;
  }

  return children;
};

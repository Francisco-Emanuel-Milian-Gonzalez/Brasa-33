// client-user/src/navigation/AppNavigator.jsx
import { useEffect } from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { LoadingSpinner } from '../shared/components/common/Common';
import { COLORS } from '../shared/constants/theme';
import { isMobileAllowedRole, ROLES } from '../shared/constants/roles';
import { useAuthStore } from '../shared/store/authStore';
import { useManagerStore } from '../features/manager/store/useManagerStore';
import AuthStack from './AuthStack';
import ClientTabs from './ClientTabs';
import ManagerTabs from './ManagerTabs';

const BrasaTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.accent,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    notification: COLORS.accent,
  },
};

/**
 * Navegador raíz: espera la hidratación del store y decide entre
 * las tabs principales (autenticado) y el stack de autenticación.
 */
export default function AppNavigator() {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clearRestaurant = useManagerStore((state) => state.clearRestaurant);

  useEffect(() => {
    if (!hasHydrated) return;
    const role = user?.role;
    if (isAuthenticated && role && !isMobileAllowedRole(role)) {
      clearRestaurant();
      logout();
    }
  }, [hasHydrated, isAuthenticated, user?.role, logout, clearRestaurant]);

  if (!hasHydrated) {
    return <LoadingSpinner message="Iniciando aplicación..." />;
  }

  const role = user?.role;
  const showManager = isAuthenticated && role === ROLES.MANAGER;
  const showClient = isAuthenticated && role === ROLES.CLIENT;

  return (
    <NavigationContainer theme={BrasaTheme}>
      {showManager ? <ManagerTabs /> : showClient ? <ClientTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

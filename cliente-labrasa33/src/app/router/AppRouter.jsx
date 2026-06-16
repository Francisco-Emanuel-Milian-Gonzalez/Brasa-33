import { Routes, Route } from 'react-router-dom';
import { LandingPage }       from '../../features/landing/pages/LandingPage.jsx';
import { AuthPage }          from '../../features/auth/pages/AuthPage.jsx';
import { PublicRoute }       from './PublicRoute.jsx';
import { VerifyEmailPage }   from '../../features/auth/pages/VerifyEmailPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { ProtecterRoute }    from './ProtecterRoute.jsx';
import { RoleGuard }         from './RoleGuard.jsx';
import { DashboardPage }     from '../layouts/DashboardPage.jsx';
import { ROLES }             from '../../features/auth/store/authStore.js';

// ── Admin
import { Restaurants }       from '../../features/restaurants/components/Restaurants.jsx';
import { Orders }            from '../../features/orders/components/Orders.jsx';
import { Users }             from '../../features/users/components/Users.jsx';
import { StatsDashboard }    from '../../features/admin/components/StatsDashboard.jsx';
import { PromotionsManager } from '../../features/admin/components/PromotionsManager.jsx';
import { ReportsPage }       from '../../features/admin/components/ReportsPage.jsx';

// ── Manager
import { TablesGrid }           from '../../features/manager/components/TablesGrid.jsx';
import { MenuManager }          from '../../features/manager/components/MenuManager.jsx';
import { ManagerOrdersMonitor } from '../../features/manager/components/ManagerOrdersMonitor.jsx';
import { ManagerReservations }  from '../../features/manager/components/ManagerReservations.jsx';
import { ManagerPromotions }    from '../../features/manager/components/ManagerPromotions.jsx';

// ── Client
import { RestaurantSearch } from '../../features/client/components/RestaurantSearch.jsx';
import { RestaurantMenuPage } from '../../features/client/pages/RestaurantMenuPage.jsx';
import { ReservationForm }  from '../../features/client/components/ReservationForm.jsx';
import { OrderHistory }     from '../../features/client/components/OrderHistory.jsx';
import { ProfilePage }      from '../../features/client/pages/ProfilePage.jsx';
import { InventoryManager } from '../../features/manager/components/InventoryManager.jsx';
import { ManagerRestaurantGuard } from '../../features/manager/components/ManagerRestaurantGuard.jsx';

const ALL_ROLES = Object.values(ROLES);

export const AppRouter = () => (
  <Routes>
    {/* PUBLIC */}
    <Route path='/' element={<PublicRoute><LandingPage /></PublicRoute>} />
    <Route path='/login' element={<PublicRoute><AuthPage initialMode='login' /></PublicRoute>} />
    <Route path='/register' element={<PublicRoute><AuthPage initialMode='register' /></PublicRoute>} />
    <Route path='/verify-email'   element={<VerifyEmailPage />} />
    <Route path='/reset-password' element={<ResetPasswordPage />} />

    {/* DASHBOARD — all authenticated roles */}
    <Route
      path='/dashboard/*'
      element={
        <ProtecterRoute>
          <RoleGuard allowedRoles={ALL_ROLES}>
            <DashboardPage />
          </RoleGuard>
        </ProtecterRoute>
      }
    >
      {/* ── ADMIN routes ──────────────────────────────────── */}
      <Route index element={
        <RoleGuard allowedRoles={[ROLES.ADMIN]}>
          <StatsDashboard />
        </RoleGuard>
      } />
      <Route path='stats' element={
        <RoleGuard allowedRoles={[ROLES.ADMIN]}>
          <StatsDashboard />
        </RoleGuard>
      } />
      <Route path='restaurants' element={
        <RoleGuard allowedRoles={[ROLES.ADMIN]}>
          <Restaurants />
        </RoleGuard>
      } />
      <Route path='orders' element={
        <RoleGuard allowedRoles={[ROLES.ADMIN]}>
          <Orders />
        </RoleGuard>
      } />
      <Route path='users' element={
        <RoleGuard allowedRoles={[ROLES.ADMIN]}>
          <Users />
        </RoleGuard>
      } />
      <Route path='promotions' element={
        <RoleGuard allowedRoles={[ROLES.ADMIN]}>
          <PromotionsManager />
        </RoleGuard>
      } />
      <Route path='reports' element={
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
          <ReportsPage />
        </RoleGuard>
      } />

      {/* ── MANAGER routes ────────────────────────────────── */}
      <Route path='tables' element={
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
          <ManagerRestaurantGuard><TablesGrid /></ManagerRestaurantGuard>
        </RoleGuard>
      } />
      <Route path='menu' element={
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
          <ManagerRestaurantGuard><MenuManager /></ManagerRestaurantGuard>
        </RoleGuard>
      } />
      <Route path='monitor' element={
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
          <ManagerRestaurantGuard><ManagerOrdersMonitor /></ManagerRestaurantGuard>
        </RoleGuard>
      } />
      <Route path='manager-reservations' element={
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
          <ManagerRestaurantGuard><ManagerReservations /></ManagerRestaurantGuard>
        </RoleGuard>
      } />
      <Route path='manager-promotions' element={
        <RoleGuard allowedRoles={[ROLES.MANAGER]}>
          <ManagerRestaurantGuard><ManagerPromotions /></ManagerRestaurantGuard>
        </RoleGuard>
      } />
      <Route path='inventory' element={
        <RoleGuard allowedRoles={[ROLES.MANAGER]}>
          <ManagerRestaurantGuard><InventoryManager /></ManagerRestaurantGuard>
        </RoleGuard>
      } />

      {/* ── CLIENT routes ─────────────────────────────────── */}
      <Route path='explore' element={
        <RoleGuard allowedRoles={[ROLES.CLIENT, ROLES.ADMIN]}>
          <RestaurantSearch />
        </RoleGuard>
      } />
      <Route path='restaurant/:id/menu' element={
        <RoleGuard allowedRoles={[ROLES.CLIENT, ROLES.ADMIN]}>
          <RestaurantMenuPage />
        </RoleGuard>
      } />
      <Route path='reservations' element={
        <RoleGuard allowedRoles={[ROLES.CLIENT, ROLES.ADMIN]}>
          <ReservationForm />
        </RoleGuard>
      } />
      <Route path='history' element={
        <RoleGuard allowedRoles={[ROLES.CLIENT, ROLES.ADMIN]}>
          <OrderHistory />
        </RoleGuard>
      } />
      <Route path='profile' element={
        <RoleGuard allowedRoles={[ROLES.CLIENT, ROLES.ADMIN, ROLES.MANAGER]}>
          <ProfilePage />
        </RoleGuard>
      } />
    </Route>
  </Routes>
);

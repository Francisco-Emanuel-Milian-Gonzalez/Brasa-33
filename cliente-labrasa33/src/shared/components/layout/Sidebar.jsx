import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, ROLES } from '../../../features/auth/store/authStore.js';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  ArrowLeftOnRectangleIcon,
  TableCellsIcon,
  Bars3BottomLeftIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  TagIcon,
  ReceiptPercentIcon,
  SparklesIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

const navByRole = {
  [ROLES.ADMIN]: [
    { label: 'Panel general',   to: '/dashboard/stats',        icon: ChartBarIcon },
    { label: 'Restaurantes',    to: '/dashboard/restaurants',  icon: BuildingStorefrontIcon },
    { label: 'Pedidos',         to: '/dashboard/orders',       icon: ClipboardDocumentListIcon },
    { label: 'Promociones',     to: '/dashboard/promotions',   icon: TagIcon },
    { label: 'Usuarios',        to: '/dashboard/users',        icon: UsersIcon },
    { label: 'Reportes',        to: '/dashboard/reports',      icon: DocumentChartBarIcon },
  ],
  [ROLES.MANAGER]: [
    { label: 'Monitor pedidos', to: '/dashboard/monitor',               icon: ClockIcon },
    { label: 'Mesas',           to: '/dashboard/tables',                icon: TableCellsIcon },
    { label: 'Menú',            to: '/dashboard/menu',                  icon: Bars3BottomLeftIcon },
    { label: 'Inventario',      to: '/dashboard/inventory',             icon: ArchiveBoxIcon },
    { label: 'Reservaciones',   to: '/dashboard/manager-reservations',  icon: CalendarIcon },
    { label: 'Mis Promociones', to: '/dashboard/manager-promotions',    icon: SparklesIcon },
    { label: 'Reportes',        to: '/dashboard/reports',               icon: DocumentChartBarIcon },
    { label: 'Facturación',     to: '/dashboard/monitor',               icon: ReceiptPercentIcon },
  ],
  [ROLES.CLIENT]: [
    { label: 'Restaurantes',    to: '/dashboard/explore',      icon: MagnifyingGlassIcon },
    { label: 'Mis reservas',    to: '/dashboard/reservations', icon: CalendarIcon },
    { label: 'Mis pedidos',     to: '/dashboard/history',      icon: ClipboardDocumentListIcon },
  ],
};

const roleLabelMap = {
  [ROLES.ADMIN]:   'Administrador',
  [ROLES.MANAGER]: 'Gerente',
  [ROLES.CLIENT]:  'Cliente',
};

export const Sidebar = () => {
  const user     = useAuthStore((state) => state.user);
  const logout   = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const role      = user?.role ?? ROLES.CLIENT;
  const navItems  = navByRole[role] ?? navByRole[ROLES.CLIENT];
  const roleLabel = roleLabelMap[role] ?? 'Usuario';

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <aside
      className="w-[var(--sidebar-w)] min-h-screen border-r border-[var(--border)] px-5 py-6 flex flex-col justify-between"
      style={{ background: '#111111' }}
    >
      {/* TOP */}
      <div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label + item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 border ${
                    isActive
                      ? 'border-[rgba(225,117,34,0.35)] text-white'
                      : 'text-gray-400 border-transparent hover:bg-[rgba(255,255,255,0.04)] hover:text-white'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: 'rgba(225,117,34,0.12)', color: '#fff' }
                    : {}
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" style={{ color: 'inherit' }} />
                <span>{item.label}</span>
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full opacity-0 group-[.active]:opacity-100"
                  style={{ background: 'var(--orange)' }}
                />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM — user info + logout */}
      <div className="space-y-3">
        {user && (
          <div
            className="rounded-2xl border px-4 py-3 text-xs"
            style={{
              background: 'rgba(225,117,34,0.07)',
              borderColor: 'rgba(225,117,34,0.20)',
              color: 'var(--text)',
            }}
          >
            <p className="font-semibold text-white truncate">
              {user.fullName || user.username || user.email}
            </p>
            <p style={{ color: 'var(--orange)' }}>{roleLabel}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

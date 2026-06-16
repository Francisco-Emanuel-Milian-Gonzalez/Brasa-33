import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DocumentArrowDownIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import {
  getReportRevenue,
  getReportSalesByDate,
  getReportTopProducts,
  getReportOrdersByStatus,
  getReportReservations,
  getReportTopCustomers,
} from '../../../shared/api/manager.js';
import { exportReportPDF, exportReportExcel } from '../../../shared/utils/exportReport.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useManagerStore } from '../../manager/store/useManagerStore.js';
import { showError } from '../../../shared/utils/toast.js';
import { formatPrice } from '../../../shared/utils/formatter.js';

const ORANGE = '#E17522';
const COLORS = ['#E17522', '#60a5fa', '#34d399', '#f59e0b', '#a78bfa', '#ef4444'];

const Card = ({ title, children, span = 1 }) => (
  <div
    className={`rounded-2xl border p-5 ${span === 2 ? 'col-span-1 lg:col-span-2' : ''}`}
    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
  >
    <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-h)' }}>
      {title}
    </h3>
    {children}
  </div>
);

const KPI = ({ label, value, sub }) => (
  <div
    className="rounded-2xl border p-5 flex flex-col gap-1"
    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
  >
    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
    <p className="text-2xl font-bold" style={{ color: ORANGE }}>{value}</p>
    {sub && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
  </div>
);

const Spinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="h-8 w-8 rounded-full border-2 animate-spin"
      style={{ borderColor: `${ORANGE} transparent` }} />
  </div>
);

export const ReportsPage = () => {
  const user = useAuthStore((s) => s.user);
  const { myRestaurant, fetchMyRestaurant } = useManagerStore();
  const isManager = user?.role === 'MANAGER_ROLE';

  const [revenue,      setRevenue]      = useState(null);
  const [salesByDate,  setSalesByDate]  = useState([]);
  const [topProducts,  setTopProducts]  = useState([]);
  const [orderStatus,  setOrderStatus]  = useState([]);
  const [reservations, setReservations] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (isManager) fetchMyRestaurant();
  }, [isManager, fetchMyRestaurant]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const params = isManager && myRestaurant?.id
        ? { restaurant_id: myRestaurant.id }
        : {};

      try {
        const results = await Promise.allSettled([
          getReportRevenue(params),
          getReportSalesByDate(params),
          getReportTopProducts(params),
          getReportOrdersByStatus(params),
          getReportReservations(params),
          ...(isManager && myRestaurant?.id ? [getReportTopCustomers(params)] : []),
        ]);

        if (results[0].status === 'fulfilled') setRevenue(results[0].value?.data ?? results[0].value);
        if (results[1].status === 'fulfilled') setSalesByDate(results[1].value?.data ?? results[1].value ?? []);
        if (results[2].status === 'fulfilled') setTopProducts(results[2].value?.data ?? results[2].value ?? []);
        if (results[3].status === 'fulfilled') setOrderStatus(results[3].value?.data ?? results[3].value ?? []);
        if (results[4].status === 'fulfilled') setReservations(results[4].value?.data ?? results[4].value);
        if (results[5]?.status === 'fulfilled') setTopCustomers(results[5].value?.data ?? results[5].value ?? []);
      } catch {
        showError('Error al cargar reportes');
      } finally {
        setLoading(false);
      }
    };

    if (isManager && !myRestaurant?.id) return;
    load();
  }, [isManager, myRestaurant?.id]);

  const resSummary = reservations?.summary ?? reservations;

  return (
    <div className="p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>Reportes</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {isManager && myRestaurant?.name
            ? `Métricas de ${myRestaurant.name}`
            : 'Métricas globales de ventas, pedidos y reservaciones'}
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KPI
              label="Ingresos Totales"
              value={formatPrice(revenue?.total_revenue ?? revenue?.totalRevenue)}
            />
            <KPI
              label="Total Pedidos"
              value={revenue?.total_orders ?? revenue?.totalOrders ?? '—'}
            />
            <KPI
              label="Ticket Promedio"
              value={formatPrice(revenue?.average_order ?? revenue?.averageOrder)}
            />
            <KPI
              label="Total Reservaciones"
              value={resSummary?.total ?? resSummary?.totalReservations ?? '—'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <Card title="Ventas por Fecha" span={2}>
              {salesByDate.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  Sin datos disponibles
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={salesByDate}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="date" tick={{ fill: '#A6A6A6', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#A6A6A6', fontSize: 11 }}
                      tickFormatter={v => `Q${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: '#1A1A1A', borderColor: '#333', color: '#F2F2F2' }}
                      formatter={v => [formatPrice(v), 'Ventas']} />
                    <Line type="monotone" dataKey="daily_revenue" stroke={ORANGE}
                      strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card title="Productos Más Vendidos">
              {topProducts.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  Sin datos disponibles
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topProducts.slice(0, 8)}
                    margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" tick={{ fill: '#A6A6A6', fontSize: 10 }}
                      angle={-30} textAnchor="end" interval={0} />
                    <YAxis tick={{ fill: '#A6A6A6', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1A1A1A', borderColor: '#333', color: '#F2F2F2' }} />
                    <Bar dataKey="total_sold" name="Vendidos" fill={ORANGE} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card title="Pedidos por Estado">
              {orderStatus.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  Sin datos disponibles
                </p>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie data={orderStatus} dataKey="count" nameKey="status"
                        cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                        {orderStatus.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1A1A1A', borderColor: '#333', color: '#F2F2F2' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {orderStatus.map((s, i) => (
                      <div key={s.status} className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ background: COLORS[i % COLORS.length] }} />
                          <span style={{ color: 'var(--text-muted)' }} className="capitalize">
                            {s.status}
                          </span>
                        </div>
                        <span className="font-semibold" style={{ color: 'var(--text-h)' }}>
                          {s.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

          </div>

          {isManager && (
            <Card title="Clientes frecuentes" span={2}>
              {topCustomers.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>Sin datos de clientes</p>
              ) : (
                <div className="space-y-2">
                  {topCustomers.map((c, i) => (
                    <div key={c.user_id} className="flex justify-between items-center text-sm py-2 border-b" style={{ borderColor: '#2a2a2a' }}>
                      <span style={{ color: 'var(--text-h)' }}>
                        #{i + 1} {c.username || c.email || c.user_id}
                      </span>
                      <span style={{ color: '#A6A6A6' }}>
                        {c.total_orders} pedidos · {formatPrice(c.total_spent)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {resSummary && (
            <Card title="Resumen de Reservaciones">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  ['Total',       resSummary.total ?? resSummary.totalReservations],
                  ['Pendientes',  resSummary.pending ?? resSummary.totalPending],
                  ['Completadas', resSummary.completed ?? resSummary.totalCompleted],
                  ['Canceladas',  resSummary.cancelled ?? resSummary.totalCancelled],
                ].map(([label, val]) => (
                  <div key={label} className="text-center">
                    <p className="text-xl font-bold" style={{ color: ORANGE }}>{val ?? '—'}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

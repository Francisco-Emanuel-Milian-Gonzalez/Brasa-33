import { useEffect } from 'react';
import { useAdminStore } from '../store/useAdminStore.js';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

import { formatPrice } from '../../../shared/utils/formatter.js';

/* ── helpers ──────────────────────────────────────────────── */
const fmt = (n) =>
  Number(n || 0).toLocaleString('es-GT', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtCOP = (n) => formatPrice(n);

const ORANGE = '#E17522';
const ORANGE_DIM = '#d0651a';
const COLORS = ['#E17522', '#F5A623', '#F5C842', '#F2F2F2', '#6B6B6B'];

/* ── StatCard ─────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, accent }) => (
  <div
    className="rounded-2xl p-5 border"
    style={{
      background: accent ? 'rgba(225,117,34,0.10)' : 'var(--bg-card)',
      borderColor: accent ? 'rgba(225,117,34,0.30)' : 'var(--border)',
    }}
  >
    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
      {label}
    </p>
    <p
      className="text-3xl font-bold"
      style={{ color: accent ? ORANGE : 'var(--text-h)' }}
    >
      {value}
    </p>
    {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
  </div>
);

/* ── Section header ───────────────────────────────────────── */
const SectionTitle = ({ children }) => (
  <h2
    className="text-base font-semibold mb-4"
    style={{ color: 'var(--text-h)', borderLeft: `3px solid ${ORANGE}`, paddingLeft: 10 }}
  >
    {children}
  </h2>
);

/* ── custom tooltip ───────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm border"
      style={{ background: '#1A1A1A', borderColor: '#333' }}
    >
      <p style={{ color: '#aaa' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? fmtCOP(p.value) : fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

/* ── main component ───────────────────────────────────────── */
export const StatsDashboard = () => {
  const { stats, loading, fetchStats } = useAdminStore();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading && !stats)
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="h-10 w-10 rounded-full border-2 animate-spin"
          style={{ borderColor: `${ORANGE} transparent ${ORANGE} transparent` }}
        />
      </div>
    );

  if (!stats)
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
        No se pudo cargar el panel
      </div>
    );

  const { summary, top_restaurants, orders_by_status, revenue_last_30_days, revenue_by_restaurant } = stats;

  /* recharts data */
  const revenueData = (revenue_last_30_days || [])
    .slice(0, 14)
    .reverse()
    .map(d => ({ fecha: d.date?.slice(5), ingresos: Number(d.revenue || 0) }));

  const topRestData = (top_restaurants || []).slice(0, 6).map(r => ({
    name: r.name?.slice(0, 12),
    ingresos: Number(r.revenue || 0),
  }));

  const statusData = (orders_by_status || []).map(s => ({
    name: s.status,
    value: Number(s.count),
  }));

  return (
    <div className="p-6 space-y-8" style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>
          Panel estadístico
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Resumen global de la plataforma La 33
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Ingresos totales"
          value={fmtCOP(summary?.total_revenue)}
          accent
        />
        <StatCard
          label="Restaurantes activos"
          value={fmt(summary?.restaurants?.active)}
          sub={`de ${fmt(summary?.restaurants?.total)} registrados`}
        />
        <StatCard
          label="Pedidos totales"
          value={fmt(summary?.orders?.total)}
          sub={`${fmt(summary?.orders?.completed)} completados`}
        />
        <StatCard
          label="Calificación promedio"
          value={summary?.reviews?.average_rating ?? '—'}
          sub={`${fmt(summary?.reviews?.total)} reseñas`}
        />
      </div>

      {/* REVENUE CHART */}
      <div
        className="rounded-2xl p-6 border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <SectionTitle>Ingresos últimos 14 días</SectionTitle>
        {revenueData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ORANGE} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="fecha" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `Q${(v/1000).toFixed(0)}k`} tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke={ORANGE} strokeWidth={2} fill="url(#colorIngresos)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* TOP RESTAURANTS + STATUS PIE */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Top restaurantes */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <SectionTitle>Top restaurantes por ingresos</SectionTitle>
          {topRestData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topRestData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `Q${(v/1000).toFixed(0)}k`} tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#aaa', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ingresos" name="Ingresos" fill={ORANGE} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pedidos por estado */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <SectionTitle>Pedidos por estado</SectionTitle>
          {statusData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>Sin datos</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-2 text-sm flex-1">
                {statusData.map((s, i) => (
                  <li key={s.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span style={{ color: '#aaa', textTransform: 'capitalize' }}>{s.name}</span>
                    <span className="ml-auto font-semibold" style={{ color: 'var(--text-h)' }}>
                      {fmt(s.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ORDERS SUMMARY */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Reservaciones" value={fmt(summary?.reservations?.total)} sub={`${fmt(summary?.reservations?.confirmed)} confirmadas`} />
        <StatCard label="Canceladas" value={fmt(summary?.orders?.cancelled)} />
        <StatCard label="Pendientes" value={fmt(summary?.orders?.pending)} />
      </div>

    </div>
  );
};

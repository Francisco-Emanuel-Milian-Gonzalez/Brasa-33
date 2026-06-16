import { useEffect, useState } from 'react';
import { useAdminStore } from '../store/useAdminStore.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

const ORANGE = '#E17522';

const statusStyles = {
  pending:  { label: 'Pendiente',  bg: 'rgba(225,117,34,0.12)', color: ORANGE },
  approved: { label: 'Aprobada',   bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
  rejected: { label: 'Rechazada',  bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
  active:   { label: 'Activa',     bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  expired:  { label: 'Vencida',    bg: 'rgba(100,100,100,0.12)',color: '#666' },
};

const Badge = ({ status }) => {
  const s = statusStyles[status] || statusStyles.pending;
  return (
    <span
      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

export const PromotionsManager = () => {
  const { promotions, loading, fetchAllPromotions, approvePromotion, rejectPromotion } = useAdminStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchAllPromotions(); }, [fetchAllPromotions]);

  const handleApprove = async (id) => {
    await approvePromotion(id);
    showSuccess('Promoción aprobada');
  };

  const handleReject = async (id) => {
    await rejectPromotion(id);
    showError('Promoción rechazada');
  };

  const filtered = filter === 'all'
    ? promotions
    : promotions.filter(p => p.status === filter);

  return (
    <div className="p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>
            Promociones
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Valida y gestiona las publicaciones de los restaurantes
          </p>
        </div>

        {/* FILTER */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected', 'active'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={
                filter === f
                  ? { background: ORANGE, color: '#fff', borderColor: ORANGE }
                  : { background: 'var(--bg-card)', color: 'var(--text)', borderColor: 'var(--border)' }
              }
            >
              {f === 'all' ? 'Todas' : statusStyles[f]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      {loading && promotions.length === 0 ? (
        <div className="flex justify-center py-16">
          <div
            className="h-10 w-10 rounded-full border-2 animate-spin"
            style={{ borderColor: `${ORANGE} transparent ${ORANGE} transparent` }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <TagIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
          No hay promociones en este estado
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(promo => (
            <div
              key={promo.id}
              className="rounded-2xl border p-5 flex flex-col gap-3 transition hover:border-[rgba(225,117,34,0.30)]"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              {/* top */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-h)' }}>
                    {promo.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {promo.restaurant_name}
                  </p>
                </div>
                <Badge status={promo.status} />
              </div>

              {/* description */}
              {promo.description && (
                <p className="text-xs line-clamp-2" style={{ color: 'var(--text)' }}>
                  {promo.description}
                </p>
              )}

              {/* meta */}
              <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                {promo.discount_percent && (
                  <span style={{ color: ORANGE, fontWeight: 600 }}>
                    {promo.discount_percent}% dto.
                  </span>
                )}
                {promo.start_date && (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {promo.start_date} → {promo.end_date || '∞'}
                  </span>
                )}
              </div>

              {/* actions */}
              {promo.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleApprove(promo.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition"
                    style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
                  >
                    <CheckCircleIcon className="h-4 w-4" /> Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(promo.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
                  >
                    <XCircleIcon className="h-4 w-4" /> Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

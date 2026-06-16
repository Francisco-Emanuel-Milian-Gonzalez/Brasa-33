import { useEffect, useRef, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useManagerStore } from '../store/useManagerStore.js';
import {
  getReservationsByRestaurant,
  completeReservation,
  cancelReservationManager,
  updateReservationManager,
} from '../../../shared/api/manager.js';
import { showError, showSuccess } from '../../../shared/utils/toast.js';
import { formatDate } from '../../../shared/utils/formatter.js';

const POLL_MS = 25000;

const STATUS_STYLES = {
  pending:   { bg: 'rgba(245,166,35,0.15)',  color: '#F5A623' },
  confirmed: { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  completed: { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
  cancelled: { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
};

const statusStyle = (s) => STATUS_STYLES[s] ?? { bg: 'rgba(255,255,255,0.06)', color: '#A6A6A6' };

const TYPE_LABELS = { table: 'Mesa', delivery: 'Domicilio', takeaway: 'Para llevar' };

/* ── EditModal ──────────────────────────────────────────────── */
const EditModal = ({ reservation, onClose, onSave }) => {
  const [form, setForm] = useState({
    reservation_date: reservation.reservation_date?.slice(0, 10) ?? '',
    reservation_time: reservation.reservation_time ?? '',
    party_size:       reservation.party_size ?? 1,
    notes:            reservation.notes ?? '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(reservation.id, form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full px-3 py-2 rounded-lg text-sm outline-none';
  const inpStyle = { background: '#2a2a2a', color: '#F2F2F2', border: '1px solid #444' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-md rounded-2xl border p-6 space-y-4" style={{ background: '#1A1A1A', borderColor: '#333' }}>
        <h3 className="font-bold text-base" style={{ color: '#F2F2F2' }}>
          Editar Reservación #{reservation.id}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: '#A6A6A6' }}>Fecha</label>
            <input type="date" className={inp} style={inpStyle}
              value={form.reservation_date}
              onChange={e => setForm(f => ({ ...f, reservation_date: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: '#A6A6A6' }}>Hora</label>
            <input type="time" className={inp} style={inpStyle}
              value={form.reservation_time}
              onChange={e => setForm(f => ({ ...f, reservation_time: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: '#A6A6A6' }}>Personas</label>
          <input type="number" min={1} className={inp} style={inpStyle}
            value={form.party_size}
            onChange={e => setForm(f => ({ ...f, party_size: Number(e.target.value) }))} />
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: '#A6A6A6' }}>Notas</label>
          <textarea rows={2} className={inp} style={inpStyle}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm"
            style={{ background: '#2a2a2a', color: '#A6A6A6' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ background: '#E17522', color: '#fff' }}>
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── ReservationCard ────────────────────────────────────────── */
const ReservationCard = ({ res, onComplete, onCancel, onEdit }) => {
  const st = statusStyle(res.status);
  const isActionable = !['completed', 'cancelled'].includes(res.status);

  return (
    <div className="rounded-2xl border p-5 space-y-3 transition"
         style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>
            Reservación #{res.id}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {formatDate(res.reservation_date)} · {res.reservation_time}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={st}>
          {res.status}
        </span>
      </div>

      {/* details */}
      <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <p><span className="text-[var(--text-h)]">{res.party_size}</span> personas</p>
        <p>Tipo: <span className="text-[var(--text-h)]">{TYPE_LABELS[res.type] ?? res.type}</span></p>
        {res.table_id && <p>Mesa <span className="text-[var(--text-h)]">#{res.table_id}</span></p>}
        {res.notes && <p className="col-span-2 italic border-t pt-2 mt-1" style={{ borderColor: '#2a2a2a' }}>{res.notes}</p>}
      </div>

      {/* actions */}
      {isActionable && (
        <div className="flex gap-2 pt-1">
          <button onClick={() => onEdit(res)}
            className="flex-1 py-1.5 rounded-xl text-xs transition"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#A6A6A6' }}>
            Editar
          </button>
          <button onClick={() => onComplete(res.id)}
            className="flex-1 py-1.5 rounded-xl text-xs font-semibold transition"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
            Completar
          </button>
          <button onClick={() => onCancel(res.id)}
            className="flex-1 py-1.5 rounded-xl text-xs font-semibold transition"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Main ───────────────────────────────────────────────────── */
export const ManagerReservations = () => {
  const restaurantId = useManagerStore((s) => s.restaurantId);

  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editTarget,   setEditTarget]   = useState(null);
  const intervalRef = useRef(null);

  const fetch = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const res = await getReservationsByRestaurant(restaurantId);
      setReservations(res.data ?? res ?? []);
    } catch {
      showError('Error al cargar reservaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    intervalRef.current = setInterval(fetch, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [restaurantId]);

  const handleComplete = async (id) => {
    try {
      await completeReservation(id);
      setReservations(rs => rs.map(r => r.id === id ? { ...r, status: 'completed' } : r));
      showSuccess('Reservación completada');
    } catch {
      showError('Error al completar la reservación');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('¿Cancelar esta reservación?')) return;
    try {
      await cancelReservationManager(id);
      setReservations(rs => rs.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
      showSuccess('Reservación cancelada');
    } catch {
      showError('Error al cancelar la reservación');
    }
  };

  const handleEdit = async (id, data) => {
    try {
      const res = await updateReservationManager(id, data);
      setReservations(rs => rs.map(r => r.id === id ? (res.data ?? res) : r));
      showSuccess('Reservación actualizada');
    } catch {
      showError('Error al actualizar la reservación');
    }
  };

  const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
  const filtered = statusFilter === 'all'
    ? reservations
    : reservations.filter(r => r.status === statusFilter);

  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  return (
    <div className="p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>
              Reservaciones
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse"
                style={{ background: 'rgba(245,166,35,0.15)', color: '#F5A623' }}>
                {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Actualización cada {POLL_MS / 1000}s
          </p>
        </div>
        <button
          type="button"
          onClick={fetch}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition"
          style={{ background: 'var(--bg-card)', color: '#A6A6A6', border: '1px solid var(--border)' }}
        >
          <ArrowPathIcon className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map(tab => (
          <button key={tab}
            onClick={() => setStatusFilter(tab)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition"
            style={{
              background: statusFilter === tab ? '#E17522' : 'var(--bg-card)',
              color:      statusFilter === tab ? '#fff' : '#A6A6A6',
              border:     `1px solid ${statusFilter === tab ? '#E17522' : 'var(--border)'}`,
            }}>
            {tab === 'all' ? `Todas (${reservations.length})` : `${tab} (${reservations.filter(r => r.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* GRID */}
      {!restaurantId ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          No se encontró el restaurante asignado a tu cuenta.
        </div>
      ) : loading && reservations.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 rounded-full border-2 animate-spin"
            style={{ borderColor: '#E17522 transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          No hay reservaciones en este estado
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(r => (
            <ReservationCard
              key={r.id}
              res={r}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onEdit={setEditTarget}
            />
          ))}
        </div>
      )}

      {editTarget && (
        <EditModal
          reservation={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useTablesStore } from '../store/useTablesStore.js';
import { useManagerStore } from '../store/useManagerStore.js';
import { useForm } from 'react-hook-form';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const ORANGE = '#E17522';

const STATUS_CONFIG = {
  available:   { label: 'Disponible',   bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', dot: '#22c55e' },
  occupied:    { label: 'Ocupada',      bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', dot: '#ef4444' },
  reserved:    { label: 'Reservada',    bg: 'rgba(225,117,34,0.12)', color: ORANGE,    dot: ORANGE },
  maintenance: { label: 'Mantenimiento',bg: 'rgba(100,100,100,0.12)',color: '#666',    dot: '#666' },
};

const isAvailableNow = (table) => {
  if (!table.available_from || !table.available_to) return true;
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const from = String(table.available_from).slice(0, 5);
  const to = String(table.available_to).slice(0, 5);
  return currentTime >= from && currentTime <= to;
};

const AvailabilityBadge = ({ table }) => {
  const ok = isAvailableNow(table);
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
        color: ok ? '#22c55e' : '#ef4444',
      }}
    >
      {ok ? 'Disponible ahora' : 'No disponible'}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  return (
    <span
      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

/* ── TableCard ──────────────────────────────────────────────── */
const TableCard = ({ table, onEdit, onDelete, onStatusChange }) => (
  <div
    className="rounded-2xl border p-5 flex flex-col gap-3 transition hover:border-[rgba(225,117,34,0.25)]"
    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
  >
    <div className="flex items-center justify-between">
      <div>
        <span className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>
          Mesa {table.number}
        </span>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {table.location || 'Sin ubicación'} · {table.capacity} pax
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusBadge status={table.status} />
        <AvailabilityBadge table={table} />
      </div>
    </div>

    {/* quick status selector */}
    <select
      value={table.status}
      onChange={e => onStatusChange(table.id, e.target.value)}
      className="input-dark text-xs"
    >
      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
        <option key={k} value={k}>{v.label}</option>
      ))}
    </select>

    <div className="flex gap-2 pt-1">
      <button
        onClick={() => onEdit(table)}
        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold border transition"
        style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--bg-hover)' }}
      >
        <PencilSquareIcon className="h-4 w-4" /> Editar
      </button>
      <button
        onClick={() => onDelete(table.id)}
        className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition"
        style={{ background: 'rgba(239,68,68,0.10)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.20)' }}
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  </div>
);

/* ── TableModal ─────────────────────────────────────────────── */
const TableModal = ({ isOpen, onClose, editTable }) => {
  const { createTable, updateTable } = useTablesStore();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (editTable) {
      reset({
        number: editTable.number,
        capacity: editTable.capacity,
        location: editTable.location,
        available_from: editTable.available_from?.slice?.(0, 5) || editTable.available_from || '',
        available_to: editTable.available_to?.slice?.(0, 5) || editTable.available_to || '',
      });
    } else {
      reset({ number: '', capacity: '', location: '', available_from: '', available_to: '' });
    }
  }, [editTable, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    const payload = {
      number: Number(data.number),
      capacity: Number(data.capacity),
      location: data.location,
      available_from: data.available_from || null,
      available_to: data.available_to || null,
    };
    if (editTable) await updateTable(editTable.id, payload);
    else await createTable(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl border p-6 space-y-5" style={{ background: '#1A1A1A', borderColor: '#333' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-h)' }}>
            {editTable ? 'Editar mesa' : 'Nueva mesa'}
          </h2>
          <button onClick={onClose}><XMarkIcon className="h-5 w-5" style={{ color: 'var(--text-muted)' }} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Número de mesa</label>
            <input type="number" className="input-dark" {...register('number', { required: true, min: 1 })} />
            {errors.number && <p className="text-red-500 text-xs mt-1">Campo requerido (mínimo 1)</p>}
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Capacidad (personas)</label>
            <input type="number" className="input-dark" {...register('capacity', { required: true, min: 1 })} />
            {errors.capacity && <p className="text-red-500 text-xs mt-1">Campo requerido (mínimo 1)</p>}
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Ubicación</label>
            <input type="text" placeholder="Terraza, salón principal..." className="input-dark" {...register('location')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Disponible desde</label>
              <input type="time" className="input-dark" {...register('available_from')} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Disponible hasta</label>
              <input type="time" className="input-dark" {...register('available_to')} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
              style={{ background: ORANGE, color: '#fff', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Guardando...' : editTable ? 'Guardar cambios' : 'Crear mesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── TablesGrid (main) ──────────────────────────────────────── */
export const TablesGrid = () => {
  const { tables, loading, fetchTables, setTableStatus, deleteTable } = useTablesStore();
  const restaurantId = useManagerStore((s) => s.restaurantId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTable, setEditTable] = useState(null);

  useEffect(() => {
    fetchTables(restaurantId);
    const interval = setInterval(() => fetchTables(restaurantId), 30000);
    return () => clearInterval(interval);
  }, [fetchTables, restaurantId]);

  const [statusFilter, setStatusFilter] = useState('all');

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  const KPI_OPTIONS = [
    { key: 'all',       label: 'Total',       value: stats.total,     color: '#F2F2F2' },
    { key: 'available', label: 'Disponibles', value: stats.available, color: '#22c55e' },
    { key: 'occupied',  label: 'Ocupadas',    value: stats.occupied,  color: '#ef4444' },
    { key: 'reserved',  label: 'Reservadas',  value: stats.reserved,  color: ORANGE },
  ];

  const filteredTables = statusFilter === 'all'
    ? tables
    : tables.filter(t => t.status === statusFilter);

  return (
    <div className="p-4 sm:p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>Mesas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Disponibilidad en tiempo real · actualiza cada 30s
          </p>
        </div>
        <button
          onClick={() => { setEditTable(null); setModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{ background: ORANGE, color: '#fff' }}
        >
          <PlusIcon className="h-4 w-4" /> Nueva mesa
        </button>
      </div>

      {/* KPIs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:overflow-visible">
        {KPI_OPTIONS.map(s => {
          const isActive = statusFilter === s.key;
          return (
            <button
              key={s.key}
              type="button"
              className={`status-kpi-btn rounded-2xl p-3 sm:p-4 text-center flex-shrink-0 min-w-[5.25rem] sm:min-w-0 ${isActive ? 'is-active' : ''}`}
              style={{ '--kpi-color': s.color }}
              onClick={() => setStatusFilter(isActive ? 'all' : s.key)}
            >
              <span className="status-kpi-count">{s.value}</span>
              <p className="status-kpi-label">{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* GRID */}
      {loading && tables.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 rounded-full border-2 animate-spin" style={{ borderColor: `${ORANGE} transparent` }} />
        </div>
      ) : tables.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          No hay mesas registradas. Crea la primera.
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          No hay mesas en este estado
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map(t => (
            <TableCard
              key={t.id}
              table={t}
              onEdit={tbl => { setEditTable(tbl); setModalOpen(true); }}
              onDelete={id => deleteTable(id)}
              onStatusChange={setTableStatus}
            />
          ))}
        </div>
      )}

      <TableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editTable={editTable}
      />
    </div>
  );
};

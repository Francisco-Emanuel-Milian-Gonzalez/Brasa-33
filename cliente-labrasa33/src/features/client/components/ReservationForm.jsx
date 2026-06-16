import { useEffect, useState } from 'react';
import { useClientStore } from '../store/useClientStore.js';
import { useForm } from 'react-hook-form';
import {
  CalendarIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  TableCellsIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const ORANGE = '#E17522';

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  color: ORANGE,     bg: 'rgba(225,117,34,0.12)',  Icon: ClockIcon },
  confirmed: { label: 'Confirmada', color: '#22c55e',  bg: 'rgba(34,197,94,0.10)',   Icon: CheckCircleSolid },
  cancelled: { label: 'Cancelada',  color: '#ef4444',  bg: 'rgba(239,68,68,0.10)',   Icon: XCircleIcon },
  completed: { label: 'Completada', color: '#3b82f6',  bg: 'rgba(59,130,246,0.10)',  Icon: CheckCircleIcon },
};

/* ── EditModal ──────────────────────────────────────────────── */
const EditModal = ({ reservation, onClose, onSave }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (reservation) {
      reset({
        reservation_date: (reservation.reservation_date ?? reservation.date)?.slice(0, 10),
        reservation_time: (reservation.reservation_time ?? reservation.time)?.slice(0, 5),
        party_size: reservation.party_size ?? reservation.people_count,
        notes: reservation.notes,
      });
    }
  }, [reservation, reset]);

  if (!reservation) return null;

  const onSubmit = async (data) => {
    await onSave(reservation.id, {
      date:         data.reservation_date,
      time:         data.reservation_time,
      people_count: Number(data.party_size),
      notes:        data.notes || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.80)' }}>
      <div
        className="w-full max-w-md rounded-2xl border p-6 space-y-5"
        style={{ background: '#1A1A1A', borderColor: '#2a2a2a' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PencilSquareIcon className="h-5 w-5" style={{ color: ORANGE }} />
            <h2 className="text-base font-bold" style={{ color: '#F2F2F2' }}>Editar reservación</h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center transition hover:bg-white/5"
          >
            <XMarkIcon className="h-5 w-5" style={{ color: '#666' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#A6A6A6' }}>
                <CalendarIcon className="h-3.5 w-3.5" /> Fecha
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#262626', color: '#F2F2F2', border: '1px solid #333' }}
                {...register('reservation_date', { required: true })}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#A6A6A6' }}>
                <ClockIcon className="h-3.5 w-3.5" /> Hora
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#262626', color: '#F2F2F2', border: '1px solid #333' }}
                {...register('reservation_time', { required: true })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#A6A6A6' }}>
              <UserGroupIcon className="h-3.5 w-3.5" /> Personas
            </label>
            <input
              type="number" min={1} max={30}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#262626', color: '#F2F2F2', border: '1px solid #333' }}
              {...register('party_size', { required: true })}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#A6A6A6' }}>
              <DocumentTextIcon className="h-3.5 w-3.5" /> Notas
            </label>
            <textarea
              rows={2}
              placeholder="Ej: mesa con vista..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: '#262626', color: '#F2F2F2', border: '1px solid #333' }}
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm border transition hover:bg-white/5"
              style={{ borderColor: '#333', color: '#A6A6A6' }}
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition"
              style={{ background: ORANGE, color: '#fff', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── ReservationForm (main) ─────────────────────────────────── */
export const ReservationForm = () => {
  const {
    restaurants, reservations, loading,
    fetchRestaurants, fetchReservations,
    makeReservation, modifyReservation, cancelReservation,
  } = useClientStore();

  const [tab, setTab] = useState('new');
  const [editingRes, setEditingRes] = useState(null);

  const {
    register, handleSubmit, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { party_size: 2 } });

  useEffect(() => {
    fetchRestaurants();
    fetchReservations();
  }, [fetchRestaurants, fetchReservations]);

  const onSubmit = async (data) => {
    const payload = {
      restaurant_id: Number(data.restaurant_id),
      date:          data.reservation_date,
      time:          data.reservation_time,
      people_count:  Number(data.party_size),
      type:          'table',
      notes:         data.notes || null,
    };
    const res = await makeReservation(payload);
    if (res.success) {
      reset({ party_size: 2 });
      setTab('my');
    }
  };

  return (
    <div className="p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* HEADER */}
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(225,117,34,0.12)' }}
        >
          <CalendarIcon className="h-5 w-5" style={{ color: ORANGE }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F2F2F2' }}>Reservaciones</h1>
          <p className="text-sm" style={{ color: '#A6A6A6' }}>
            Reserva una mesa en tu restaurante favorito
          </p>
        </div>
      </div>

      {/* TABS */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: '#1A1A1A', width: 'fit-content', border: '1px solid #2a2a2a' }}
      >
        {[
          { key: 'new', label: 'Nueva reservación', Icon: CalendarIcon },
          { key: 'my',  label: `Mis reservaciones (${reservations.length})`, Icon: DocumentTextIcon },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
            style={
              tab === t.key
                ? { background: ORANGE, color: '#fff' }
                : { color: '#A6A6A6' }
            }
          >
            <t.Icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── NEW FORM ── */}
      {tab === 'new' && (
        <div className="max-w-lg">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border p-6 space-y-5"
            style={{ background: '#1A1A1A', borderColor: '#2a2a2a' }}
          >

            {/* RESTAURANT */}
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#A6A6A6' }}>
                <BuildingStorefrontIcon className="h-3.5 w-3.5" /> Restaurante *
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#262626', color: '#F2F2F2', border: `1px solid ${errors.restaurant_id ? '#ef4444' : '#333'}` }}
                {...register('restaurant_id', { required: true })}
              >
                <option value="">Selecciona un restaurante</option>
                {restaurants.filter(r => r.is_active !== false).map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {errors.restaurant_id && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#ef4444' }}>
                  <ExclamationCircleIcon className="h-3.5 w-3.5" /> Selecciona un restaurante
                </p>
              )}
            </div>

            {/* DATE & TIME */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#A6A6A6' }}>
                  <CalendarIcon className="h-3.5 w-3.5" /> Fecha *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#262626', color: '#F2F2F2', border: `1px solid ${errors.reservation_date ? '#ef4444' : '#333'}` }}
                  {...register('reservation_date', { required: true })}
                />
                {errors.reservation_date && (
                  <p className="text-xs mt-1" style={{ color: '#ef4444' }}>Requerido</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#A6A6A6' }}>
                  <ClockIcon className="h-3.5 w-3.5" /> Hora *
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#262626', color: '#F2F2F2', border: `1px solid ${errors.reservation_time ? '#ef4444' : '#333'}` }}
                  {...register('reservation_time', { required: true })}
                />
                {errors.reservation_time && (
                  <p className="text-xs mt-1" style={{ color: '#ef4444' }}>Requerido</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#A6A6A6' }}>
                <UserGroupIcon className="h-3.5 w-3.5" /> Número de personas *
              </label>
              <input
                type="number" min={1} max={30}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#262626', color: '#F2F2F2', border: `1px solid ${errors.party_size ? '#ef4444' : '#333'}` }}
                {...register('party_size', { required: true, min: 1 })}
              />
            </div>

            {/* NOTES */}
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#A6A6A6' }}>
                <DocumentTextIcon className="h-3.5 w-3.5" /> Notas adicionales
              </label>
              <textarea
                rows={2}
                placeholder="Ej: mesa sin humo, cumpleaños..."
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ background: '#262626', color: '#F2F2F2', border: '1px solid #333' }}
                {...register('notes')}
              />
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className="w-full rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition"
              style={{ background: ORANGE, color: '#fff', opacity: isSubmitting ? 0.7 : 1 }}
            >
              <CalendarIcon className="h-4 w-4" />
              {isSubmitting ? 'Reservando...' : 'Crear reservación'}
            </button>
          </form>
        </div>
      )}

      {/* ── MY RESERVATIONS ── */}
      {tab === 'my' && (
        <div className="space-y-3 max-w-2xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <div
                className="h-9 w-9 rounded-full border-2 animate-spin"
                style={{ borderColor: `${ORANGE} transparent transparent transparent` }}
              />
            </div>
          ) : reservations.length === 0 ? (
            <div
              className="rounded-2xl border p-14 text-center space-y-3"
              style={{ borderColor: '#2a2a2a', background: '#1A1A1A' }}
            >
              <CalendarIcon className="h-10 w-10 mx-auto opacity-20" style={{ color: '#F2F2F2' }} />
              <p className="text-sm" style={{ color: '#666' }}>No tienes reservaciones aún</p>
              <button
                onClick={() => setTab('new')}
                className="text-sm font-semibold px-4 py-2 rounded-xl transition hover:opacity-80"
                style={{ background: 'rgba(225,117,34,0.12)', color: ORANGE }}
              >
                Crear primera reservación
              </button>
            </div>
          ) : (
            reservations.map(r => {
              const s = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
              const editable = !['cancelled', 'completed'].includes(r.status);
              const people = r.party_size ?? r.people_count ?? '—';

              return (
                <div
                  key={r.id}
                  className="rounded-2xl border p-6 transition"
                  style={{ background: '#1A1A1A', borderColor: '#2a2a2a' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4 min-w-0">

                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(225,117,34,0.10)' }}
                      >
                        <TableCellsIcon className="h-6 w-6" style={{ color: ORANGE }} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold" style={{ color: '#F2F2F2' }}>
                            Reservación de mesa
                          </span>
                          <span
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: s.bg, color: s.color }}
                          >
                            <s.Icon className="h-3 w-3" />
                            {s.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="flex items-center gap-1.5 text-sm" style={{ color: '#A6A6A6' }}>
                            <CalendarIcon className="h-4 w-4" />
                            {r.reservation_date ?? r.date}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm" style={{ color: '#A6A6A6' }}>
                            <ClockIcon className="h-4 w-4" />
                            {(r.reservation_time ?? r.time)?.slice(0, 5)}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm" style={{ color: '#A6A6A6' }}>
                            <UserGroupIcon className="h-4 w-4" />
                            {people} personas
                          </span>
                        </div>

                        {r.notes && (
                          <p className="text-sm mt-2" style={{ color: '#666' }}>{r.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {editable && (
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => setEditingRes(r)}
                          className="h-8 w-8 rounded-xl border flex items-center justify-center transition hover:bg-white/5"
                          style={{ borderColor: '#333' }}
                          title="Editar"
                        >
                          <PencilSquareIcon className="h-4 w-4" style={{ color: '#A6A6A6' }} />
                        </button>
                        <button
                          onClick={() => cancelReservation(r.id)}
                          className="h-8 w-8 rounded-xl flex items-center justify-center transition hover:bg-red-500/20"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}
                          title="Cancelar"
                        >
                          <TrashIcon className="h-4 w-4" style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <EditModal
        reservation={editingRes}
        onClose={() => setEditingRes(null)}
        onSave={modifyReservation}
      />
    </div>
  );
};
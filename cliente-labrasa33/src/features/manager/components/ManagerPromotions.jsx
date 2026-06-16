import { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useManagerStore } from '../store/useManagerStore.js';
import {
  getPromotionsByRestaurant,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../../../shared/api/manager.js';
import { showError, showSuccess } from '../../../shared/utils/toast.js';
import { formatDate } from '../../../shared/utils/formatter.js';

const ORANGE = '#E17522';

const STATUS_STYLE = {
  pending:  { bg: 'rgba(245,166,35,0.15)',  color: '#F5A623' },
  approved: { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
  rejected: { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
};
const statusStyle = (s) => STATUS_STYLE[s] ?? { bg: 'rgba(255,255,255,0.06)', color: '#A6A6A6' };

const EMPTY_FORM = {
  title: '', description: '', discount_percentage: '', start_date: '', end_date: '',
};

/* ── PromoModal ─────────────────────────────────────────────── */
const PromoModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial?.id;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return showError('El título es obligatorio');
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        discount_percent: form.discount_percentage ? Number(form.discount_percentage) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      if (isEdit) {
        await onSave('update', initial.id, payload);
      } else {
        await onSave('create', null, payload);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full px-3 py-2 rounded-lg text-sm outline-none';
  const inpStyle = { background: '#2a2a2a', color: '#F2F2F2', border: '1px solid #444' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-md rounded-2xl border p-6 space-y-4"
           style={{ background: '#1A1A1A', borderColor: '#333' }}>
        <h3 className="font-bold text-base" style={{ color: '#F2F2F2' }}>
          {isEdit ? 'Editar Promoción' : 'Nueva Promoción'}
        </h3>
        <p className="text-xs" style={{ color: '#A6A6A6' }}>
          Las promociones nuevas quedan en estado "pendiente" hasta que un administrador las apruebe.
        </p>

        <div>
          <label className="text-xs mb-1 block" style={{ color: '#A6A6A6' }}>Título *</label>
          <input className={inp} style={inpStyle} placeholder="Ej: 2×1 en pizzas"
            value={form.title} onChange={e => set('title', e.target.value)} />
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: '#A6A6A6' }}>Descripción</label>
          <textarea rows={2} className={inp} style={inpStyle}
            placeholder="Descripción de la promoción"
            value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: '#A6A6A6' }}>
            Descuento (%) — opcional
          </label>
          <input type="number" min={0} max={100} className={inp} style={inpStyle}
            placeholder="Ej: 20"
            value={form.discount_percentage}
            onChange={e => set('discount_percentage', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: '#A6A6A6' }}>Inicio</label>
            <input type="date" className={inp} style={inpStyle}
              value={form.start_date} onChange={e => set('start_date', e.target.value)} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: '#A6A6A6' }}>Fin</label>
            <input type="date" className={inp} style={inpStyle}
              value={form.end_date} onChange={e => set('end_date', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm"
            style={{ background: '#2a2a2a', color: '#A6A6A6' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ background: ORANGE, color: '#fff' }}>
            {loading ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── PromoCard ──────────────────────────────────────────────── */
const PromoCard = ({ promo, onEdit, onDelete }) => {
  const st = statusStyle(promo.status);
  return (
    <div className="rounded-2xl border p-5 space-y-3"
         style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm" style={{ color: 'var(--text-h)' }}>
          {promo.title}
        </p>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={st}>
          {promo.status}
        </span>
      </div>

      {promo.description && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{promo.description}</p>
      )}

      <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        {promo.discount_percentage > 0 && (
          <span className="font-semibold" style={{ color: ORANGE }}>
            {promo.discount_percentage}% dto.
          </span>
        )}
        {promo.start_date && <span>Desde {formatDate(promo.start_date)}</span>}
        {promo.end_date   && <span>Hasta {formatDate(promo.end_date)}</span>}
      </div>

      {promo.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <button onClick={() => onEdit(promo)}
            className="flex-1 py-1.5 rounded-xl text-xs transition"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#A6A6A6' }}>
            Editar
          </button>
          <button onClick={() => onDelete(promo.id)}
            className="flex-1 py-1.5 rounded-xl text-xs transition"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Main ───────────────────────────────────────────────────── */
export const ManagerPromotions = () => {
  const restaurantId = useManagerStore((s) => s.restaurantId);

  const [promotions, setPromotions] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [modal,      setModal]      = useState(null); // null | 'create' | promoObj

  const fetch = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await getPromotionsByRestaurant(restaurantId);
      setPromotions(res.data ?? res ?? []);
    } catch {
      showError('Error al cargar promociones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [restaurantId]);

  const handleSave = async (action, id, payload) => {
    try {
      if (action === 'create') {
        const res = await createPromotion(payload);
        setPromotions(p => [res.data ?? res, ...p]);
        showSuccess('Promoción creada — pendiente de aprobación');
      } else {
        const res = await updatePromotion(id, payload);
        setPromotions(p => p.map(pr => pr.id === id ? (res.data ?? res) : pr));
        showSuccess('Promoción actualizada');
      }
    } catch {
      showError('Error al guardar la promoción');
      throw new Error('save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta promoción?')) return;
    try {
      await deletePromotion(id);
      setPromotions(p => p.filter(pr => pr.id !== id));
      showSuccess('Promoción eliminada');
    } catch {
      showError('Error al eliminar');
    }
  };

  return (
    <div className="p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>
            Mis Promociones
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Crea promociones para tu restaurante — requieren aprobación del administrador
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-90"
          style={{ background: ORANGE, color: '#fff' }}>
          + Nueva Promoción
        </button>
      </div>

      {!restaurantId ? (
        <div className="rounded-2xl border p-12 text-center"
             style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          No se encontró el restaurante asignado a tu cuenta.
        </div>
      ) : loading && promotions.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 rounded-full border-2 animate-spin"
            style={{ borderColor: `${ORANGE} transparent` }} />
        </div>
      ) : promotions.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center"
             style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          No tienes promociones. ¡Crea una!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map(p => (
            <PromoCard
              key={p.id}
              promo={p}
              onEdit={setModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modal && (
        <PromoModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useClientStore } from '../store/useClientStore.js';
import { useForm } from 'react-hook-form';
import {
  XMarkIcon,
  StarIcon,
  ShoppingBagIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon,
  BanknotesIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { formatDate, formatPrice } from '../../../shared/utils/formatter.js';

const ORANGE = '#E17522';

const STATUS_STYLES = {
  pending:   { label: 'Pendiente',  color: '#F5A623' },
  confirmed: { label: 'Confirmado', color: '#3b82f6' },
  preparing: { label: 'Preparando', color: ORANGE },
  ready:     { label: 'Listo',      color: '#a78bfa' },
  completed: { label: 'Completado', color: '#22c55e' },
  cancelled: { label: 'Cancelado',  color: '#ef4444' },
};

/* ── StarPicker ─────────────────────────────────────────────── */
const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i)}
        className="transition hover:scale-110"
      >
        {i <= value
          ? <StarSolid className="h-6 w-6" style={{ color: ORANGE }} />
          : <StarIcon className="h-6 w-6" style={{ color: '#444' }} />
        }
      </button>
    ))}
  </div>
);

/* ── ReviewModal ────────────────────────────────────────────── */
const ReviewModal = ({ order, onClose, onSubmit: onSubmitProp }) => {
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({ defaultValues: { rating: 0, comment: '' } });
  const rating = watch('rating', 0);

  if (!order) return null;

  const onSubmit = async (data) => {
    await onSubmitProp({
      restaurant_id: order.restaurant_id,
      rating: data.rating,
      comment: data.comment,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-md rounded-2xl border p-6 space-y-5" style={{ background: '#1A1A1A', borderColor: '#333' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-h)' }}>Calificar pedido #{order.id}</h2>
          <button onClick={onClose}><XMarkIcon className="h-5 w-5" style={{ color: '#666' }} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>Calificación</label>
            <StarPicker value={rating} onChange={v => setValue('rating', v)} />
            <input type="hidden" {...register('rating', { required: true, min: 1 })} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Comentario</label>
            <textarea
              rows={3}
              className="input-dark resize-none"
              placeholder="Cuéntanos tu experiencia..."
              {...register('comment')}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm border" style={{ borderColor: '#444', color: '#aaa' }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating < 1}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
              style={{ background: ORANGE, color: '#fff', opacity: (isSubmitting || rating < 1) ? 0.6 : 1 }}
            >
              Enviar reseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── CheckoutModal ──────────────────────────────────────────── */
const CheckoutModal = ({ cart, onClose, onPlace }) => {
  const { register, handleSubmit, watch, setValue, formState: { isSubmitting, errors } } = useForm({
    defaultValues: { payment_method: 'cash', card_holder: '', card_number: '', card_expiry: '', card_cvv: '' },
  });

  const paymentMethod = watch('payment_method');
  const cartTotal = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const restaurantId = cart[0]?.restaurant_id;

  if (!cart.length) return null;

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const onSubmit = async (data) => {
    const payload = {
      restaurant_id: restaurantId,
      notes: data.notes || null,
      items: cart.map(i => ({ menu_id: i.id, quantity: i.quantity })),
      payment_method: data.payment_method,
    };

    if (data.payment_method === 'card') {
      const digits = data.card_number.replace(/\D/g, '');
      payload.card_holder = data.card_holder.trim();
      payload.card_last_four = digits.slice(-4);
    }

    const res = await onPlace(payload);
    if (res?.success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-md rounded-2xl border p-6 space-y-5 max-h-[90vh] overflow-y-auto" style={{ background: '#1A1A1A', borderColor: '#333' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-h)' }}>Confirmar pedido</h2>
          <button onClick={onClose}><XMarkIcon className="h-5 w-5" style={{ color: '#666' }} /></button>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {cart.map(i => (
            <div key={i.id} className="flex justify-between text-sm" style={{ color: 'var(--text)' }}>
              <span>{i.name} × {i.quantity}</span>
              <span style={{ color: 'var(--text-h)' }}>{formatPrice(i.price * i.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t flex justify-between font-bold" style={{ borderColor: '#333', color: ORANGE, fontSize: 16 }}>
          <span>Total</span>
          <span>{formatPrice(cartTotal)}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>Método de pago</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'card', label: 'Tarjeta', Icon: CreditCardIcon },
                { value: 'cash', label: 'Contra entrega', Icon: BanknotesIcon },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('payment_method', value)}
                  className="flex flex-col items-center gap-2 p-3.5 rounded-xl border transition text-center"
                  style={
                    paymentMethod === value
                      ? { background: 'rgba(225,117,34,0.10)', borderColor: 'rgba(225,117,34,0.50)', color: ORANGE }
                      : { background: '#262626', borderColor: '#333', color: '#A6A6A6' }
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Nombre en tarjeta</label>
                <input
                  className="input-dark"
                  {...register('card_holder', { required: paymentMethod === 'card' })}
                />
                {errors.card_holder && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>Requerido</p>}
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Número de tarjeta</label>
                <input
                  className="input-dark"
                  placeholder="1234 5678 9012 3456"
                  {...register('card_number', {
                    required: paymentMethod === 'card',
                    validate: (v) => v.replace(/\D/g, '').length >= 13 || 'Número inválido',
                    onChange: (e) => { e.target.value = formatCardNumber(e.target.value); },
                  })}
                />
                {errors.card_number && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.card_number.message || 'Requerido'}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>MM/AA</label>
                  <input
                    className="input-dark"
                    placeholder="MM/AA"
                    {...register('card_expiry', {
                      required: paymentMethod === 'card',
                      pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Formato MM/AA' },
                    })}
                  />
                  {errors.card_expiry && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.card_expiry.message || 'Requerido'}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>CVV</label>
                  <input
                    className="input-dark"
                    type="password"
                    maxLength={4}
                    {...register('card_cvv', { required: paymentMethod === 'card', minLength: 3 })}
                  />
                  {errors.card_cvv && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>Requerido</p>}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Notas (instrucciones)</label>
            <textarea rows={2} className="input-dark resize-none" {...register('notes')} />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm border" style={{ borderColor: '#444', color: '#aaa' }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
              style={{ background: ORANGE, color: '#fff', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── OrderHistory (main) ────────────────────────────────────── */
export const OrderHistory = () => {
  const location = useLocation();
  const {
    orders, cart, restaurants, invoices, loading,
    fetchMyOrders, fetchRestaurants, fetchMyInvoices,
    cancelOrder, placeOrder, clearCart, submitReview,
  } = useClientStore();
  const [reviewOrder,  setReviewOrder]  = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [tab,          setTab]          = useState('orders'); // 'orders' | 'invoices'

  useEffect(() => {
    fetchMyOrders();
    fetchRestaurants();
    fetchMyInvoices();
    if (location.state?.checkoutMode && cart.length > 0) {
      setShowCheckout(true);
    }
  }, [fetchMyOrders, fetchRestaurants, fetchMyInvoices]);

  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);

  return (
    <div className="p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>Mis pedidos</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Historial de consumos y calificaciones
          </p>
        </div>

        {cartCount > 0 && (
          <button
            onClick={() => setShowCheckout(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{ background: ORANGE, color: '#fff' }}
          >
            <ShoppingBagIcon className="h-4 w-4" />
            Carrito ({cartCount})
          </button>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {[
          { key: 'orders',   label: `Pedidos (${orders.length})` },
          { key: 'invoices', label: `Facturas (${invoices.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition"
            style={{
              background: tab === t.key ? ORANGE : 'var(--bg-card)',
              color:      tab === t.key ? '#fff' : '#A6A6A6',
              border:     `1px solid ${tab === t.key ? ORANGE : 'var(--border)'}`,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* INVOICES TAB */}
      {tab === 'invoices' && (
        <div className="space-y-3">
          {invoices.length === 0 ? (
            <div className="rounded-2xl border p-12 text-center"
                 style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <DocumentTextIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
              No tienes facturas aún
            </div>
          ) : (
            invoices.map(inv => {
              const invoiceDate = inv.issued_at || inv.created_at || inv.createdAt;
              return (
                <div key={inv.id} className="rounded-2xl border p-5 flex items-center justify-between gap-3"
                     style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-h)' }}>
                      Factura #{inv.id}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(invoiceDate)}
                      {inv.order_status && ` · ${inv.order_status}`}
                    </p>
                  </div>
                  <p className="text-lg font-bold flex-shrink-0" style={{ color: ORANGE }}>
                    {formatPrice(inv.total ?? inv.subtotal ?? 0)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ORDERS LIST */}
      {tab === 'orders' && loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 rounded-full border-2 animate-spin" style={{ borderColor: `${ORANGE} transparent` }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <ShoppingBagIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
          No tienes pedidos aún. Explora restaurantes y realiza tu primer pedido.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const s = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
            return (
              <div
                key={order.id}
                className="rounded-2xl border p-5"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold" style={{ color: 'var(--text-h)' }}>
                        Pedido #{order.id}
                      </span>
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: `${s.color}20`, color: s.color }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(order.created_at)}
                      {order.notes && ` · ${order.notes}`}
                    </p>
                  </div>
                  <p className="text-lg font-bold flex-shrink-0" style={{ color: ORANGE }}>
                    {formatPrice(order.total)}
                  </p>
                </div>

                {/* actions */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {order.status === 'completed' && (
                    <button
                      onClick={() => setReviewOrder(order)}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition"
                      style={{ background: 'rgba(225,117,34,0.12)', color: ORANGE, border: `1px solid rgba(225,117,34,0.25)` }}
                    >
                      <StarIcon className="h-3.5 w-3.5" /> Calificar
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition"
                      style={{ background: 'rgba(239,68,68,0.10)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.20)' }}
                    >
                      Cancelar pedido
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* modals */}
      <ReviewModal
        order={reviewOrder}
        onClose={() => setReviewOrder(null)}
        onSubmit={submitReview}
      />

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onPlace={async (data) => {
            const res = await placeOrder(data);
            if (res?.success) clearCart();
            return res;
          }}
        />
      )}
    </div>
  );
};

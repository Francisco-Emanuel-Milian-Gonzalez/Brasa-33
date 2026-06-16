import { useEffect, useState, useRef } from 'react';
import { useManagerOrdersStore } from '../store/useManagerOrdersStore.js';
import { useManagerStore } from '../store/useManagerStore.js';
import { XMarkIcon, ReceiptRefundIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatDate, formatPrice } from '../../../shared/utils/formatter.js';

const ORANGE = '#E17522';
const POLL_MS = 20000;

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Pendiente',   color: '#F5A623' },
  { value: 'confirmed', label: 'Confirmado',  color: '#3b82f6' },
  { value: 'preparing', label: 'Preparando',  color: ORANGE },
  { value: 'ready',     label: 'Listo',       color: '#a78bfa' },
  { value: 'completed', label: 'Completado',  color: '#22c55e' },
  { value: 'cancelled', label: 'Cancelado',   color: '#ef4444' },
];

const statusColor = (s) => STATUS_OPTIONS.find(o => o.value === s)?.color ?? '#aaa';
const statusLabel = (s) => STATUS_OPTIONS.find(o => o.value === s)?.label ?? s;

/* ── InvoiceModal ───────────────────────────────────────────── */
const lineSubtotal = (item) => {
  const qty = Number(item.quantity) || 0;
  const price = parseFloat(item.price) || 0;
  return parseFloat(item.subtotal ?? item.line_total ?? qty * price) || 0;
};

const InvoiceModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const items = invoice.items ?? invoice.order?.items ?? [];
  const subtotal = invoice.subtotal != null
    ? Number(invoice.subtotal)
    : items.reduce((a, i) => a + lineSubtotal(i), 0);
  const taxAmt = invoice.tax != null ? Number(invoice.tax) : subtotal * 0.12;
  const total = invoice.total != null ? Number(invoice.total) : subtotal + taxAmt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4" style={{ background: '#1A1A1A', borderColor: '#333' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-h)' }}>
            Factura #{invoice.id}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <XMarkIcon className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
          <p>Pedido: <span style={{ color: 'var(--text-h)' }}>#{invoice.order_id}</span></p>
          <p>Fecha: <span style={{ color: 'var(--text-h)' }}>{formatDate(invoice.issued_at || invoice.created_at)}</span></p>
          {invoice.client_name && <p>Cliente: <span style={{ color: 'var(--text-h)' }}>{invoice.client_name}</span></p>}
        </div>

        {items.length > 0 && (
          <div className="border rounded-xl overflow-hidden" style={{ borderColor: '#333' }}>
            {items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center px-4 py-2.5 text-sm"
                style={{
                  borderBottom: i < items.length - 1 ? '1px solid #2a2a2a' : 'none',
                  color: 'var(--text)',
                }}
              >
                <span>{item.name} × {item.quantity}</span>
                <span style={{ color: 'var(--text-h)', fontWeight: 600 }}>
                  {formatPrice(lineSubtotal(item))}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1.5 text-sm pt-1">
          <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>IVA (12%)</span>
            <span>{formatPrice(taxAmt)}</span>
          </div>
          <div
            className="flex justify-between font-bold pt-1 border-t"
            style={{ borderColor: '#333', color: ORANGE, fontSize: 16 }}
          >
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl py-2.5 text-sm font-semibold"
          style={{ background: ORANGE, color: '#fff' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

/* ── OrderCard ──────────────────────────────────────────────── */
const OrderCard = ({ order, onStatusChange, onInvoice }) => (
  <div
    className="rounded-2xl border p-5 space-y-3 transition"
    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
  >
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-bold text-sm" style={{ color: 'var(--text-h)' }}>
          Pedido #{order.id}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {formatDate(order.created_at)}
          {order.notes && ` · ${order.notes}`}
        </p>
      </div>
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: `${statusColor(order.status)}20`, color: statusColor(order.status) }}
      >
        {statusLabel(order.status)}
      </span>
    </div>

    <p className="text-xl font-bold" style={{ color: ORANGE }}>
      {formatPrice(order.total)}
    </p>

    <select
      value={order.status}
      onChange={e => onStatusChange(order.id, e.target.value)}
      className="input-dark text-xs"
      disabled={['completed', 'cancelled'].includes(order.status)}
    >
      {STATUS_OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>

    {['completed', 'confirmed', 'ready'].includes(order.status) && (
      <button
        type="button"
        onClick={() => onInvoice(order.id)}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition"
        style={{ background: 'rgba(225,117,34,0.12)', color: ORANGE, border: '1px solid rgba(225,117,34,0.25)' }}
      >
        <ReceiptRefundIcon className="h-4 w-4" /> Ver / Generar factura
      </button>
    )}
  </div>
);

/* ── ManagerOrdersMonitor (main) ────────────────────────────── */
export const ManagerOrdersMonitor = () => {
  const { orders, invoice, loading, fetchOrders, setStatus, generateInvoice, fetchInvoice, clearInvoice } = useManagerOrdersStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const intervalRef = useRef(null);
  const restaurantId = useManagerStore((s) => s.restaurantId);

  useEffect(() => {
    fetchOrders(restaurantId);
    intervalRef.current = setInterval(() => fetchOrders(restaurantId), POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchOrders, restaurantId]);

  const handleInvoice = async (orderId) => {
    let inv = await fetchInvoice(orderId);
    if (!inv) inv = await generateInvoice(orderId);
  };

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="p-4 sm:p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>Monitor de Pedidos</h1>
            {pendingCount > 0 && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
              >
                {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Actualización automática cada {POLL_MS / 1000}s
          </p>
        </div>
      </div>

      {/* KPIs — scroll horizontal en móvil, grid en desktop */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-6 sm:overflow-visible">
        {STATUS_OPTIONS.map(s => {
          const count = orders.filter(o => o.status === s.value).length;
          const isActive = statusFilter === s.value;
          return (
            <button
              key={s.value}
              type="button"
              className={`status-kpi-btn rounded-2xl p-3 sm:p-4 text-center flex-shrink-0 min-w-[5.25rem] sm:min-w-0 ${isActive ? 'is-active' : ''}`}
              style={{ '--kpi-color': s.color }}
              onClick={() => setStatusFilter(isActive ? 'all' : s.value)}
            >
              <span className="status-kpi-count">{count}</span>
              <p className="status-kpi-label">{s.label}</p>
            </button>
          );
        })}
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 rounded-full border-2 animate-spin" style={{ borderColor: `${ORANGE} transparent` }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <CheckCircleIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
          No hay pedidos en este estado
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(o => (
            <OrderCard
              key={o.id}
              order={o}
              onStatusChange={setStatus}
              onInvoice={handleInvoice}
            />
          ))}
        </div>
      )}

      <InvoiceModal invoice={invoice} onClose={clearInvoice} />
    </div>
  );
};

import { useEffect, useState } from 'react';
import { ArchiveBoxIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useManagerStore } from '../store/useManagerStore.js';
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../../../shared/api/inventory.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

const ORANGE = '#E17522';

export const InventoryManager = () => {
  const { myRestaurant } = useManagerStore();
  const { openConfirm } = useUIStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ingredient: '', quantity: '', unit: 'kg', min_stock: '' });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getInventory();
      setItems(res.data ?? res ?? []);
    } catch {
      showError('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createInventoryItem({
        ingredient: form.ingredient,
        quantity: Number(form.quantity) || 0,
        unit: form.unit,
        min_stock: Number(form.min_stock) || 0,
      });
      showSuccess('Ingrediente agregado');
      setForm({ ingredient: '', quantity: '', unit: 'kg', min_stock: '' });
      setShowForm(false);
      load();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al crear');
    }
  };

  const handleQtyChange = async (id, quantity) => {
    try {
      await updateInventoryItem(id, { quantity: Number(quantity) });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    } catch {
      showError('Error al actualizar');
    }
  };

  const handleDelete = (id) => {
    openConfirm({
      title: 'Eliminar ingrediente',
      message: '¿Eliminar este ingrediente del inventario?',
      onConfirm: async () => {
        try {
          await deleteInventoryItem(id);
          showSuccess('Eliminado');
          load();
        } catch {
          showError('Error al eliminar');
        }
      },
    });
  };

  return (
    <div className="p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>Inventario</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {myRestaurant?.name ?? 'Tu restaurante'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white"
          style={{ background: ORANGE }}
        >
          <PlusIcon className="h-4 w-4" /> Agregar ingrediente
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3" style={{ background: '#1A1A1A', borderColor: '#333' }}>
          <input className="input-dark" placeholder="Ingrediente" value={form.ingredient} onChange={(e) => setForm({ ...form, ingredient: e.target.value })} required />
          <input className="input-dark" type="number" step="0.01" placeholder="Cantidad" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <select className="input-dark" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            {['kg', 'L', 'unidades', 'g', 'ml'].map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <input className="input-dark" type="number" step="0.01" placeholder="Stock mínimo" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} />
          <button type="submit" className="sm:col-span-2 lg:col-span-4 py-2 rounded-xl font-semibold text-white" style={{ background: ORANGE }}>Guardar</button>
        </form>
      )}

      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl animate-pulse bg-[#2a2a2a]" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: '#333', background: '#1A1A1A' }}>
          <ArchiveBoxIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p style={{ color: '#A6A6A6' }}>No hay ingredientes en inventario</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const low = Number(item.quantity) <= Number(item.min_stock);
            return (
              <div key={item.id} className="rounded-2xl border p-4 flex flex-wrap items-center gap-4" style={{ background: '#1A1A1A', borderColor: '#333' }}>
                <div className="flex-1 min-w-[140px]">
                  <p className="font-semibold" style={{ color: '#F2F2F2' }}>{item.ingredient}</p>
                  {low && (
                    <span className="text-xs font-semibold text-red-400">Stock bajo</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    className="input-dark w-24"
                    defaultValue={item.quantity}
                    onBlur={(e) => handleQtyChange(item.id, e.target.value)}
                  />
                  <span className="text-sm" style={{ color: '#A6A6A6' }}>{item.unit}</span>
                </div>
                <button type="button" onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-500/10">
                  <TrashIcon className="h-5 w-5 text-red-400" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

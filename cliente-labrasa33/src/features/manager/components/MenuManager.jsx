import { useEffect, useState } from 'react';
import { useManagerMenuStore } from '../store/useManagerMenuStore.js';
import { useManagerStore } from '../store/useManagerStore.js';
import { useAuthStore, ROLES } from '../../auth/store/authStore.js';
import { useForm } from 'react-hook-form';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  MinusIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

const ORANGE = '#E17522';

const CATEGORIES = [
  { value: 'starter', label: 'Entrada' },
  { value: 'main', label: 'Plato fuerte' },
  { value: 'dessert', label: 'Postre' },
  { value: 'beverage', label: 'Bebida' },
  { value: 'other', label: 'Otro' },
];

const catLabel = (val) => CATEGORIES.find((c) => c.value === val)?.label ?? val;

const DishModal = ({ isOpen, onClose, editDish, adminRestaurantId, onAdminRestaurantChange }) => {
  const { createDish, updateDish } = useManagerMenuStore();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === ROLES.ADMIN;
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const imageFile = watch('image');

  useEffect(() => {
    if (!isOpen) return;
    if (editDish) {
      reset({
        name: editDish.name,
        description: editDish.description ?? '',
        price: editDish.price,
        stock: editDish.stock,
        category: editDish.category ?? 'main',
        ingredients: editDish.ingredients ?? '',
      });
    } else {
      reset({ name: '', description: '', price: '', stock: 0, category: 'main', ingredients: '' });
    }
  }, [editDish, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('price', String(parseFloat(data.price)));
    formData.append('stock', String(parseInt(data.stock, 10) || 0));
    formData.append('category', data.category || 'main');
    if (data.ingredients) formData.append('ingredients', data.ingredients);
    if (isAdmin && adminRestaurantId) formData.append('restaurant_id', String(adminRestaurantId));
    if (data.image?.[0]) formData.append('image', data.image[0]);

    if (editDish) await updateDish(editDish.id, formData);
    else await createDish(formData);
    onClose();
  };

  const previewSrc = imageFile?.[0]
    ? URL.createObjectURL(imageFile[0])
    : editDish?.image_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-lg rounded-2xl border p-6 space-y-5 my-8" style={{ background: '#1A1A1A', borderColor: '#333' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-h)' }}>
            {editDish ? 'Editar plato' : 'Nuevo plato'}
          </h2>
          <button type="button" onClick={onClose}><XMarkIcon className="h-5 w-5" style={{ color: 'var(--text-muted)' }} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isAdmin && (
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Restaurante (admin)</label>
              <input
                type="number"
                className="input-dark"
                value={adminRestaurantId || ''}
                onChange={(e) => onAdminRestaurantChange(e.target.value)}
                placeholder="ID del restaurante"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Imagen del plato</label>
            {previewSrc && (
              <img src={previewSrc} alt="" className="w-full h-40 object-cover rounded-xl mb-2 border" style={{ borderColor: '#333' }} />
            )}
            <label className="flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer" style={{ borderColor: '#444', color: '#A6A6A6' }}>
              <PhotoIcon className="h-5 w-5" />
              <span className="text-sm">Seleccionar imagen</span>
              <input type="file" accept="image/*" className="sr-only" {...register('image')} />
            </label>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Nombre *</label>
            <input className="input-dark" {...register('name', { required: true })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Precio (GTQ) *</label>
              <input type="number" step="0.01" className="input-dark" {...register('price', { required: true, min: 0 })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Stock</label>
              <input type="number" className="input-dark" {...register('stock', { min: 0 })} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Categoría</label>
            <select className="input-dark" {...register('category')}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Descripción</label>
            <textarea rows={2} className="input-dark resize-none" {...register('description')} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ background: ORANGE, color: '#fff' }}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DishCard = ({ dish, onEdit, onDelete, onStockChange }) => (
  <div className="rounded-2xl border overflow-hidden flex flex-col" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
    {dish.image_url && (
      <img src={dish.image_url} alt={dish.name} className="w-full h-36 object-cover" />
    )}
    <div className="p-4 flex flex-col gap-3 flex-1">
      <p className="font-semibold" style={{ color: 'var(--text-h)' }}>{dish.name}</p>
      <p className="font-bold" style={{ color: ORANGE }}>Q{Number(dish.price).toFixed(2)}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onStockChange(dish.id, Math.max(0, dish.stock - 1))} className="h-7 w-7 rounded-lg border flex items-center justify-center" style={{ borderColor: 'var(--border)' }}>
          <MinusIcon className="h-3.5 w-3.5" />
        </button>
        <span className="text-sm font-semibold">{dish.stock}</span>
        <button type="button" onClick={() => onStockChange(dish.id, dish.stock + 1)} className="h-7 w-7 rounded-lg border flex items-center justify-center" style={{ borderColor: 'var(--border)' }}>
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex gap-2 mt-auto">
        <button type="button" onClick={() => onEdit(dish)} className="flex-1 py-2 text-xs font-semibold rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <PencilSquareIcon className="h-4 w-4 inline mr-1" /> Editar
        </button>
        <button type="button" onClick={() => onDelete(dish.id)} className="px-3 py-2 rounded-xl" style={{ color: '#ef4444' }}>
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);

export const MenuManager = () => {
  const { dishes, loading, fetchDishes, deleteDish, updateStock } = useManagerMenuStore();
  const restaurantId = useManagerStore((s) => s.restaurantId);
  const myRestaurant = useManagerStore((s) => s.myRestaurant);
  const user = useAuthStore((s) => s.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDish, setEditDish] = useState(null);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [adminRestaurantId, setAdminRestaurantId] = useState('');

  useEffect(() => {
    if (restaurantId) fetchDishes(restaurantId);
    else if (adminRestaurantId) fetchDishes(adminRestaurantId);
  }, [fetchDishes, restaurantId, adminRestaurantId]);

  const filtered = dishes.filter((d) => {
    const matchCat = catFilter === 'all' || d.category === catFilter;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>Menú</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {myRestaurant?.name ? `Restaurante: ${myRestaurant.name}` : `${dishes.length} platos`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditDish(null); setModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{ background: ORANGE, color: '#fff' }}
        >
          <PlusIcon className="h-4 w-4" /> Nuevo plato
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Buscar plato..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-dark flex-1" />
      </div>

      {loading && dishes.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 rounded-full border-2 animate-spin" style={{ borderColor: `${ORANGE} transparent` }} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d) => (
            <DishCard
              key={d.id}
              dish={d}
              onEdit={(dish) => { setEditDish(dish); setModalOpen(true); }}
              onDelete={deleteDish}
              onStockChange={updateStock}
            />
          ))}
        </div>
      )}

      <DishModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editDish={editDish}
        adminRestaurantId={adminRestaurantId}
        onAdminRestaurantChange={setAdminRestaurantId}
      />
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  XMarkIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { useClientStore } from '../store/useClientStore.js';
import { getRestaurantByIdPublic } from '../../../shared/api/client.js';
import { showSuccess } from '../../../shared/utils/toast.js';
import { formatPrice } from '../../../shared/utils/formatter.js';

const ORANGE = '#E17522';

const CATEGORIES = [
  { value: 'starter', label: 'Entradas' },
  { value: 'main', label: 'Platos fuertes' },
  { value: 'dessert', label: 'Postres' },
  { value: 'beverage', label: 'Bebidas' },
  { value: 'other', label: 'Otros' },
];

const categoryLabel = (cat) => CATEGORIES.find((c) => c.value === cat)?.label ?? cat ?? 'General';

/* ── DishDetailModal ───────────────────────────────────────── */
const DishDetailModal = ({ dish, restaurantId, cart, onClose, onAdd, onRemove }) => {
  if (!dish) return null;

  const inCart = cart.find((i) => i.id === dish.id);
  const qty = inCart?.quantity ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-md rounded-2xl border overflow-hidden relative" style={{ background: '#1A1A1A', borderColor: '#333' }}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <XMarkIcon className="h-5 w-5 text-white" />
        </button>

        <div className="h-48 flex items-center justify-center" style={{ background: '#2a2a2a' }}>
          {dish.image_url ? (
            <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
          ) : (
            <UtensilsIcon className="h-16 w-16" style={{ color: '#555' }} />
          )}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(225,117,34,0.15)', color: ORANGE }}>
              {categoryLabel(dish.category)}
            </span>
            <h2 className="text-xl font-bold mt-2" style={{ color: '#F2F2F2' }}>{dish.name}</h2>
          </div>

          {dish.description && (
            <p className="text-sm" style={{ color: '#A6A6A6' }}>{dish.description}</p>
          )}

          {dish.ingredients && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#A6A6A6' }}>Ingredientes</p>
              <p className="text-sm" style={{ color: '#F2F2F2' }}>{dish.ingredients}</p>
            </div>
          )}

          <p className="text-2xl font-bold" style={{ color: ORANGE }}>
            {formatPrice(dish.price)}
          </p>

          {qty > 0 ? (
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => onRemove(dish.id)}
                className="h-11 w-11 rounded-xl border flex items-center justify-center"
                style={{ borderColor: '#444' }}
              >
                <MinusIcon className="h-5 w-5" style={{ color: '#aaa' }} />
              </button>
              <span className="text-lg font-bold w-8 text-center" style={{ color: '#F2F2F2' }}>{qty}</span>
              <button
                type="button"
                onClick={() => onAdd({ ...dish, restaurant_id: Number(restaurantId) })}
                className="h-11 w-11 rounded-xl flex items-center justify-center"
                style={{ background: ORANGE }}
              >
                <PlusIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onAdd({ ...dish, restaurant_id: Number(restaurantId) });
                showSuccess(`${dish.name} agregado`);
              }}
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ background: ORANGE, color: '#fff' }}
            >
              Agregar al carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const RestaurantMenuPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentMenu, fetchMenu, cart, addToCart, removeFromCart, clearCart } = useClientStore();

  const [restaurant, setRestaurant] = useState(null);
  const [catFilter, setCatFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getRestaurantByIdPublic(id);
        setRestaurant(res.data ?? res);
        await fetchMenu(id);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, fetchMenu]);

  const filtered =
    catFilter === 'all'
      ? currentMenu
      : currentMenu.filter((d) => d.category === catFilter);

  const cartTotal = cart.reduce((a, i) => a + Number(i.price) * i.quantity, 0);
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);

  const handleCheckout = () => {
    navigate('/dashboard/history', { state: { checkoutMode: true } });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 rounded-full border-2 animate-spin" style={{ borderColor: `${ORANGE} transparent` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--bg)' }}>
      <div className="relative h-48 overflow-hidden">
        {restaurant?.logo_url ? (
          <img src={restaurant.logo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: '#2a2a2a' }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <button
          type="button"
          onClick={() => navigate('/dashboard/explore')}
          className="absolute top-4 left-4 h-10 w-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <ArrowLeftIcon className="h-5 w-5 text-white" />
        </button>
        <h1 className="absolute bottom-4 left-4 right-4 text-2xl font-bold text-white">
          {restaurant?.name}
        </h1>
      </div>

      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', ...CATEGORIES.map((c) => c.value)].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setCatFilter(f)}
              className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold border"
              style={
                catFilter === f
                  ? { background: ORANGE, color: '#fff', borderColor: ORANGE }
                  : { background: '#1A1A1A', color: '#A6A6A6', borderColor: '#333' }
              }
            >
              {f === 'all' ? 'Todo' : CATEGORIES.find((c) => c.value === f)?.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center py-12" style={{ color: '#A6A6A6' }}>Sin platos disponibles</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((dish) => {
              const inCart = cart.find((i) => i.id === dish.id);
              return (
                <div
                  key={dish.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedDish(dish)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedDish(dish)}
                  className="flex gap-3 p-3 rounded-2xl border cursor-pointer transition hover:border-[#444]"
                  style={{ background: '#1A1A1A', borderColor: '#333' }}
                >
                  <div className="h-20 w-20 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#2a2a2a' }}>
                    {dish.image_url ? (
                      <img src={dish.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <UtensilsIcon className="h-8 w-8" style={{ color: '#555' }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#F2F2F2' }}>{dish.name}</p>
                    {dish.description && (
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#A6A6A6' }}>{dish.description}</p>
                    )}
                    <p className="font-bold text-sm mt-1" style={{ color: ORANGE }}>
                      {formatPrice(dish.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {inCart && (
                      <>
                        <button type="button" onClick={() => removeFromCart(dish.id)} className="h-8 w-8 rounded-lg border flex items-center justify-center" style={{ borderColor: '#444' }}>
                          <MinusIcon className="h-4 w-4" style={{ color: '#aaa' }} />
                        </button>
                        <span className="w-6 text-center text-sm font-bold" style={{ color: '#F2F2F2' }}>{inCart.quantity}</span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        addToCart({ ...dish, restaurant_id: Number(id) });
                        showSuccess(`${dish.name} agregado`);
                      }}
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ background: ORANGE }}
                    >
                      <PlusIcon className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cartCount > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 border-t z-40"
          style={{ background: '#1A1A1A', borderColor: '#333' }}
        >
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs" style={{ color: '#A6A6A6' }}>{cartCount} items</p>
              <p className="font-bold" style={{ color: ORANGE }}>{formatPrice(cartTotal)}</p>
            </div>
            <button type="button" onClick={clearCart} className="text-xs px-3 py-2 rounded-lg border" style={{ borderColor: '#444', color: '#A6A6A6' }}>
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
              style={{ background: ORANGE, color: '#fff' }}
            >
              <ShoppingCartIcon className="h-5 w-5" /> Realizar pedido
            </button>
          </div>
        </div>
      )}

      <DishDetailModal
        dish={selectedDish}
        restaurantId={id}
        cart={cart}
        onClose={() => setSelectedDish(null)}
        onAdd={addToCart}
        onRemove={removeFromCart}
      />
    </div>
  );
};

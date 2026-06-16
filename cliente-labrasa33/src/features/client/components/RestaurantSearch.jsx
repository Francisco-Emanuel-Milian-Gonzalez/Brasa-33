import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientStore } from '../store/useClientStore.js';
import {
  MagnifyingGlassIcon,
  StarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const ORANGE = '#E17522';

const Stars = ({ rating, count }) => (
  <div className="flex items-center gap-2">
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= Math.round(Number(rating))
          ? <StarSolid key={i} className="h-4 w-4" style={{ color: ORANGE }} />
          : <StarIcon key={i} className="h-4 w-4" style={{ color: '#555' }} />
      )}
    </div>
    <span className="text-xs" style={{ color: '#A6A6A6' }}>
      {Number(rating).toFixed(1)} ({count} reseñas)
    </span>
  </div>
);

const RestaurantCard = ({ restaurant, onViewMenu }) => (
  <div
    className="rounded-2xl border overflow-hidden flex flex-col"
    style={{ background: '#1A1A1A', borderColor: '#333' }}
  >
    <div className="relative h-[220px] w-full" style={{ background: '#2a2a2a' }}>
      {restaurant.logo_url ? (
        <img
          src={restaurant.logo_url}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <BuildingStorefrontIcon className="h-20 w-20" style={{ color: '#444' }} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <h3 className="absolute bottom-3 left-4 right-4 text-xl font-bold text-white">
        {restaurant.name}
      </h3>
    </div>

    <div className="p-4 flex flex-col gap-3 flex-1">
      {restaurant.address && (
        <p className="flex items-start gap-2 text-sm" style={{ color: '#A6A6A6' }}>
          <MapPinIcon className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: ORANGE }} />
          {restaurant.address}
        </p>
      )}

      <Stars rating={restaurant.avg_rating ?? 0} count={restaurant.review_count ?? 0} />

      {restaurant.description && (
        <p className="text-xs line-clamp-2" style={{ color: '#888' }}>{restaurant.description}</p>
      )}

      <button
        type="button"
        onClick={() => onViewMenu(restaurant)}
        className="w-full mt-auto py-3 rounded-xl text-sm font-semibold transition hover:opacity-90"
        style={{ background: ORANGE, color: '#fff' }}
      >
        Ver menú
      </button>
    </div>
  </div>
);

export const RestaurantSearch = () => {
  const { restaurants, loading, fetchRestaurants } = useClientStore();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const filtered = restaurants.filter(
    (r) =>
      !search ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.address?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>Explorar restaurantes</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Encuentra el lugar perfecto y realiza tu pedido
        </p>
      </div>

      <div className="relative max-w-lg">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar restaurante o ubicación..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 rounded-full border-2 animate-spin" style={{ borderColor: `${ORANGE} transparent` }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          No se encontraron restaurantes
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              onViewMenu={(rest) => navigate(`/dashboard/restaurant/${rest.id}/menu`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useRestaurantsStore } from '../store/useRestaurantStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { RestaurantModal } from './RestaurantModal.jsx';
import { useUIStore } from '../../auth/store/uiStore.js';
import { showError, showSuccess } from '../../../shared/utils/toast.js';
import { getAllUsers } from '../../../shared/api/auth.js';
import { assignRestaurantManager } from '../../../shared/api/admin.js';
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const ORANGE = '#E17522';

const RestaurantCard = ({
  restaurant,
  managers,
  managerName,
  onEdit,
  onDelete,
  onAssigned,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedManager, setSelectedManager] = useState(restaurant.manager_id || '');
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async () => {
    setAssigning(true);
    try {
      await assignRestaurantManager(restaurant.id, selectedManager || null);
      showSuccess('Gerente asignado');
      onAssigned();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al asignar gerente');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden flex flex-col"
      style={{ background: '#1A1A1A', borderColor: '#333' }}
    >
      <div className="relative h-[200px] w-full" style={{ background: '#2a2a2a' }}>
        {restaurant.logo_url ? (
          <img
            src={restaurant.logo_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BuildingStorefrontIcon className="h-16 w-16" style={{ color: '#444' }} />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold" style={{ color: '#F2F2F2' }}>{restaurant.name}</h2>
          {restaurant.category && (
            <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(225,117,34,0.15)', color: ORANGE }}>
              {restaurant.category}
            </span>
          )}
        </div>

        {restaurant.description && (
          <p className="text-xs line-clamp-2" style={{ color: '#A6A6A6' }}>{restaurant.description}</p>
        )}

        <div className="space-y-1.5">
          <p className="flex items-center gap-2 text-sm" style={{ color: '#A6A6A6' }}>
            <MapPinIcon className="h-4 w-4 flex-shrink-0" style={{ color: ORANGE }} />
            {restaurant.address}
          </p>
          <p className="flex items-center gap-2 text-sm" style={{ color: '#A6A6A6' }}>
            <PhoneIcon className="h-4 w-4 flex-shrink-0" style={{ color: ORANGE }} />
            {restaurant.phone}
          </p>
          {restaurant.opening_time && restaurant.closing_time && (
            <p className="flex items-center gap-2 text-sm" style={{ color: '#A6A6A6' }}>
              <ClockIcon className="h-4 w-4 flex-shrink-0" style={{ color: ORANGE }} />
              {String(restaurant.opening_time).slice(0, 5)} - {String(restaurant.closing_time).slice(0, 5)}
            </p>
          )}
        </div>

        <div
          className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl"
          style={{
            background: restaurant.manager_id ? 'rgba(34,197,94,0.12)' : 'rgba(100,100,100,0.12)',
            color: restaurant.manager_id ? '#22c55e' : '#888',
          }}
        >
          <UserIcon className="h-4 w-4" />
          {restaurant.manager_id
            ? `Gerente: ${managerName || restaurant.manager_id}`
            : 'Sin gerente'}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-between w-full text-xs font-semibold py-2 px-3 rounded-lg transition"
          style={{ background: '#262626', color: '#A6A6A6' }}
        >
          Asignar gerente
          {expanded
            ? <ChevronUpIcon className="h-4 w-4" />
            : <ChevronDownIcon className="h-4 w-4" />}
        </button>

        {expanded && (
          <div className="space-y-2 pt-1">
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#262626', color: '#F2F2F2', border: '1px solid #444' }}
            >
              <option value="">Sin gerente</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName || m.username} ({m.email})
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={assigning}
              onClick={handleAssign}
              className="w-full py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
              style={{ background: ORANGE, color: '#fff' }}
            >
              {assigning ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition hover:opacity-90"
            style={{ borderColor: '#444', color: '#F2F2F2', background: '#262626' }}
          >
            <PencilSquareIcon className="h-4 w-4" /> Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const Restaurants = () => {
  const { restaurants, loading, error, getRestaurants, deleteRestaurant } = useRestaurantsStore();
  const [openModal, setOpenModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [managers, setManagers] = useState([]);
  const { openConfirm } = useUIStore();

  useEffect(() => { getRestaurants(); }, [getRestaurants]);

  useEffect(() => {
    getAllUsers()
      .then((res) => {
        const users = res.users || res || [];
        setManagers(users.filter((u) => u.role === 'MANAGER_ROLE'));
      })
      .catch(() => setManagers([]));
  }, []);

  useEffect(() => { if (error) showError(error); }, [error]);

  const managerLabel = (managerId) => {
    const m = managers.find((u) => u.id === managerId);
    return m ? (m.fullName || m.username) : null;
  };

  if (loading && restaurants.length === 0) return <Spinner />;

  return (
    <div className="p-6 min-h-screen" style={{ background: '#0D0D0D' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F2F2F2]">Restaurantes</h1>
          <p className="text-[#A6A6A6] text-sm">Administra restaurantes y asigna gerentes</p>
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded-lg font-semibold"
          style={{ background: ORANGE, color: '#fff' }}
          onClick={() => { setSelectedRestaurant(null); setOpenModal(true); }}
        >
          + Agregar Restaurante
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {restaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
            managers={managers}
            managerName={managerLabel(r.manager_id)}
            onEdit={() => { setSelectedRestaurant(r); setOpenModal(true); }}
            onDelete={() =>
              openConfirm({
                title: 'Eliminar restaurante',
                message: `¿Eliminar ${r.name}?`,
                onConfirm: () => deleteRestaurant(r.id),
              })
            }
            onAssigned={getRestaurants}
          />
        ))}
      </div>

      <RestaurantModal
        isOpen={openModal}
        onClose={() => { setOpenModal(false); setSelectedRestaurant(null); }}
        restaurant={selectedRestaurant}
      />
    </div>
  );
};

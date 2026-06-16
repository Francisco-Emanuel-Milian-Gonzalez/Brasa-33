import { useEffect } from 'react';
import { useOrdersStore } from '../store/useOrdersStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { useUIStore } from '../../auth/store/uiStore.js';
import { showError } from '../../../shared/utils/toast.js';
import { formatDate, formatPrice } from '../../../shared/utils/formatter.js';

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const Orders = () => {
  const user = useAuthStore((state) => state.user);

  const { orders, loading, error, getOrders, deleteOrder } =
    useOrdersStore();

  const { openConfirm } = useUIStore();

  useEffect(() => {
    if (user?.role === 'ADMIN_ROLE') getOrders();
  }, [getOrders, user]);

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  if (user?.role !== 'ADMIN_ROLE') {
    return (
      <div className="p-6 bg-[#111] text-white rounded-xl text-center border border-[#333]">
        Acceso denegado
      </div>
    );
  }

  if (loading) return <Spinner />;

  return (
    <div className="p-6 space-y-6 bg-[#0D0D0D] min-h-screen">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Pedidos
        </h1>
        <p className="text-gray-400 text-sm">
          Listado de órdenes — estado, total, restaurante y cliente
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

        {orders.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">
            No hay pedidos
          </div>
        ) : (
          orders.map((o) => (
            <div
              key={o.id}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5"
            >

              <h2 className="text-white font-bold">
                Pedido #{o.id}
              </h2>

              <p className="text-gray-400 text-sm mt-1 capitalize">
                Estado: {STATUS_LABELS[o.status] ?? o.status}
              </p>

              <p className="text-gray-400 text-sm mt-1">
                Restaurante: {o.restaurant_name ?? `#${o.restaurant_id ?? '—'}`}
              </p>

              <p className="text-gray-400 text-sm mt-1">
                Cliente: {o.user_id ?? '—'}
              </p>

              <p className="text-gray-500 text-xs mt-1">
                {formatDate(o.created_at)}
              </p>

              <div className="mt-3 text-white font-semibold">
                Total: {formatPrice(o.total)}
              </div>

              <button
                className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg"
                onClick={() =>
                  openConfirm({
                    title: 'Eliminar pedido',
                    message: `¿Eliminar pedido #${o.id}?`,
                    onConfirm: () => deleteOrder(o.id),
                  })
                }
              >
                Eliminar
              </button>

            </div>
          ))
        )}

      </div>

    </div>
  );
};

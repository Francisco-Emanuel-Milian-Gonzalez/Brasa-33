import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRestaurantsStore } from '../store/useRestaurantStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { useSaveRestaurant } from '../hooks/useSaveRestaurant.jsx';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

export const RestaurantModal = ({ isOpen, onClose, restaurant }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const { saveRestaurant } = useSaveRestaurant();
  const loading = useRestaurantsStore((state) => state.loading);

  const logoFile = watch('logo');

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: restaurant?.name || '',
      address: restaurant?.address || '',
      phone: restaurant?.phone || '',
      email: restaurant?.email || '',
      description: restaurant?.description || '',
      category: restaurant?.category || '',
      opening_time: restaurant?.opening_time?.slice?.(0, 5) || restaurant?.opening_time || '',
      closing_time: restaurant?.closing_time?.slice?.(0, 5) || restaurant?.closing_time || '',
    });
  }, [isOpen, restaurant, reset]);

  const onSubmit = async (data) => {
    try {
      await saveRestaurant(data, restaurant?.id);
      showSuccess(restaurant ? 'Restaurante actualizado' : 'Restaurante creado');
      reset();
      onClose();
    } catch {
      showError('Error al guardar restaurante');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4">
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* HEADER */}
        <div
          className="p-4 sm:p-5 text-white sticky top-0 z-10"
          style={{
            background: 'linear-gradient(90deg, #111111 0%, #1A1A1A 100%)',
            borderBottom: '1px solid #333333',
          }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-[#F2F2F2]">
            {restaurant ? 'Editar Restaurante' : 'Nuevo Restaurante'}
          </h2>
          <p className="text-xs sm:text-sm text-[#A6A6A6]">
            Completa la información del restaurante
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 overflow-y-auto">

          {/* LOGO */}
          <div>
            <label className="block text-sm text-[#A6A6A6] mb-1.5">
              Logo del restaurante
            </label>

            {/* Preview si ya tiene logo o se seleccionó uno nuevo */}
            {(logoFile?.[0] || restaurant?.logo_url) && (
              <div className="mb-3 flex justify-center">
                <img
                  src={logoFile?.[0] ? URL.createObjectURL(logoFile[0]) : restaurant.logo_url}
                  alt="Preview"
                  className="h-24 w-24 rounded-xl object-cover border border-[#444]"
                />
              </div>
            )}

            <label
              className="w-full flex items-center justify-center px-3 py-2 rounded-lg border border-dashed border-zinc-600 cursor-pointer transition-colors hover:bg-zinc-800/40"
              style={{ backgroundColor: '#333333', color: '#A6A6A6' }}
            >
              <span className="text-xs font-medium text-center truncate max-w-xs">
                {logoFile?.[0] ? logoFile[0].name : 'Seleccionar imagen...'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                {...register('logo')}
              />
            </label>
          </div>

          {/* NAME */}
          <div>
            <label className="block text-sm text-[#A6A6A6] mb-1.5">Nombre</label>
            <input
              {...register('name', { required: 'Nombre requerido' })}
              className="w-full px-3 py-2 rounded-lg border outline-none"
              style={{ background: '#333333', color: '#F2F2F2', border: '1px solid #333333' }}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-sm text-[#A6A6A6] mb-1.5">Dirección</label>
            <input
              {...register('address', { required: 'Dirección requerida' })}
              className="w-full px-3 py-2 rounded-lg border outline-none"
              style={{ background: '#333333', color: '#F2F2F2', border: '1px solid #333333' }}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm text-[#A6A6A6] mb-1.5">Teléfono</label>
            <input
              {...register('phone', { required: 'Teléfono requerido' })}
              className="w-full px-3 py-2 rounded-lg border outline-none"
              style={{ background: '#333333', color: '#F2F2F2', border: '1px solid #333333' }}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm text-[#A6A6A6] mb-1.5">Correo electrónico</label>
            <input
              {...register('email')}
              type="email"
              placeholder="opcional"
              className="w-full px-3 py-2 rounded-lg border outline-none"
              style={{ background: '#333333', color: '#F2F2F2', border: '1px solid #333333' }}
            />
          </div>

          <div>
            <label className="block text-sm text-[#A6A6A6] mb-1.5">Categoría</label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 rounded-lg border outline-none"
              style={{ background: '#333333', color: '#F2F2F2', border: '1px solid #333333' }}
            >
              <option value="">Seleccionar...</option>
              {['Casual', 'Gourmet', 'Cafetería', 'Comida rápida', 'Fusión', 'Mariscos', 'Parrilla', 'Italiana', 'Mexicana', 'Otro'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[#A6A6A6] mb-1.5">Horario apertura</label>
              <input type="time" {...register('opening_time')} className="w-full px-3 py-2 rounded-lg border outline-none" style={{ background: '#333333', color: '#F2F2F2', border: '1px solid #333333' }} />
            </div>
            <div>
              <label className="block text-sm text-[#A6A6A6] mb-1.5">Horario cierre</label>
              <input type="time" {...register('closing_time')} className="w-full px-3 py-2 rounded-lg border outline-none" style={{ background: '#333333', color: '#F2F2F2', border: '1px solid #333333' }} />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm text-[#A6A6A6] mb-1.5">Descripción</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="opcional"
              className="w-full px-3 py-2 rounded-lg border outline-none resize-none"
              style={{ background: '#333333', color: '#F2F2F2', border: '1px solid #333333' }}
            />
          </div>

          {/* BUTTONS */}
          <div
            className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t"
            style={{ borderColor: '#333333' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-lg"
              style={{ background: '#333333', color: '#F2F2F2' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2 rounded-lg font-medium"
              style={{ background: '#F2F2F2', color: '#0D0D0D', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? <Spinner small /> : restaurant ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
import { useForm } from 'react-hook-form';
import { Spinner } from '../../auth/components/Spinner.jsx';

export const CreateUserModal = ({
  isOpen,
  onClose,
  onCreate,
  loading,
  error,
}) => {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm();

  if (!isOpen) return null;

  const submit = async (values) => {
    const formData = new FormData();

    formData.append('name', values.name);
    formData.append('surname', values.surname);
    formData.append('username', values.username);
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('phone', values.phone);
    if (values.role) formData.append('role', values.role);

    if (values.profilePicture?.[0]) {
      formData.append('profilePicture', values.profilePicture[0]);
    }

    const ok = await onCreate(formData);

    if (ok) {
      reset();
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 flex justify-center items-center z-50 px-4'
      style={{ background: 'rgba(13,13,13,0.85)' }}
    >
      <div
        className='w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl'
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        {/* HEADER */}
        <div
          className='p-5 text-white'
          style={{ background: 'linear-gradient(90deg, var(--orange), var(--orange-deep))' }}
        >
          <h2 className='text-xl font-bold'>Nuevo Usuario</h2>
          <p className='text-sm opacity-80'>
            Completa la información para registrar un nuevo usuario
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(submit)}
          className='p-6 space-y-4 overflow-y-auto'
        >
          {/* NAME + SURNAME */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm text-[var(--text-muted)]'>
                Nombre
              </label>
              <input
                {...register('name', {
                  required: 'El nombre es obligatorio',
                })}
                className='w-full px-3 py-2 rounded-lg outline-none'
                style={{
                  background: '#333333',
                  color: '#F2F2F2',
                  border: '1px solid #333333',
                }}
              />
              {errors.name && (
                <p className='text-red-500 text-xs'>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className='text-sm text-[var(--text-muted)]'>
                Apellido
              </label>
              <input
                {...register('surname', {
                  required: 'El apellido es obligatorio',
                })}
                className='w-full px-3 py-2 rounded-lg outline-none'
                style={{
                  background: '#333333',
                  color: '#F2F2F2',
                  border: '1px solid #333333',
                }}
              />
              {errors.surname && (
                <p className='text-red-500 text-xs'>
                  {errors.surname.message}
                </p>
              )}
            </div>
          </div>

          {/* USER + PHONE */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm text-[var(--text-muted)]'>
                Username
              </label>
              <input
                {...register('username', {
                  required: 'El username es obligatorio',
                })}
                className='w-full px-3 py-2 rounded-lg outline-none'
                style={{
                  background: '#333333',
                  color: '#F2F2F2',
                  border: '1px solid #333333',
                }}
              />
            </div>

            <div>
              <label className='text-sm text-[var(--text-muted)]'>
                Teléfono
              </label>
              <input
                {...register('phone', {
                  required: 'El teléfono es obligatorio',
                })}
                className='w-full px-3 py-2 rounded-lg outline-none'
                style={{
                  background: '#333333',
                  color: '#F2F2F2',
                  border: '1px solid #333333',
                }}
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className='text-sm text-[var(--text-muted)]'>
              Email
            </label>
            <input
              {...register('email', {
                required: 'El email es obligatorio',
              })}
              className='w-full px-3 py-2 rounded-lg outline-none'
              style={{
                background: '#333333',
                color: '#F2F2F2',
                border: '1px solid #333333',
              }}
            />
          </div>

          {/* PASSWORD */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm text-[var(--text-muted)]'>
                Contraseña
              </label>
              <input
                type='password'
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                })}
                className='w-full px-3 py-2 rounded-lg outline-none'
                style={{
                  background: '#333333',
                  color: '#F2F2F2',
                  border: '1px solid #333333',
                }}
              />
            </div>

            <div>
              <label className='text-sm text-[var(--text-muted)]'>
                Confirmar contraseña
              </label>
              <input
                type='password'
                {...register('confirmPassword', {
                  validate: (v) =>
                    v === getValues('password') ||
                    'Las contraseñas no coinciden',
                })}
                className='w-full px-3 py-2 rounded-lg outline-none'
                style={{
                  background: '#333333',
                  color: '#F2F2F2',
                  border: '1px solid #333333',
                }}
              />
            </div>
          </div>

          {/* ROLE */}
          <div>
            <label className='text-sm text-[var(--text-muted)]'>Rol</label>
            <select
              {...register('role')}
              className='w-full px-3 py-2 rounded-lg'
              style={{ background: '#333333', color: '#F2F2F2', border: '1px solid #444' }}
            >
              <option value='CLIENT_ROLE'>Cliente</option>
              <option value='MANAGER_ROLE'>Gerente de Restaurante</option>
              <option value='ADMIN_ROLE'>Administrador</option>
            </select>
          </div>

          {/* FILE */}
          <div>
            <label className='text-sm text-[var(--text-muted)]'>
              Foto de perfil
            </label>
            <input
              type='file'
              {...register('profilePicture')}
              className='w-full px-3 py-2 rounded-lg'
              style={{
                background: '#333333',
                color: '#F2F2F2',
              }}
            />
          </div>

          {error && (
            <p className='text-red-500 text-sm text-center'>{error}</p>
          )}

          {/* ACTIONS */}
          <div className='flex justify-end gap-3 pt-4 border-t border-[var(--border)]'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 rounded-lg text-[var(--text-muted)] hover:bg-white/5'
            >
              Cancelar
            </button>

            <button
              type='submit'
              disabled={loading}
              className='px-5 py-2 rounded-lg text-white font-medium'
              style={{ background: 'linear-gradient(90deg, var(--orange), var(--orange-deep))' }}
            >
              {loading ? <Spinner small /> : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
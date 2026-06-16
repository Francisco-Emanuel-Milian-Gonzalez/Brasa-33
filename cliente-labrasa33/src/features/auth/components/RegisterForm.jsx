import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

export const RegisterForm = ({ onSwitch }) => {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const profileImgFile = watch('profileImage');

  const onSubmit = async (data) => {
    console.debug('[RegisterForm] onSubmit called', data);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('surname', data.surname);
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('phone', data.phone);

    if (data.profileImage && data.profileImage[0]) {
      formData.append('profileImage', data.profileImage[0]);
    }

    const res = await registerUser(formData);
    if (res.success) {
      toast.success('Registro completado. Revisa tu correo para verificar tu cuenta.');
      navigate('/verify-email');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3'>

        {/* Nombre */}
        <div>
          <label htmlFor='name' className='block text-xs font-medium mb-1' style={{ color: '#A6A6A6' }}>
            Nombre
          </label>
          <input
            type='text'
            id='name'
            className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 transition-all outline-none'
            style={{ backgroundColor: '#333333', borderColor: '#333333', color: '#F2F2F2' }}
            {...register('name', { required: 'El nombre es obligatorio' })}
          />
          {errors.name && <p className='text-red-400 text-[11px] mt-0.5'>{errors.name.message}</p>}
        </div>

        {/* Apellido */}
        <div>
          <label htmlFor='surname' className='block text-xs font-medium mb-1' style={{ color: '#A6A6A6' }}>
            Apellido
          </label>
          <input
            type='text'
            id='surname'
            className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 transition-all outline-none'
            style={{ backgroundColor: '#333333', borderColor: '#333333', color: '#F2F2F2' }}
            {...register('surname', { required: 'El apellido es obligatorio' })}
          />
          {errors.surname && <p className='text-red-400 text-[11px] mt-0.5'>{errors.surname.message}</p>}
        </div>

        {/* Nombre de Usuario */}
        <div>
          <label htmlFor='username' className='block text-xs font-medium mb-1' style={{ color: '#A6A6A6' }}>
            Nombre de usuario
          </label>
          <input
            type='text'
            id='username'
            className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 transition-all outline-none'
            style={{ backgroundColor: '#333333', borderColor: '#333333', color: '#F2F2F2' }}
            {...register('username', { required: 'El usuario es obligatorio' })}
          />
          {errors.username && <p className='text-red-400 text-[11px] mt-0.5'>{errors.username.message}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor='phone' className='block text-xs font-medium mb-1' style={{ color: '#A6A6A6' }}>
            Teléfono
          </label>
          <input
            type='tel'
            id='phone'
            className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 transition-all outline-none'
            style={{ backgroundColor: '#333333', borderColor: '#333333', color: '#F2F2F2' }}
            {...register('phone', { required: 'El teléfono es obligatorio' })}
          />
          {errors.phone && <p className='text-red-400 text-[11px] mt-0.5'>{errors.phone.message}</p>}
        </div>

        {/* Correo Electrónico */}
        <div>
          <label htmlFor='email' className='block text-xs font-medium mb-1' style={{ color: '#A6A6A6' }}>
            Correo electrónico
          </label>
          <input
            type='email'
            id='email'
            placeholder='ejemplo@correo.com'
            className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 transition-all outline-none'
            style={{ backgroundColor: '#333333', borderColor: '#333333', color: '#F2F2F2' }}
            {...register('email', {
              required: 'El correo es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Ingresa un correo válido',
              },
            })}
          />
          {errors.email && <p className='text-red-400 text-[11px] mt-0.5'>{errors.email.message}</p>}
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor='password' className='block text-xs font-medium mb-1' style={{ color: '#A6A6A6' }}>
            Contraseña
          </label>
          <input
            type='password'
            id='password'
            placeholder='••••••••'
            className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 transition-all outline-none'
            style={{ backgroundColor: '#333333', borderColor: '#333333', color: '#F2F2F2' }}
            {...register('password', {
              required: 'La contraseña es obligatoria',
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#.])[A-Za-z\d@$!%*?&_\-#.]{8,}$/,
                message: 'Debe tener mayúscula, minúscula, número y carácter especial (@$!%*?&_-#.)',
              },
            })}
          />
          {errors.password
            ? <p className='text-red-400 text-[11px] mt-0.5'>{errors.password.message}</p>
            : <p className='text-[11px] mt-0.5' style={{ color: '#666' }}>Mín. 8 chars, mayúscula, número y símbolo</p>
          }
        </div>

      </div>

      {/* Imagen de Perfil */}
      <div className='flex flex-col mt-2'>
        <span className='block text-xs font-medium mb-1' style={{ color: '#A6A6A6' }}>
          Imagen de perfil
        </span>
        <label
          className='w-full flex flex-col items-center justify-center px-3 py-2 rounded-lg border border-dashed border-zinc-600 cursor-pointer transition-colors hover:bg-zinc-800/40'
          style={{ backgroundColor: '#333333', color: '#A6A6A6' }}
        >
          <span className='text-xs font-medium text-center truncate max-w-xs'>
            {profileImgFile && profileImgFile[0] ? profileImgFile[0].name : 'Seleccionar imagen...'}
          </span>
          <input
            type='file'
            accept='image/*'
            className='hidden'
            {...register('profileImage')}
          />
        </label>
      </div>

      {/* Error del backend */}
      {error && (
        <div
          className='flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs mt-1'
          style={{ backgroundColor: '#2a1a1a', border: '1px solid #7f1d1d', color: '#fca5a5' }}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-3.5 w-3.5 mt-0.5 shrink-0'
            viewBox='0 0 20 20'
            fill='currentColor'
            style={{ color: '#f87171' }}
          >
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Botón de Registro */}
      <button
        type='submit'
        disabled={loading}
        onClick={() => console.debug('[RegisterForm] submit button clicked')}
        className='w-full font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm mt-2 cursor-pointer'
        style={{
          backgroundColor: loading ? '#555555' : '#A6A6A6',
          color: loading ? '#999' : '#0D0D0D',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? (
          <span className='flex items-center justify-center gap-2'>
            <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24' fill='none'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
            </svg>
            Registrando...
          </span>
        ) : 'Registrarse'}
      </button>

      {/* Volver al Login */}
      <p className='text-center text-sm pt-1'>
        <span style={{ color: '#A6A6A6' }}>¿Ya tienes cuenta?{' '}</span>
        <button
          type='button'
          onClick={() => { console.debug('[RegisterForm] switch to login clicked'); onSwitch && onSwitch(); }}
          className='font-medium hover:underline hover:cursor-pointer'
          style={{ color: '#F2F2F2' }}
        >
          Inicia Sesión
        </button>
      </p>
    </form>
  );
};
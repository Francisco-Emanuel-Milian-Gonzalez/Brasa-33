import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const LoginForm = ({ onForgot, onRegister }) => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const res = await login(data);
    if (res.success) {
      navigate('/dashboard');
      toast.success('¡Bienvenido al restaurante La 33!', { duration: 2000 });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <div>
        <label htmlFor='emailOrUsername' className='block text-sm font-medium mb-1.5' style={{ color: '#A6A6A6' }}>
          Correo electrónico
        </label>
        <input
          type='text'
          id='emailOrUsername'
          placeholder='ejemplo@correo.com'
          className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 transition-all'
          style={{ backgroundColor: '#333333', borderColor: '#333333', color: '#F2F2F2', border: '1px solid #333333', outline: 'none' }}
          {...register('emailOrUsername', {
            required: 'El email o username es obligatorio',
          })}
        />
        {errors.emailOrUsername && (
          <p className='text-red-500 text-xs mt-1'>{errors.emailOrUsername.message}</p>
        )}
      </div>

      <div>
        <label htmlFor='password' className='block text-sm font-medium mb-1.5' style={{ color: '#A6A6A6' }}>
          Contraseña
        </label>
        <input
          type='password'
          id='password'
          placeholder='••••••••'
          className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 transition-all'
          style={{ backgroundColor: '#333333', borderColor: '#333333', color: '#F2F2F2', border: '1px solid #333333', outline: 'none' }}
          {...register('password', {
            required: 'La contraseña es obligatoria',
          })}
        />
        {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password.message}</p>}
      </div>

      
      <div className='text-right text-sm'>
        <button
          type='button'
          onClick={onForgot}
          className='hover:underline hover:cursor-pointer'
          style={{ color: '#A6A6A6' }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

      <button
        type='submit'
        disabled={loading}
        className='w-full font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm'
        style={{ backgroundColor: '#A6A6A6', color: '#0D0D0D', opacity: loading ? 0.7 : 1 }}
      >
        Iniciar Sesión
      </button>

      
      <p className='text-center text-sm mt-4'>
        <span style={{ color: '#A6A6A6' }}>¿No tienes cuenta?{' '}</span>
        <button
          type='button'
          onClick={onRegister}
          className='hover:underline hover:cursor-pointer font-semibold'
          style={{ color: '#F2F2F2' }}
        >
          Regístrate
        </button>
      </p>
    </form>
  );
};
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { forgotPassword } from '../../../shared/api/auth.js';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

export const ForgotPassword = ({ onSwitch }) => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
      setSent(true);
      showSuccess('Revisa tu correo para restablecer la contraseña');
    } catch (err) {
      showError(err.response?.data?.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className='space-y-5 text-center'>
        <div className='mx-auto h-14 w-14 rounded-full flex items-center justify-center' style={{ background: 'rgba(225,117,34,0.12)' }}>
          <EnvelopeIcon className='h-7 w-7' style={{ color: '#E17522' }} />
        </div>
        <p className='text-sm' style={{ color: '#A6A6A6' }}>
          Se envió un enlace de recuperación a tu correo. Revisa tu bandeja de
          entrada (y spam).
        </p>
        <button
          type='button'
          onClick={() => onSwitch('LOGIN')}
          className='w-full font-medium py-2.5 px-4 rounded-lg text-sm transition hover:opacity-90'
          style={{ backgroundColor: '#E17522', color: '#fff' }}
        >
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <p className='text-sm' style={{ color: '#A6A6A6' }}>
        Ingresa tu correo y te enviaremos un enlace para restablecer tu
        contraseña.
      </p>

      <div>
        <label
          htmlFor='email'
          className='block text-sm font-medium mb-1.5'
          style={{ color: '#A6A6A6' }}
        >
          Correo electrónico
        </label>
        <input
          type='email'
          id='email'
          placeholder='ejemplo@correo.com'
          className='w-full px-3 py-2 text-sm rounded-lg transition-all outline-none'
          style={{
            backgroundColor: '#333333',
            color: '#F2F2F2',
            border: '1px solid #333333',
          }}
          {...register('email', {
            required: 'El email es obligatorio',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Correo electrónico inválido',
            },
          })}
        />
        {errors.email && (
          <p className='text-red-500 text-xs mt-1'>{errors.email.message}</p>
        )}
      </div>

      <button
        type='submit'
        disabled={loading}
        className='w-full font-medium py-2.5 px-4 rounded-lg text-sm transition hover:opacity-90 disabled:opacity-60'
        style={{ backgroundColor: '#E17522', color: '#fff' }}
      >
        {loading ? 'Enviando…' : 'Recuperar Contraseña'}
      </button>

      <p className='text-center text-sm mt-4'>
        <button
          type='button'
          onClick={() => onSwitch('LOGIN')}
          className='hover:underline font-medium'
          style={{ color: '#A6A6A6' }}
        >
          Volver al Iniciar Sesión
        </button>
      </p>
    </form>
  );
};

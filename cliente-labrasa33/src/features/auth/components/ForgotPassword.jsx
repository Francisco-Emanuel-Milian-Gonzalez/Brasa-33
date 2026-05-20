import { useForm } from 'react-hook-form';

export const ForgotPassword = ({ onSwitch }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log("Recuperar contraseña para:", data.email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <div>
        <label htmlFor='email' className='block text-sm font-medium mb-1.5' style={{ color: '#A6A6A6' }}>
          Correo electrónico
        </label>
        <input
          type='text'
          id='email'
          placeholder='ejemplo@correo.com'
          className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-zinc-500 transition-all'
          style={{ 
            backgroundColor: '#333333', 
            borderColor: '#333333', 
            color: '#F2F2F2', 
            border: '1px solid #333333', 
            outline: 'none' 
          }}
          {...register('email', {
            required: 'El email es obligatorio',
            pattern: {
              value: /^[A-Z0-Y0-9._%+-]+@[A-Z0-Y0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Correo electrónico inválido'
            }
          })}
        />
        {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email.message}</p>}
      </div>

      <button
        type='submit'
        className='w-full font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm hover:opacity-90'
        style={{ backgroundColor: '#A6A6A6', color: '#0D0D0D' }}
      >
        Recuperar Contraseña
      </button>

      
      <p className='text-center text-sm mt-4'>
        <button
          type='button'
          onClick={() => onSwitch('LOGIN')}
          className='hover:underline hover:cursor-pointer font-medium'
          style={{ color: '#A6A6A6' }}
        >
          Volver al Iniciar Sesión
        </button>
      </p>
    </form>
  );
};
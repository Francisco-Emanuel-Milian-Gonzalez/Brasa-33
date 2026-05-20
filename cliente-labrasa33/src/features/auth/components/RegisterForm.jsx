import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

export const RegisterForm = ({ onSwitch }) => {
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
      toast.success('¡Registro completado con éxito!');
      if (res.emailVerificationRequired) {
        toast.info('Por favor, verifica tu correo electrónico.');
      }
      onSwitch(); 
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
            placeholder=''
            className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 transition-all outline-none'
            style={{ backgroundColor: '#333333', borderColor: '#333333', color: '#F2F2F2' }}
            {...register('name', { required: 'El nombre es obligatorio' })}
          />
          {errors.name && <p className='text-red-500 text-[11px] mt-0.5'>{errors.name.message}</p>}
        </div>

        {/* Apellido */}
        <div>
          <label htmlFor='surname' className='block text-xs font-medium mb-1' style={{ color: '#A6A6A6' }}>
            Apellido
          </label>
          <input
            type='text'
            id='surname'
            placeholder=''
            className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 transition-all outline-none'
            style={{ backgroundColor: '#333333', borderColor: '#333333', color: '#F2F2F2' }}
            {...register('surname', { required: 'El apellido es obligatorio' })}
          />
          {errors.surname && <p className='text-red-500 text-[11px] mt-0.5'>{errors.surname.message}</p>}
        </div>

        {/* Nombre de Usuario */}
        <div>
          <label htmlFor='username' className='block text-xs font-medium mb-1' style={{ color: '#A6A6A6' }}>
            Nombre de usuario
          </label>
          <input
            type='text'
            id='username'
            placeholder=''
            className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 transition-all outline-none'
            style={{ backgroundColor: '#333333', borderColor: '#333333', color: '#F2F2F2' }}
            {...register('username', { required: 'El usuario es obligatorio' })}
          />
          {errors.username && <p className='text-red-500 text-[11px] mt-0.5'>{errors.username.message}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor='phone' className='block text-xs font-medium mb-1' style={{ color: '#A6A6A6' }}>
            Teléfono
          </label>
          <input
            type='tel'
            id='phone'
            placeholder=''
            className='w-full px-3 py-2 text-sm rounded-lg focus:ring-2 transition-all outline-none'
            style={{ backgroundColor: '#333333', borderColor: '#333333', color: '#F2F2F2' }}
            {...register('phone', { required: 'El teléfono es obligatorio' })}
          />
          {errors.phone && <p className='text-red-500 text-[11px] mt-0.5'>{errors.phone.message}</p>}
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
            {...register('email', { required: 'El correo es obligatorio' })}
          />
          {errors.email && <p className='text-red-500 text-[11px] mt-0.5'>{errors.email.message}</p>}
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
            {...register('password', { required: 'La contraseña es obligatoria' })}
          />
          {errors.password && <p className='text-red-500 text-[11px] mt-0.5'>{errors.password.message}</p>}
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

      {error && <p className='text-red-500 text-xs text-center mt-2'>{error}</p>}

      {/* Botón de Registro */}
      <button
        type='submit'
        disabled={loading}
        className='w-full font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm mt-2'
        style={{ backgroundColor: '#A6A6A6', color: '#0D0D0D', opacity: loading ? 0.7 : 1 }}
      >
        Registrarse
      </button>

      {/* Volver al Login */}
      <p className='text-center text-sm pt-1'>
        <span style={{ color: '#A6A6A6' }}>¿Ya tienes cuenta?{' '}</span>
        <button
          type='button'
          onClick={onSwitch}
          className='font-medium hover:underline hover:cursor-pointer'
          style={{ color: '#F2F2F2' }}
        >
          Inicia Sesión
        </button>
      </p>
    </form>
  );
};
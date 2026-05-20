import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const KITCHEN_SHAPES = [
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M11 13v6H6v2h12v-2h-5v-6c3.12-.41 5.5-3.08 5.5-6.3V3H6v3.7c0 3.22 2.38 5.89 5.5 6.3z"/></svg>,
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M22 9h-2V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2H2v2h2v7c0 1.66 1.34 3 3 3h10c1.66 0 3-1.34 3-3v-7h2V9zm-6-4h-8V3h8v2z"/></svg>,
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M8.1 13.34l2.83-2.83L3.91 3.5a1.003 1.003 0 00-1.42 1.42l5.61 5.62.01.011.01.01a1 1 0 00-.02 1.78z"/></svg>
];

const floatingIcons = [
  { id: 1, element: KITCHEN_SHAPES[0], size: 45, left: 12, top: 20, opacity: 0.04, rotation: 15, animType: 'animate-pulse' },
  { id: 2, element: KITCHEN_SHAPES[1], size: 55, left: 78, top: 15, opacity: 0.05, rotation: -25, animType: 'animate-bounce' },
  { id: 3, element: KITCHEN_SHAPES[2], size: 40, left: 83, top: 70, opacity: 0.03, rotation: 45, animType: 'animate-pulse' },
];

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    console.log('Nueva contraseña procesada:', data.password);
    toast.success('Contraseña actualizada correctamente');
    navigate('/');
  };

  return (
    <div className='relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden select-none' style={{ backgroundColor: '#0D0D0D' }}>
      
      <div className="flex flex-col items-center mb-6 z-10 text-center">
        <h1 className="text-4xl font-bold tracking-wide" style={{ color: '#F2F2F2' }}>La 33</h1>
        <p className="text-sm mt-1 font-light tracking-wide" style={{ color: '#A6A6A6' }}>Establecer Nueva Contraseña</p>
      </div>

      <div className="relative w-full max-w-md z-10 backdrop-blur-md rounded-2xl p-8 border"
           style={{ backgroundColor: 'rgba(26, 26, 26, 0.45)', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
        
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          
          <div>
            <label htmlFor='password' className='block text-sm font-medium mb-1.5' style={{ color: '#A6A6A6' }}>
              Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5" style={{ color: '#A6A6A6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type='password'
                id='password'
                placeholder='••••••••'
                className='w-full px-3 py-3 text-sm rounded-lg focus:ring-2 focus:ring-zinc-500 transition-all pl-10 outline-none'
                style={{ 
                  backgroundColor: '#333333', 
                  borderColor: '#333333', 
                  color: '#F2F2F2', 
                  border: '1px solid #333333' 
                }}
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                  minLength: { value: 6, message: 'Debe tener al menos 6 caracteres' }
                })}
              />
            </div>
            {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor='confirmPassword' className='block text-sm font-medium mb-1.5' style={{ color: '#A6A6A6' }}>
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5" style={{ color: '#A6A6A6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type='password'
                id='confirmPassword'
                placeholder='••••••••'
                className='w-full px-3 py-3 text-sm rounded-lg focus:ring-2 focus:ring-zinc-500 transition-all pl-10 outline-none'
                style={{ 
                  backgroundColor: '#333333', 
                  borderColor: '#333333', 
                  color: '#F2F2F2', 
                  border: '1px solid #333333' 
                }}
                {...register('confirmPassword', {
                  required: 'Debes confirmar la contraseña',
                  validate: value => value === passwordValue || 'Las contraseñas no coinciden'
                })}
              />
            </div>
            {errors.confirmPassword && <p className='text-red-500 text-xs mt-1'>{errors.confirmPassword.message}</p>}
          </div>

          <button
            type='submit'
            className='w-full font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm hover:opacity-90 mt-2'
            style={{ backgroundColor: '#A6A6A6', color: '#0D0D0D' }}
          >
            Actualizar Contraseña
          </button>
        </form>
      </div>

      <div className='absolute inset-0 overflow-hidden pointer-events-none z-0'>
        {floatingIcons.map((ico) => (
          <div
            key={ico.id}
            className={`absolute select-none ${ico.animType}`}
            style={{
              width: `${ico.size}px`,
              height: `${ico.size}px`,
              left: `${ico.left}%`,
              top: `${ico.top}%`,
              color: '#F2F2F2',
              opacity: ico.opacity,
              transform: `rotate(${ico.rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
          >
            {ico.element}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
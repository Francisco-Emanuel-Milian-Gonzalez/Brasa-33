import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVerifyEmail } from '../hooks/useVerifyEmail';

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

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = new URLSearchParams(location.search).get('token');

  const handleFinish = useCallback(() => {
    setTimeout(() => navigate('/'), 3000);
  }, [navigate]);

  const { status, message } = useVerifyEmail(token, handleFinish);

  const displayMessage = status === 'loading' ? 'Verificando tu cuenta, por favor espera...' : message;

  return (
    <div className='relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden select-none' style={{ backgroundColor: '#0D0D0D' }}>
      
      <div className="flex flex-col items-center mb-6 z-10 text-center">
        <h1 className="text-4xl font-bold tracking-wide" style={{ color: '#F2F2F2' }}>La 33</h1>
        <p className="text-sm mt-1 font-light tracking-wide" style={{ color: '#A6A6A6' }}>Verificación de Correo Electrónico</p>
      </div>

      <div className='relative w-full max-w-md z-10 backdrop-blur-md rounded-2xl p-8 border text-center' 
           style={{ backgroundColor: 'rgba(26, 26, 26, 0.45)', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
        
        <div className='space-y-6'>
          <div className='flex justify-center my-2'>
            {status === 'loading' ? (
              <div className='animate-spin rounded-full h-12 w-12 border-4 border-t-transparent' style={{ borderColor: '#A6A6A6', borderTopColor: 'transparent' }}></div>
            ) : status === 'success' ? (
              <div className='text-green-500 text-5xl bg-green-500/10 h-16 w-16 flex items-center justify-center rounded-full'>✓</div>
            ) : (
              <div className='text-red-500 text-5xl bg-red-500/10 h-16 w-16 flex items-center justify-center rounded-full'>✕</div>
            )}
          </div>

          <p className='text-base leading-relaxed font-medium' style={{ color: '#F2F2F2' }} aria-live='polite'>
            {displayMessage}
          </p>

          <div className='pt-2'>
            <button
              type='button'
              onClick={() => navigate('/')}
              className='w-full font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm hover:opacity-90'
              style={{ backgroundColor: '#A6A6A6', color: '#0D0D0D' }}
            >
              Volver al Inicio
            </button>
          </div>
        </div>
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
            }}
          >
            {ico.element}
          </div>
        ))}
      </div>
    </div>
  );
};
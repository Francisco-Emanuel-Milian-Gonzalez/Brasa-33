import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useVerifyEmail } from '../hooks/useVerifyEmail';

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tokenFromUrl = new URLSearchParams(location.search).get('token');
  const hasToken = Boolean(tokenFromUrl);

  const handleFinish = useCallback(() => {
    setTimeout(() => navigate('/'), 3000);
  }, [navigate]);

  const { status, message } = useVerifyEmail(hasToken ? tokenFromUrl : null, handleFinish);

  const displayMessage = !hasToken
    ? 'Hemos enviado un correo de verificación. Revisa tu bandeja de entrada.'
    : status === 'loading'
      ? 'Verificando tu cuenta, por favor espera...'
      : message;

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      <div className="flex flex-col items-center mb-6 z-10 text-center">
        <h1 className="text-4xl font-bold tracking-wide" style={{ color: '#F2F2F2' }}>La 33</h1>
        <p className="text-sm mt-1 font-light tracking-wide" style={{ color: '#A6A6A6' }}>
          Verificación de Correo Electrónico
        </p>
      </div>

      <div
        className="relative w-full max-w-md z-10 backdrop-blur-md rounded-2xl p-8 border text-center"
        style={{ backgroundColor: 'rgba(26, 26, 26, 0.45)', borderColor: 'rgba(255, 255, 255, 0.06)' }}
      >
        <div className="space-y-6">
          <div className="flex justify-center my-2">
            {!hasToken ? (
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-yellow-500/10">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400" />
              </div>
            ) : status === 'loading' ? (
              <div
                className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
                style={{ borderColor: '#A6A6A6', borderTopColor: 'transparent' }}
              />
            ) : status === 'success' ? (
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-green-500/10">
                <CheckIcon className="h-8 w-8 text-green-500" strokeWidth={2.5} />
              </div>
            ) : (
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-red-500/10">
                <XMarkIcon className="h-8 w-8 text-red-500" strokeWidth={2.5} />
              </div>
            )}
          </div>

          <p className="text-base leading-relaxed font-medium" style={{ color: '#F2F2F2' }} aria-live="polite">
            {displayMessage}
          </p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm hover:opacity-90"
            style={{ backgroundColor: 'transparent', color: '#A6A6A6', border: '1px solid #333' }}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

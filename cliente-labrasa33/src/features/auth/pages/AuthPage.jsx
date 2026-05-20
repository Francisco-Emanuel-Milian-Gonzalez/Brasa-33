import { useState, useEffect } from 'react';
import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPassword } from '../components/ForgotPassword.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';

// Banco de íconos 
const KITCHEN_SHAPES = [
  // 1. Copa de Vino
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M11 13v6H6v2h12v-2h-5v-6c3.12-.41 5.5-3.08 5.5-6.3V3H6v3.7c0 3.22 2.38 5.89 5.5 6.3z"/></svg>,
  
  // 2. Olla de Cocina
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M22 9h-2V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2H2v2h2v7c0 1.66 1.34 3 3 3h10c1.66 0 3-1.34 3-3v-7h2V9zm-6-4h-8V3h8v2z"/></svg>,
  
  // 3. Espátula
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M6 2v8h3v12h2V10h3V2H6zm2 2h1v4H8V4zm3 0h1v4h-1V4zm2 0h1v4h-1V4z"/></svg>,


  
];

export const AuthPage = () => {
  const [authMode, setAuthMode] = useState('login');
  const [floatingIcons, setFloatingIcons] = useState([]);

  useEffect(() => {
    const icons = Array.from({ length: 18 }).map((_, i) => {
      const size = Math.floor(Math.random() * 35) + 45; // Tamaño de 45px a 80px
      const left = Math.floor(Math.random() * 100);
      const top = Math.floor(Math.random() * 100);
      const rotation = Math.floor(Math.random() * 360);
      
      const opacity = (Math.random() * 0.15 + 0.10).toFixed(3); 
      const shapeIndex = Math.floor(Math.random() * KITCHEN_SHAPES.length);
      
      const animDelay = (Math.random() * 6).toFixed(1);
      const animDuration = (Math.floor(Math.random() * 4) + 8).toFixed(0); // 12s a 20s
      
      const animType = i % 3 === 0 ? 'animate-pulse-slow' : i % 3 === 1 ? 'animate-float-slow' : 'animate-combined-slow';

      return { id: i, size, left, top, rotation, opacity, shapeIndex, animDelay, animDuration, animType };
    });
    setFloatingIcons(icons);
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center p-4 relative overflow-hidden' style={{ backgroundColor: '#0D0D0D' }}>
      
      <style>{`
        @keyframes pulseSlow {
          0%, 100% { opacity: var(--base-opacity); }
          50% { opacity: calc(var(--base-opacity) * 2.5 + 0.03); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(var(--base-rotation)); }
          50% { transform: translateY(-25px) translateX(10px) rotate(calc(var(--base-rotation) + 15deg)); }
        }
        @keyframes combinedSlow {
          0%, 100% { 
            transform: translateY(0px) rotate(var(--base-rotation));
            opacity: var(--base-opacity);
          }
          50% { 
            transform: translateY(-20px) translateX(-10px) rotate(calc(var(--base-rotation) - 12deg));
            opacity: calc(var(--base-opacity) * 2.5 + 0.03);
          }
        }
        .animate-pulse-slow {
          animation: pulseSlow var(--anim-duration) ease-in-out infinite;
          animation-delay: var(--anim-delay);
        }
        .animate-float-slow {
          animation: floatSlow var(--anim-duration) ease-in-out infinite;
          animation-delay: var(--anim-delay);
        }
        .animate-combined-slow {
          animation: combinedSlow var(--anim-duration) ease-in-out infinite;
          animation-delay: var(--anim-delay);
        }
      `}</style>

      <div className='w-full max-w-6xl grid gap-10 lg:grid-cols-[420px_1fr] items-center z-10 relative'>
        
        {/* TARJETA DE FORMULARIOS DE AUTENTICACIÓN */}
        <div className='rounded-xl shadow-lg border p-6 md:p-10' style={{ backgroundColor: '#1A1A1A', borderColor: '#333333' }}>
          <div className='flex items-center justify-center mb-2'>
            <img src='/src/assets/img/sarten33.png' alt='Logo La 33' className='h-18 w-20' />
          </div>
          <div className='text-center mb-6'>
            <p className='text-sm uppercase tracking-[0.25em] mb-8' style={{ color: '#A6A6A6' }}>
              La 33
            </p>
            <h1 className='text-2xl lg:text-3xl font-bold mb-2' style={{ color: '#F2F2F2' }}>
              {authMode === 'login' && 'Iniciar Sesión'}
              {authMode === 'forgot' && 'Recuperar Contraseña'}
              {authMode === 'register' && 'Crear Cuenta'}
            </h1>
            <p className='text-base max-w-md mx-auto' style={{ color: '#A6A6A6' }}>
              {authMode === 'forgot' && 'Ingresa tu correo para recuperar la contraseña.'}
              {authMode === 'register' && 'Completa tus datos para registrarte.'}
            </p>
          </div>

          {authMode === 'login' && (
            <LoginForm 
              onForgot={() => setAuthMode('forgot')} 
              onRegister={() => setAuthMode('register')} 
            />
          )}
          {authMode === 'forgot' && (
            <ForgotPassword onSwitch={() => setAuthMode('login')} />
          )}
          {authMode === 'register' && (
            <RegisterForm onSwitch={() => setAuthMode('login')} />
          )}
        </div>

        <div className='hidden lg:flex flex-col justify-center pl-20 h-full min-h-[500px]'>
          <p className='text-4xl font-bold mb-3 tracking-tight' style={{ color: '#F2F2F2' }}>
            Bienvenido al restaurante La 33
          </p>
          
          <p className='text-lg leading-relaxed max-w-lg' style={{ color: '#A6A6A6' }}>
            Disfruta de la experiencia culinaria.
          </p>
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
              '--base-opacity': ico.opacity,
              '--base-rotation': `${ico.rotation}deg`,
              '--anim-delay': `${ico.animDelay}s`,
              '--anim-duration': `${ico.animDuration}s`,
              transform: `rotate(${ico.rotation}deg)`,
              opacity: ico.opacity,
            }}
          >
            {KITCHEN_SHAPES[ico.shapeIndex]}
          </div>
        ))}
      </div>
    </div>
  );
};
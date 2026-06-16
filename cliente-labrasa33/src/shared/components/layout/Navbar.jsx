import imgLogo from '../../../assets/img/sarten33.png';
import { AvatarUser } from '../ui/AvatarUser.jsx';
import { NotificationBell } from '../ui/NotificationBell.jsx';

export const Navbar = () => {
  return (
    <nav className='sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]'>
      
      <div className='mx-auto flex h-20 max-w-[1600px] items-center px-10'>

        <div className='flex flex-1 items-center gap-4'>
          <img
            src={imgLogo}
            alt='La 33 Logo'
            className='h-17 w-17 object-contain'
          />

          <div className='leading-tight'>
            <p className='text-[25px] uppercase tracking-[0.35em] text-[var(--text-muted)]'>
              Restaurante
            </p>
            <h1 className='text-2xl font-semibold text-[var(--text-h)]'>
              La 33
            </h1>
          </div>
        </div>

        <div className='flex flex-1 items-center justify-end gap-5'>

          <NotificationBell />

          <div className='h-8 w-px bg-[var(--border)]' />

          <AvatarUser />
        </div>

      </div>
    </nav>
  );
};
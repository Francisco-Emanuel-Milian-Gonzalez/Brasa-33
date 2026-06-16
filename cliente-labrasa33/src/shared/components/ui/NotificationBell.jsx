import { useEffect, useRef, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import { useNotificationsStore } from '../../store/useNotificationsStore.js';

export const NotificationBell = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead, startPolling, stopPolling } =
    useNotificationsStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    startPolling();
    return () => stopPolling();
  }, [isAuthenticated, startPolling, stopPolling]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) fetchNotifications();
        }}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] transition hover:bg-[var(--bg-hover)]"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border z-50"
          style={{ background: '#1A1A1A', borderColor: '#333' }}
        >
          <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: '#333' }}>
            <span className="text-sm font-semibold text-[#F2F2F2]">Notificaciones</span>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs" style={{ color: '#E17522' }}>
                Marcar todas
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-xs text-center" style={{ color: '#A6A6A6' }}>Sin notificaciones</p>
          ) : (
            <ul className="divide-y" style={{ borderColor: '#2a2a2a' }}>
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => !n.read && markRead(n.id)}
                    className="w-full text-left p-3 hover:bg-white/5 transition"
                    style={{ opacity: n.read ? 0.65 : 1 }}
                  >
                    <p className="text-sm font-medium text-[#F2F2F2]">{n.title}</p>
                    {n.message && <p className="text-xs mt-0.5" style={{ color: '#A6A6A6' }}>{n.message}</p>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

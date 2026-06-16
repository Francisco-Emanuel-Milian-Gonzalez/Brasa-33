import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import {
  updateProfile,
  changePassword,
  deleteMyAccount,
} from '../../../shared/api/auth.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';
import avatarDefault from '../../../assets/img/avatarDefault.png';

const ORANGE = '#E17522';

export const ProfilePage = () => {
  const { user, logout, setUser } = useAuthStore();
  const { openConfirm } = useUIStore();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const profileForm = useForm({
    defaultValues: {
      name: user?.name ?? user?.fullName?.split(' ')[0] ?? '',
      surname: user?.surname ?? '',
      phone: user?.phone ?? '',
    },
  });

  const passwordForm = useForm();

  const onProfileSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('surname', data.surname);
      if (data.phone) formData.append('phone', data.phone);
      const fileInput = document.getElementById('profile-picture-input');
      if (fileInput?.files?.[0]) formData.append('profilePicture', fileInput.files[0]);

      const res = await updateProfile(formData);
      const updated = res.data ?? res;
      setUser({
        ...user,
        name: updated.name,
        surname: updated.surname,
        fullName: `${updated.name} ${updated.surname}`.trim(),
        phone: updated.phone,
        profilePicture: updated.profilePicture,
      });
      showSuccess('Perfil actualizado');
    } catch (err) {
      showError(err.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setLoading(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showSuccess('Contraseña actualizada');
      passwordForm.reset();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    openConfirm({
      title: 'Eliminar cuenta',
      message: 'Esta acción es irreversible. Escribe tu contraseña para confirmar.',
      onConfirm: () => setShowDeleteModal(true),
    });
  };

  const confirmDelete = async () => {
    if (!deletePassword) {
      showError('Ingresa tu contraseña');
      return;
    }
    setLoading(true);
    try {
      await deleteMyAccount({ password: deletePassword });
      logout();
      showSuccess('Cuenta eliminada');
    } catch (err) {
      showError(err.response?.data?.message || 'Error al eliminar cuenta');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const avatarSrc = user?.profilePicture?.trim() || preview || avatarDefault;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>Mi perfil</h1>

      <section className="rounded-2xl border p-6 space-y-4" style={{ background: '#1A1A1A', borderColor: '#333' }}>
        <div className="flex items-center gap-4">
          <img
            src={avatarSrc}
            alt=""
            className="h-20 w-20 rounded-full object-cover border"
            style={{ borderColor: '#333' }}
            onError={(e) => { e.target.onerror = null; e.target.src = avatarDefault; }}
          />
          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: '#A6A6A6' }}>Foto de perfil</label>
            <input
              id="profile-picture-input"
              type="file"
              accept="image/*"
              className="text-xs"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#A6A6A6' }}>Nombre</label>
              <input className="input-dark w-full" {...profileForm.register('name', { required: true })} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#A6A6A6' }}>Apellido</label>
              <input className="input-dark w-full" {...profileForm.register('surname', { required: true })} />
            </div>
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: '#A6A6A6' }}>Teléfono</label>
            <input className="input-dark w-full" {...profileForm.register('phone')} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white"
            style={{ background: ORANGE, opacity: loading ? 0.7 : 1 }}
          >
            Guardar cambios
          </button>
        </form>
      </section>

      <section className="rounded-2xl border p-6" style={{ background: '#1A1A1A', borderColor: '#333' }}>
        <h2 className="font-bold mb-4" style={{ color: '#F2F2F2' }}>Cambiar contraseña</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <input
            type="password"
            placeholder="Contraseña actual"
            className="input-dark w-full"
            {...passwordForm.register('currentPassword', { required: true })}
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            className="input-dark w-full"
            {...passwordForm.register('newPassword', { required: true, minLength: 8 })}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold border"
            style={{ borderColor: '#333', color: '#F2F2F2' }}
          >
            Actualizar contraseña
          </button>
        </form>
      </section>

      <section className="rounded-2xl border p-6" style={{ background: '#1A1A1A', borderColor: 'rgba(239,68,68,0.3)' }}>
        <h2 className="font-bold mb-2 text-red-400">Zona peligrosa</h2>
        <p className="text-sm mb-4" style={{ color: '#A6A6A6' }}>Eliminar tu cuenta de forma permanente.</p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600/20 text-red-400 border border-red-500/30"
        >
          Eliminar cuenta
        </button>
      </section>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4" style={{ background: '#1A1A1A', borderColor: '#333' }}>
            <p className="text-sm" style={{ color: '#F2F2F2' }}>
              Esta acción es irreversible. Escribe tu contraseña para confirmar.
            </p>
            <input
              type="password"
              className="input-dark w-full"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Tu contraseña"
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 rounded-xl border" style={{ borderColor: '#444', color: '#aaa' }}>
                Cancelar
              </button>
              <button type="button" onClick={confirmDelete} disabled={loading} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-semibold">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useEffect, useMemo, useState } from 'react';
import { ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useUserManagementStore } from '../store/useUserManagementStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { CreateUserModal } from './CreateUserModal.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

const PAGE_SIZE = 8;

const ROLE_LABELS = {
  ADMIN_ROLE:   'Administrador',
  MANAGER_ROLE: 'Gerente',
  CLIENT_ROLE:  'Cliente',
};

const ROLE_COLORS = {
  ADMIN_ROLE:   { bg: 'rgba(225,117,34,0.15)', color: '#E17522' },
  MANAGER_ROLE: { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  CLIENT_ROLE:  { bg: 'rgba(255,255,255,0.06)', color: '#A6A6A6' },
};

export const Users = () => {
  const { users, loading, error, getAllUsers, updateUserRole, deleteUser } =
    useUserManagementStore();

  const registerUser = useAuthStore((state) => state.register);

  const [search,          setSearch]          = useState('');
  const [roleFilter,      setRoleFilter]      = useState('ALL');
  const [page,            setPage]            = useState(1);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  // Role-change inline state
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [pendingRole,   setPendingRole]   = useState('');

  useEffect(() => { getAllUsers(); }, [getAllUsers]);
  useEffect(() => { if (error) showError(error); }, [error]);

  const filteredUsers = useMemo(() => {
    const s = search.toLowerCase().trim();
    return users.filter((u) => {
      const name     = `${u.name ?? ''} ${u.surname ?? ''}`.toLowerCase();
      const username = (u.username ?? '').toLowerCase();
      const matchSearch = !s || name.includes(s) || username.includes(s);
      const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const totalPages    = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  const handleCreate = async (formData) => {
    const res = await registerUser(formData);
    if (res.success) {
      showSuccess('Usuario creado');
      await getAllUsers(undefined, { force: true });
      return true;
    }
    showError(res.error);
    return false;
  };

  const handleRoleSave = async (userId) => {
    if (!pendingRole) return setEditingRoleId(null);
    const res = await updateUserRole(userId, pendingRole);
    if (res.success) showSuccess('Rol actualizado');
    else showError(res.error);
    setEditingRoleId(null);
    setPendingRole('');
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`¿Eliminar al usuario @${username}?`)) return;
    const res = await deleteUser(userId);
    if (res.success) showSuccess('Usuario eliminado');
    else showError(res.error);
  };

  if (loading && users.length === 0) return <Spinner />;

  return (
    <div className='p-6'>
      {/* HEADER */}
      <div className='flex flex-wrap justify-between items-center mb-6 gap-3'>
        <div>
          <h1 className='text-3xl font-bold text-[var(--text-h)]'>Usuarios</h1>
          <p className='text-[var(--text-muted)] text-sm'>
            Gestión de usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => setOpenCreateModal(true)}
          className='px-4 py-2 rounded-xl text-white font-medium transition-opacity hover:opacity-90'
          style={{ background: 'linear-gradient(90deg, var(--orange), var(--orange-deep))' }}
        >
          + Agregar Usuario
        </button>
      </div>

      {/* FILTERS */}
      <div
        className='rounded-xl border p-4 mb-4'
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className='grid md:grid-cols-3 gap-3'>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder='Buscar por nombre o username…'
            className='px-3 py-2 rounded-lg outline-none'
            style={{ background: '#333', color: '#fff', border: '1px solid #444' }}
          />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className='px-3 py-2 rounded-lg'
            style={{ background: '#333', color: '#fff', border: '1px solid #444' }}
          >
            <option value='ALL'>Todos los roles</option>
            <option value='ADMIN_ROLE'>Administrador</option>
            <option value='MANAGER_ROLE'>Gerente</option>
            <option value='CLIENT_ROLE'>Cliente</option>
          </select>
          <button
            type="button"
            onClick={() => getAllUsers(undefined, { force: true })}
            className='flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors'
            style={{ background: '#333', color: '#aaa', border: '1px solid #444' }}
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div
        className='rounded-xl border overflow-hidden'
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <table className='w-full text-sm'>
          <thead style={{ background: '#111' }}>
            <tr className='text-left text-[var(--text-muted)]'>
              <th className='p-3'>Nombre</th>
              <th className='p-3 hidden md:table-cell'>Username</th>
              <th className='p-3 hidden md:table-cell'>Email</th>
              <th className='p-3'>Rol</th>
              <th className='p-3 text-right'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className='text-center p-8 text-[var(--text-muted)]'>
                  No hay usuarios
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => {
                const roleStyle = ROLE_COLORS[u.role] ?? ROLE_COLORS.CLIENT_ROLE;
                const isEditing = editingRoleId === u.id;

                return (
                  <tr
                    key={u.id}
                    className='border-t hover:bg-white/5 transition-colors'
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {/* Name */}
                    <td className='p-3 text-[var(--text-h)] font-medium'>
                      {u.name} {u.surname}
                    </td>

                    {/* Username */}
                    <td className='p-3 text-[var(--text-muted)] hidden md:table-cell'>
                      @{u.username}
                    </td>

                    {/* Email */}
                    <td className='p-3 text-[var(--text-muted)] hidden md:table-cell text-xs'>
                      {u.email}
                    </td>

                    {/* Role — inline editor */}
                    <td className='p-3'>
                      {isEditing ? (
                        <div className='flex items-center gap-1'>
                          <select
                            value={pendingRole || u.role}
                            onChange={(e) => setPendingRole(e.target.value)}
                            className='px-2 py-1 rounded text-xs'
                            style={{ background: '#333', color: '#fff', border: '1px solid #555' }}
                          >
                            <option value='ADMIN_ROLE'>Administrador</option>
                            <option value='MANAGER_ROLE'>Gerente</option>
                            <option value='CLIENT_ROLE'>Cliente</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRoleSave(u.id)}
                            className='text-green-400 p-1 hover:text-green-300'
                            aria-label="Guardar rol"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingRoleId(null); setPendingRole(''); }}
                            className='text-red-400 p-1 hover:text-red-300'
                            aria-label="Cancelar"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className='px-2 py-1 rounded-full text-xs cursor-pointer'
                          style={roleStyle}
                          title='Clic para cambiar rol'
                          onClick={() => { setEditingRoleId(u.id); setPendingRole(u.role); }}
                        >
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className='p-3 text-right'>
                      <button
                        onClick={() => handleDelete(u.id, u.username)}
                        className='text-xs px-2 py-1 rounded transition-colors hover:bg-red-500/20'
                        style={{ color: '#ef4444' }}
                        title='Eliminar usuario'
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-2 mt-4'>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className='px-3 py-1 rounded-lg text-sm disabled:opacity-40'
            style={{ background: '#333', color: '#fff' }}
          >
            ← Ant
          </button>
          <span className='text-[var(--text-muted)] text-sm'>
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className='px-3 py-1 rounded-lg text-sm disabled:opacity-40'
            style={{ background: '#333', color: '#fff' }}
          >
            Sig →
          </button>
        </div>
      )}

      {/* CREATE MODAL */}
      <CreateUserModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreate={handleCreate}
        loading={loading}
        error={error}
      />
    </div>
  );
};

// client-user/src/shared/constants/roles.js
export const ROLES = {
  ADMIN: 'ADMIN_ROLE',
  MANAGER: 'MANAGER_ROLE',
  CLIENT: 'CLIENT_ROLE',
};

/** Roles permitidos en la app móvil (admin solo en web). */
export const MOBILE_ALLOWED_ROLES = [ROLES.MANAGER, ROLES.CLIENT];

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.MANAGER]: 'Gerente',
  [ROLES.CLIENT]: 'Cliente',
};

export function isMobileAllowedRole(role) {
  return MOBILE_ALLOWED_ROLES.includes(role);
}

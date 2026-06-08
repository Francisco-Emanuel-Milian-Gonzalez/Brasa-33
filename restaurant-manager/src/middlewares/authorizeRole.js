
const ROLE_NORMALIZE = {
  admin:       'ADMIN_ROLE',
  manager:     'MANAGER_ROLE',
  client:      'CLIENT_ROLE',
  ADMIN:       'ADMIN_ROLE',
  MANAGER:     'MANAGER_ROLE',
  CLIENT:      'CLIENT_ROLE',
  ADMIN_ROLE:  'ADMIN_ROLE',
  MANAGER_ROLE:'MANAGER_ROLE',
  CLIENT_ROLE: 'CLIENT_ROLE',
};

const normalize = (role) => ROLE_NORMALIZE[role] ?? role;

export const authorizeRole = (...roles) => {
  const normalizedAllowed = roles.map(normalize);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado. Token requerido.',
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'El token no contiene información de rol.',
      });
    }

    const userRole = normalize(req.user.role);

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los roles: [${normalizedAllowed.join(', ')}]. Tu rol actual: ${userRole}`,
      });
    }

    req.user.role = userRole;
    next();
  };
};

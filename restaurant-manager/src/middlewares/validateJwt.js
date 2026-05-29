import jwt from 'jsonwebtoken';

export const validateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    const decoded = jwt.verify(token, secret);

    // El auth-service guarda el userId en "sub" (estándar JWT)
    // Lo mapeamos a "id" para que req.user.id funcione en todos los controladores
    req.user = {
      ...decoded,
      id:   decoded.sub,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
};
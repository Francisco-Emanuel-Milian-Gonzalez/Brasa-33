/**
 * Global Error Handler Middleware
 * Maneja todos los errores de la aplicación de forma centralizada
 * Proporciona respuestas estandarizadas en JSON
 */
export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Log del error en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] Error ${status}:`, err);
  }

  // Respuesta estandarizada para errores
  res.status(status).json({
    success: false,
    message,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
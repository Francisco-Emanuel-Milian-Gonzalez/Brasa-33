# 🍽️ Brasa 33 Restaurant Manager API

Este servicio es la API principal del sistema Brasa 33. Aquí se exponen rutas para restaurantes, menú, pedidos, pagos, reservaciones, inventario, reportes y notificaciones. El servicio se integra con un `Auth Service` .NET para la autenticación JWT.

## Stack
- Node.js 18+
- Express 5
- PostgreSQL
- Swagger / OpenAPI
- Helmet, CORS, Rate Limit
- Cloudinary (cargas de imágenes)

## Base URL
- API: `http://localhost:3000/brasa33/v1`
- Swagger: `http://localhost:3000/brasa33/v1/docs`
- Health: `http://localhost:3000/brasa33/v1/health`

## Rutas principales
- `/restaurants`
- `/menu`
- `/orders`
- `/payments`
- `/reservations`
- `/reports`
- `/tables`
- `/reviews`
- `/promotions`
- `/invoices`
- `/admin`
- `/manager`
- `/inventory`
- `/notifications`

> Nota: la autenticación se valida mediante Bearer token emitido por `authentication-service`.

## Requisitos
- Node.js 18+
- npm o pnpm
- PostgreSQL activo y accesible
- `authentication-service` ejecutándose para autenticar peticiones

## Instalación

```bash
cd restaurant-manager
npm install
```

## Variables de entorno
Crea un archivo `.env` con los valores mínimos:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5436
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=brasa33_db
JWT_SECRET=your_jwt_secret_key_here
AUTH_SERVICE_URL=http://localhost:5000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Ejecución

```bash
npm run dev
```

## Endpoints de documentación
- Swagger UI: `http://localhost:3000/brasa33/v1/docs`
- Health check: `http://localhost:3000/brasa33/v1/health`

## Notas
- El servidor usa `BASE_PATH = /brasa33/v1`.
- Toda la documentación de APIs está disponible en Swagger en modo desarrollo.
- La conexión a PostgreSQL se configura en `src/config/db.js`.

## Licencia
ISC

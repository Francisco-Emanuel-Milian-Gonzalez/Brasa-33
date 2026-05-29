# Brasa 33 - Sistema de Gestión de Restaurantes

## Descripción general
Brasa 33 es un sistema de gestión de restaurantes basado en una arquitectura de microservicios. El proyecto incluye servicios para autenticación, API de restaurante, interfaz de cliente y base de datos, todos integrados para gestionar usuarios, restaurantes, menús, inventarios, pedidos, pagos, reservaciones y reportes.

## Servicios incluidos
- `authentication-service`: servicio centralizado en .NET para autenticación, usuarios, JWT y envío de correos.
- `restaurant-manager`: backend en Node.js/Express con APIs para restaurantes, menú, pedidos, pagos, reservaciones, reportes, inventario y notificaciones.
- `cliente-labrasa33`: frontend en React + Vite para usuario final y panel administrativo.
- `postgre_db_b33`: contenedor Docker de PostgreSQL con scripts de inicialización.

## Estructura del repositorio
- `/authentication-service`: servicio de autenticación y usuarios (.NET).
- `/restaurant-manager`: API REST en Node.js/Express.
- `/cliente-labrasa33`: cliente web React.
- `/postgre_db_b33`: PostgreSQL Docker Compose.

## Requisitos generales
- Node.js 18+
- npm o pnpm
- .NET SDK 8+
- Docker y Docker Compose
- PostgreSQL local o en contenedor

## Inicio rápido
1. Levantar la base de datos PostgreSQL:

```bash
cd postgre_db_b33
docker-compose up -d
```

2. Iniciar el servicio de autenticación:

```bash
cd ../authentication-service/auth-service
dotnet run --project src/AuthService.Api/AuthService.Api.csproj
```

3. Iniciar el backend del restaurante:

```bash
cd ../../restaurant-manager
npm install
npm run dev
```

4. Iniciar el cliente React:

```bash
cd ../cliente-labrasa33
pnpm install
pnpm dev
```

## Servicios y documentación
- `authentication-service`: `authentication-service/README.md`
- `restaurant-manager`: `restaurant-manager/README.md`
- `cliente-labrasa33`: `cliente-labrasa33/README.md`
- `postgre_db_b33`: `postgre_db_b33/README.md`

## Notas importantes
- El servicio de restaurant-manager depende de que el `authentication-service` esté activo para la autenticación JWT.
- El contenedor de PostgreSQL expone el puerto `5436` en el host y mantiene los datos en `postgres_data`.
- El frontend usa variables de entorno `VITE_AUTH_URL` y `VITE_ADMIN_URL` para conectarse a los APIs.

## Licencia
Licencia MIT.

# Cliente Brasa33

Interfaz web del sistema Brasa 33, construida con React y Vite. Permite autenticarse, consultar restaurantes, ver menús, realizar pedidos, administrar reservaciones y acceder a funciones administrativas.

## Stack
- React 19
- Vite
- Tailwind CSS
- Zustand
- Axios
- React Router
- Recharts
- jsPDF / xlsx

## Requisitos
- Node.js 18+
- pnpm (recomendado) o npm
- `authentication-service` y `restaurant-manager` en ejecución

## Instalación

```bash
cd cliente-labrasa33
pnpm install
```

## Variables de entorno
El frontend utiliza variables de entorno Vite para apuntar a los servicios de Auth y API.

Crea un archivo `.env` con:

```env
VITE_AUTH_URL=http://localhost:5000
VITE_ADMIN_URL=http://localhost:3000/brasa33/v1
```

## Ejecución en desarrollo

```bash
pnpm dev
```

Esto inicia la aplicación en modo desarrollo con recarga en caliente.

## Build de producción

```bash
pnpm build
pnpm preview
```

## Notas
- El cliente usa `VITE_AUTH_URL` para los endpoints de autenticación.
- `VITE_ADMIN_URL` es la base para las llamadas al backend administrativo de `restaurant-manager`.
- Asegúrate de iniciar primero `authentication-service` y `restaurant-manager`.

## Licencia
MIT

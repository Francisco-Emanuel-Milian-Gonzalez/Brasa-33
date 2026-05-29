# Auth Service Brasa33

Servicio de autenticación centralizado para Brasa 33. Esta API .NET maneja usuarios, login, refresh tokens, roles, envío de correo y JWT.

## Stack
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- Serilog
- Swagger (solo en desarrollo)

## Funciones principales
- Autenticación de usuarios
- Emisión de JWT
- Refresh token
- Control de roles y permisos
- Envío de correos con SMTP
- Migraciones automáticas
- Health checks

## Requisitos
- .NET SDK 8+
- PostgreSQL en `localhost:5436`
- `postgre_db_b33` levantado

## Conexión a base de datos
La configuración por defecto se encuentra en `authentication-service/auth-service/src/AuthService.Api/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=brasa_33_users;Username=IN6AV;Password=In6avKnl!;Port=5436"
}
```

## Ejecución

```bash
cd authentication-service/auth-service
dotnet run --project src/AuthService.Api/AuthService.Api.csproj
```

## Endpoints de salud
- `http://localhost:5000/health`
- `http://localhost:5000/api/v1/health`

## Swagger
Swagger UI está disponible cuando la aplicación se ejecuta en entorno de desarrollo.

## Notas
- El servicio aplica migraciones EF Core automáticamente al iniciar.
- El archivo `appsettings.json` contiene configuración de SMTP y Cloudinary.
- Si modificas credenciales o URLs, usa `appsettings.Development.json` o variables de entorno propias.

## Licencia
MIT

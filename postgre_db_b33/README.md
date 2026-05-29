# PostgreSQL para Brasa33

Este directorio agrupa la configuración de la base de datos PostgreSQL requerida por Brasa 33.

## Contenido
- `docker-compose.yml`: define el servicio PostgreSQL en Docker.
- `init/01_create_restaurant_db.sql`: script de inicialización que se ejecuta al arrancar el contenedor por primera vez.

## Configuración del contenedor
- Imagen: `postgres:13`
- Nombre del contenedor: `brasa_33_users`
- Usuario: `IN6AV`
- Contraseña: `In6avKnl!`
- Base de datos: `brasa_33_users`
- Puerto expuesto: `5436` en el host

## Levantar la base de datos

```bash
cd postgre_db_b33
docker-compose up -d
```

## Detener el contenedor

```bash
docker-compose down
```

## Conexión desde el host

```bash
psql -h localhost -p 5436 -U IN6AV -d brasa_33_users
```

## Notas
- El script `init/01_create_restaurant_db.sql` se ejecuta solo la primera vez que se crea el volumen de datos.
- Si necesitas limpiar el volumen local, detén el contenedor y elimina `postgres_data`.

## Licencia
MIT

-- Crea la base de datos para restaurant-manager si no existe.
-- Este script se ejecuta al iniciar el contenedor por primera vez.
SELECT 'CREATE DATABASE brasa33'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'brasa33')\gexec

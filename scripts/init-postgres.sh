#!/bin/bash

# Script para inicializar PostgreSQL con las migraciones
echo "Esperando a que PostgreSQL esté listo..."

# Esperar a que PostgreSQL esté disponible
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "PostgreSQL no está listo aún, esperando..."
  sleep 2
done

echo "PostgreSQL está listo, ejecutando migraciones..."

# Ejecutar las migraciones
psql -h postgres -p 5432 -U postgres -d mental_health_app -f /docker-entrypoint-initdb.d/0000_yielding_leader.sql

echo "Migraciones completadas exitosamente"



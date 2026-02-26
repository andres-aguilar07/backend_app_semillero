# Backend Docker Setup

## Arranque
```bash
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

## Configuración
- Variables en `docker-compose.yml` (opcionalmente desde `.env`).
- Servicios activos: `app`, `postgres`, `ollama` y `ollama-init`.
- Puertos:
  - API: `3000` (`http://localhost:3000`)
  - Ollama: `11434` (`http://localhost:11434`)
  - Postgres: `5433` en host (mapeado al `5432` interno del contenedor)

## Base de datos (Drizzle ORM)
### Migraciones automáticas al iniciar
La imagen de la app ejecuta `node dist/db/migrate.js` en el arranque, por lo que al levantar con Docker Compose se aplican migraciones automáticamente.

### Flujo recomendado cuando cambias esquemas
1. Genera archivos de migración:
```bash
docker compose exec app npm run db:generate
```
2. Reinicia `app` (o vuelve a levantar el stack) para que se apliquen automáticamente al iniciar:
```bash
docker compose restart app
```

### Comandos útiles (manuales)
```bash
# Aplicar migraciones manualmente (opcional)
docker compose exec app npm run db:migrate

# Correr seeders (data inicial)
docker compose exec app npm run db:seed
```

## Ollama
```bash
curl http://localhost:11434/api/tags

# Forzar descarga del modelo
docker compose exec ollama ollama pull qwen2.5:0.5b
# Cambia OLLAMA_MODEL en docker-compose.yml y reinicia
```

## Pruebas rápidas API
```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"correo\":\"test@test.com\",\"contrasena\":\"12345678\",\"nombres\":\"Test\",\"apellidos\":\"User\"}"
```

## Troubleshooting
```bash
docker compose ps
docker compose logs -f postgres
docker compose logs -f app
docker compose restart app

# Reset total (borra datos)
docker compose down -v
docker compose up -d --build
```

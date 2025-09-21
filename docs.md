# 📚 Docs (compacto)

## 🚀 Arranque
```bash
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

## 🔧 Config
- Vars en `docker-compose.yml` (o `.env`).
- Puertos: API 3000, Ollama 11434, Postgres 5432.

## 🗄️ DB (Drizzle) - ORM
- En contenedor:

Generar la migración de la base de datos
(cada vez que se hace un cambio en el esquema se tiene que hacer)
```bash
docker compose exec app npm run db:generate
```

Migrar los cambios del esquema hacia la base de datos real
```bash
docker compose exec app npm run db:migrate
```

Correr seeders (data inicial) para poder acceder al sistema
```bash
docker compose exec app npm run db:seed
```

## 🤖 Ollama
```bash
curl http://localhost:11434/api/tags

# Forzar descarga
docker compose exec ollama ollama pull qwen2.5:0.5b
# Cambia OLLAMA_MODEL en docker-compose.yml y reinicia
```

## 🧪 API rápido
```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"correo":"test@test.com","contrasena":"12345678","nombres":"Test","apellidos":"User"}'
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"correo":"test@test.com","contrasena":"12345678","tipo":"usuario"}'
curl -X POST http://localhost:3000/api/chats/ia -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -d '{"mensaje":"Hola"}'
```

## 🔍 Troubleshooting
```bash
docker compose ps
docker compose logs -f postgres
docker compose logs -f app
docker compose restart app
# Reset total (⚠️ borra datos)
docker compose down -v && docker compose up -d --build
```

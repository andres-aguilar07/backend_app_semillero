# ##  SSL Setup (Primero)

**Paso 1:** Crear la carpeta SSL

**Ubicación:** Crear una carpeta llamada `ssl` en la **raíz del proyecto** (mismo nivel que `docker-compose.yml`)


```
backend_app_semillero/
├── docker-compose.yml  
├── nginx.conf
├── ssl/              ← Crear esta carpeta vacía
└── src/
```

**Comandos para crear la carpeta**
```bash
# Windows (PowerShell)
if (!(Test-Path "ssl")) { New-Item -ItemType Directory -Path "ssl" }

# Linux/Mac
mkdir -p ssl
```

**Paso 2:** Ejecutar comando Docker para generar certificados
```bash
docker run --rm -v "${PWD}/ssl:/certs" alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/server.key -out /certs/server.crt -subj "/C=CO/ST=Atlantico/L=Barranquilla/O=Semillero_back/OU=IT/CN=localhost"
```

**Resultado esperado:** Después de ejecutar el comando, la estructura debería verse así:
```
backend_app_semillero/
├── docker-compose.yml  
├── nginx.conf
├── ssl/
│   ├── server.crt    ← Certificado generado
│   └── server.key    ← Clave privada generada
└── src/
```

## �🚀 Arranque
```bash
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

## 🔧 Config
- Vars en `docker-compose.yml` (o `.env`).
- Puertos: Nginx 80/443, API 3000, Ollama 11434, Postgres 5432.

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

**A través de nginx:**
```bash
# HTTPS (puerto 443 - no es necesario especificar)
curl -k https://localhost/health
curl -k -X POST https://localhost/api/auth/register -H "Content-Type: application/json" -d '{"correo":"test@test.com","contrasena":"12345678","nombres":"Test","apellidos":"User"}'

# HTTP (puerto 80 - se redirige automáticamente a HTTPS)
curl -L -k http://localhost/health  # -L sigue redirección, -k ignora certificado
curl -L -k -X POST http://localhost/api/auth/register -H "Content-Type: application/json" -d '{"correo":"test@test.com","contrasena":"12345678","nombres":"Test","apellidos":"User"}'

# Opcional: Especificar puertos explícitamente
curl -k https://localhost:443/health  # HTTPS explícito
curl -L -k http://localhost:80/health # HTTP explícito con redirección
```

**⚠️ Notas importantes:** 
- Si ves error "301 Moved Permanently", usa el flag `-L` para seguir redirecciones
- Si ves error "SEC_E_UNTRUSTED_ROOT" o "certificate verify failed", usa el flag `-k` para ignorar certificados autofirmados
- Ambos flags se pueden combinar: `curl -L -k http://localhost/health`

## 🔍 Troubleshooting
```bash
docker compose ps
docker compose logs -f postgres
docker compose logs -f app
docker compose restart app
# Reset total (⚠️ borra datos)
docker compose down -v && docker compose up -d --build
```

# Backend - Mental Health App
Aplicación de evaluación de salud mental con sistema de semáforo (verde, amarillo, rojo) que permite conectar usuarios con psicólogos en caso de alerta.

## Características
- Sistema de semáforo para evaluación de salud mental
- Conexión con psicólogos mediante WebSockets en caso de alerta roja
- Autenticación con JWT
- Integración con OpenAI para análisis de respuestas
- Persistencia de datos con PostgreSQL y Drizzle ORM
- Implementado en TypeScript y Express.js
- Proxy inverso con Nginx y SSL/TLS
- Dockerizado para fácil despliegue

## Requisitos
- Docker y Docker Compose

## Estructura
```
├── drizzle/                 # Migraciones de Drizzle ORM
├── ssl/                     # Certificados SSL para desarrollo
│   ├── server.crt          # Certificado SSL
│   └── server.key          # Clave privada SSL
├── src/
│   ├── config/              # Configuración de la aplicación (JWT)
│   ├── controllers/         # Controladores de API
│   ├── db/                  # Configuración de base de datos y esquemas
│   ├── middleware/          # Middleware de autenticación
│   ├── models/              # Modelos de datos (vacío)
│   ├── routes/              # Rutas de la API
│   ├── services/            # Servicios (OpenAI, etc.)
│   ├── utils/               # Utilidades (vacío)
│   ├── websocket/           # Implementación de WebSockets
│   └── index.ts             # Punto de entrada
├── dist/                    # Código compilado
├── Dockerfile               # Configuración de Docker
├── docker-compose.yml       # Configuración de Docker Compose
├── drizzle.config.ts        # Configuración de Drizzle ORM
├── nginx.conf               # Configuración del proxy inverso
└── package.json             # Dependencias
```

## Notas clave
- Docker Compose levanta App (NODE), Postgres y Ollama.
- Variables en `docker-compose.yml` (también usa `.env`).
- Puertos: Nginx 80/443, API 3000, Ollama 11434, Postgres 5432.

## Guía completa
Consulta `docs.md` para el setup de nginx, arranque, migraciones (npm/pnpm), Ollama y troubleshooting. 
# Mental Health App - Backend

Aplicación de evaluación de salud mental con sistema de semáforo (verde, amarillo, rojo) que permite conectar usuarios con psicólogos en caso de alerta.

## Características

- Sistema de semáforo para evaluación de salud mental
- Conexión con psicólogos mediante WebSockets en caso de alerta roja
- Autenticación con JWT
- Integración con OpenAI para análisis de respuestas
- Persistencia de datos con PostgreSQL y Drizzle ORM
- Implementado en TypeScript y Express.js
- Dockerizado para fácil despliegue

## Requisitos

- Docker y Docker Compose
- PostgreSQL instalado localmente
- Node.js (solo para desarrollo local)
- NPM (solo para desarrollo local)

## Estructura del Proyecto

```
├── drizzle/                 # Migraciones de Drizzle ORM
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
└── package.json             # Dependencias
```

## Configuración

### Variables de Entorno

Las variables de entorno están configuradas directamente en el archivo `docker-compose.yml`:

```yaml
environment:
  - DATABASE_URL=postgresql://user:password@host.docker.internal:5432/mental_health_app
  - JWT_SECRET=your-secret-key-change-in-production
  - OPENAI_API_KEY=your-openai-api-key
  - PORT=3000
```

**Nota:** Asegúrate de cambiar la contraseña (`password`) por la de tu instancia local de PostgreSQL.

## Despliegue con Docker

### Prerrequisitos

1. Asegúrate de tener PostgreSQL instalado y ejecutándose localmente
2. Crea la base de datos `mental_health_app` en tu instancia local de PostgreSQL

### Pasos de despliegue

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/mental-health-app.git
cd mental-health-app
```

2. Actualiza las credenciales de PostgreSQL en `docker-compose.yml` si es necesario

3. Ejecuta Docker Compose:

```bash
docker-compose up --build -d
```

La aplicación se encargará automáticamente de:
- Ejecutar las migraciones de la base de datos
- Poblar la base de datos con datos iniciales (si está vacía)
- Iniciar el servidor en el puerto 3000

La API estará disponible en `http://localhost:3000`.

### Comandos útiles de Docker

```bash
# Ver logs de la aplicación
docker-compose logs app

# Ver logs en tiempo real
docker-compose logs -f app

# Detener la aplicación
docker-compose down

# Reconstruir y ejecutar
docker-compose up --build -d

# Ejecutar comandos dentro del contenedor
docker-compose exec app npm run db:seed
```

## Desarrollo Local

1. Instala las dependencias:

```bash
npm install
```

2. Asegúrate de tener PostgreSQL ejecutándose localmente con la base de datos `mental_health_app`

3. Ejecuta las migraciones:

```bash
npm run db:migrate
```

4. (Opcional) Pobla la base de datos con datos de prueba:

```bash
npm run db:seed
```

5. Inicia el servidor en modo desarrollo:

```bash
npm run dev
```

### Comandos útiles para desarrollo

```bash
# Generar nuevas migraciones
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Poblar base de datos
npm run db:seed

# Compilar TypeScript
npm run build

# Iniciar en producción
npm start
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar un nuevo usuario
- `POST /api/auth/login` - Iniciar sesión (usuario o psicólogo)

### Usuarios
- `GET /api/users/profile` - Obtener perfil del usuario autenticado (requiere autenticación)

### Evaluaciones
- `GET /api/evaluaciones/preguntas` - Obtener todas las preguntas de evaluación

### Psicólogos
- `GET /api/psicologos` - Obtener todos los psicólogos activos

### Chats
- `GET /api/chats` - Obtener chats del usuario autenticado (requiere autenticación)

### Health Check
- `GET /health` - Verificar estado del servidor

## WebSockets

La aplicación utiliza WebSockets para chats en tiempo real entre usuarios y psicólogos. Los eventos disponibles son:

- `authenticate` - Autenticar usuario en la conexión WebSocket
- `chat_message` - Enviar un mensaje en el chat
- `join_chat` - Unirse a una sala de chat específica
- `typing` - Notificar cuando un usuario está escribiendo

## Licencia

MIT 
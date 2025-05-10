# Mental Health App - Backend

Aplicación de evaluación de salud mental con sistema de semáforo (verde, amarillo, rojo) que permite conectar usuarios con psicólogos en caso de alerta.

## Características

- Sistema de semáforo para evaluación de salud mental
- Conexión con psicólogos mediante WebSockets en caso de alerta roja
- Autenticación con JWT
- Integración con OpenAI para análisis de respuestas
- Persistencia de datos con PostgreSQL y Prisma ORM
- Implementado en TypeScript y Express.js
- Dockerizado para fácil despliegue

## Requisitos

- Docker y Docker Compose
- Node.js (solo para desarrollo local)
- NPM o Yarn (solo para desarrollo local)

## Estructura del Proyecto

```
├── prisma/                  # Configuración y esquemas de Prisma ORM
├── src/
│   ├── config/              # Configuración de la aplicación
│   ├── controllers/         # Controladores de API
│   ├── middleware/          # Middleware de autenticación
│   ├── models/              # Modelos de datos
│   ├── routes/              # Rutas de la API
│   ├── services/            # Servicios (OpenAI, etc.)
│   ├── utils/               # Utilidades
│   ├── websocket/           # Implementación de WebSockets
│   └── index.ts             # Punto de entrada
├── Dockerfile               # Configuración de Docker
├── docker-compose.yml       # Configuración de Docker Compose
└── package.json             # Dependencias
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
DATABASE_URL="postgresql://postgres:postgres@db:5432/mental_health_app"
JWT_SECRET="your-secret-key-change-in-production"
OPENAI_API_KEY="your-openai-api-key"
PORT=3000
```

## Despliegue con Docker

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/mental-health-app.git
cd mental-health-app
```

2. Crea el archivo `.env` con las variables necesarias (ver arriba)

3. Ejecuta Docker Compose:

```bash
docker-compose up -d
```

4. Ejecuta las migraciones de la base de datos:

```bash
docker-compose exec app npx prisma migrate dev
```

5. (Opcional) Carga datos de prueba:

```bash
docker-compose exec app npm run seed
```

La API estará disponible en `http://localhost:3000`.

## Desarrollo Local

1. Instala las dependencias:

```bash
npm install
```

2. Configura la variable de entorno `DATABASE_URL` para apuntar a tu base de datos local.

3. Ejecuta las migraciones:

```bash
npx prisma migrate dev
```

4. Inicia el servidor en modo desarrollo:

```bash
npm run dev
```

## API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar un nuevo usuario
- `POST /api/auth/login` - Iniciar sesión (usuario o psicólogo)

### Evaluaciones

- `GET /api/evaluaciones/preguntas` - Obtener todas las preguntas
- `POST /api/evaluaciones` - Crear una nueva evaluación
- `GET /api/evaluaciones` - Obtener historial de evaluaciones del usuario
- `GET /api/evaluaciones/:id` - Obtener detalles de una evaluación

### Chats

- `GET /api/chats` - Obtener chats del usuario
- `GET /api/chats/:id/mensajes` - Obtener mensajes de un chat
- `POST /api/chats/:id/mensajes` - Enviar un mensaje

## WebSockets

La aplicación utiliza WebSockets para chats en tiempo real entre usuarios y psicólogos. Los eventos disponibles son:

- `authenticate` - Autenticar usuario en la conexión WebSocket
- `chat_message` - Enviar un mensaje en el chat
- `join_chat` - Unirse a una sala de chat específica
- `typing` - Notificar cuando un usuario está escribiendo

## Licencia

MIT 
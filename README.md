# Semáforo de Salud Mental - API

Aplicación backend para evaluación de salud mental mediante un sistema tipo semáforo, con conexión a psicólogos en caso de alertas.

## Características

- Evaluación de salud mental con clasificación semáforo (verde, amarillo, rojo)
- Integración con ChatGPT para análisis de respuestas
- Conexión con psicólogos mediante WebSockets para pacientes en estado crítico
- API RESTful con FastAPI
- Autenticación con JWT
- Base de datos PostgreSQL
- Contenedorización con Docker

## Requisitos

- Docker
- Docker Compose
- Clave API de OpenAI

## Configuración

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd backend-app-semillero
```

2. Crear un archivo `.env` en la raíz del proyecto con la siguiente información:
```
OPENAI_API_KEY=tu_clave_api_openai
FIRST_SUPERUSER_EMAIL=admin@example.com
FIRST_SUPERUSER_PASSWORD=contraseña_segura
```

## Ejecución

1. Iniciar los servicios con Docker Compose:
```bash
docker-compose up -d
```

2. La API estará disponible en http://localhost:8000

3. Documentación interactiva disponible en http://localhost:8000/docs

## Endpoints Principales

- `/api/auth/register` - Registro de usuarios
- `/api/auth/login` - Inicio de sesión (obtener token JWT)
- `/api/assessment/questions` - Obtener preguntas para evaluación
- `/api/assessment/submit` - Enviar respuestas y obtener evaluación
- `/api/assessment/history` - Historial de evaluaciones del usuario
- `/ws/patient` - WebSocket para pacientes que necesitan ayuda
- `/ws/psychologist` - WebSocket para psicólogos que ofrecen ayuda

## Funcionamiento del Sistema de Semáforo

- **Verde**: Estado mental óptimo, sin signos de problemas emocionales significativos.
- **Amarillo**: Estado de precaución, con algunos signos de estrés, ansiedad leve o tristeza que requieren atención.
- **Rojo**: Estado de alerta, con señales claras de depresión, ansiedad severa, pensamientos negativos recurrentes o ideación suicida.

## Desarrollo

Para contribuir al proyecto:

1. Crear una rama para tu funcionalidad:
```bash
git checkout -b feature/nombre-funcionalidad
```

2. Realizar cambios y confirmarlos:
```bash
git add .
git commit -m "Descripción de los cambios"
```

3. Enviar cambios al repositorio:
```bash
git push origin feature/nombre-funcionalidad
```

4. Crear un Pull Request para revisión.

## Licencia

[MIT](LICENSE) 
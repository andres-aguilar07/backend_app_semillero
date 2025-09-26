
# API

- Base URL: http://localhost:3000
- Formato de respuesta: JSON
- Autenticación: para rutas privadas, enviar el encabezado `Authorization: Bearer <token>`

## Auth
- POST /api/auth/register — Registrar un nuevo usuario — Público
- POST /api/auth/login — Iniciar sesión y obtener token — Público

## Usuarios
- GET /api/users/profile — Obtener perfil del usuario autenticado — Privado (requiere token, rol Usuario)
- GET /api/users — Listar usuarios — Privado (Admin)
  - Params: ninguno
  - Query opcional: page:number, limit:number, search:string
- POST /api/users — Crear usuario — Privado (Admin)
  - Body (JSON):
    - nombres:string (requerido)
    - apellidos:string (requerido)
    - correo:string (requerido, único)
    - contrasena:string (requerido)
    - id_rol:number (opcional)
    - ciudad?:string, semestre_actual?:string, telefono?:string, edad?:number, sexo?:"M"|"F"|string, fecha_nacimiento?:ISO8601, idioma?:string, especialidad_psicologo?:string, is_active?:boolean
- GET /api/users/:id — Obtener usuario por ID — Privado (Admin o dueño)
  - Params: id:number
- PUT /api/users/:id — Actualizar usuario (reemplazo completo) — Privado (Admin o dueño)
  - Params: id:number
  - Body (JSON): mismos campos que POST (todos los requeridos)
- PATCH /api/users/:id — Actualizar usuario (parcial) — Privado (Admin o dueño)
  - Params: id:number
  - Body (JSON): cualquier subconjunto de los campos de usuario
- DELETE /api/users/:id — Eliminar usuario — Privado (Admin)
  - Params: id:number

## Evaluaciones
- GET /api/evaluaciones/preguntas — Obtener todas las preguntas de la evaluación — Público
- POST /api/evaluaciones — Crear una nueva evaluación — Privado (Usuarios)
  - Body (JSON):
    - usuario_id?:number (si no se infiere del token)
    - puntaje_total?:number
    - estado_semaforo?:string
    - observaciones?:string
- GET /api/evaluaciones — Listar evaluaciones del usuario autenticado — Privado (Usuarios)
  - Query opcional: page:number, limit:number
- GET /api/evaluaciones/:id — Obtener evaluación por ID — Privado (Usuarios)
  - Params: id:number

## Encuestas
- GET /api/encuestas — Listar encuestas — Privado (Admin)
  - Query opcional: page:number, limit:number
- GET /api/encuestas/:id — Obtener encuesta por ID — Privado (Admin)
  - Params: id:number
- POST /api/encuestas — Crear encuesta — Privado (Admin)
  - Body (JSON):
    - codigo:string (requerido, único)
    - titulo:string (requerido)
    - opciones:any (JSON, opcional)
- PUT /api/encuestas/:id — Actualizar encuesta (completo) — Privado (Admin)
  - Params: id:number
  - Body (JSON): codigo:string, titulo:string, opciones:any
- PATCH /api/encuestas/:id — Actualizar encuesta (parcial) — Privado (Admin)
  - Params: id:number
  - Body (JSON): cualquier subconjunto
- DELETE /api/encuestas/:id — Eliminar encuesta — Privado (Admin)
  - Params: id:number

## Encuestas Respuestas
- GET /api/encuestas-respuestas — Listar respuestas de encuestas — Privado
  - Query opcional: usuario_id:number, encuesta_id:number, page:number, limit:number
- GET /api/encuestas-respuestas/:id — Obtener respuesta por ID — Privado
  - Params: id:number
- POST /api/encuestas-respuestas — Crear respuesta a encuesta — Privado (Usuario)
  - Body (JSON):
    - usuario_id?:number (si no se infiere del token)
    - encuesta_id:number (requerido)
    - respuesta:any (JSON, requerido)
- PUT /api/encuestas-respuestas/:id — Actualizar respuesta (completo) — Privado
  - Params: id:number
  - Body (JSON): usuario_id:number, encuesta_id:number, respuesta:any
- PATCH /api/encuestas-respuestas/:id — Actualizar respuesta (parcial) — Privado
  - Params: id:number
  - Body (JSON): cualquier subconjunto
- DELETE /api/encuestas-respuestas/:id — Eliminar respuesta — Privado
  - Params: id:number

## Chats
- GET /api/chats — Obtener todos los chats del usuario autenticado — Privado
- GET /api/chats/:id — Obtener chat por ID — Privado
  - Params: id:number
- POST /api/chats — Crear chat — Privado
  - Body (JSON):
    - estudiante_id?:number (si no se infiere del token)
    - psicologo_id?:number (si aplica)
    - is_active?:boolean, isSendByAi?:boolean
- PUT /api/chats/:id — Actualizar chat (completo) — Privado
  - Params: id:number
  - Body (JSON): estudiante_id?:number, psicologo_id?:number, finalizado_en?:ISO8601, is_active?:boolean, isSendByAi?:boolean
- PATCH /api/chats/:id — Actualizar chat (parcial) — Privado
  - Params: id:number
  - Body (JSON): cualquier subconjunto
- DELETE /api/chats/:id — Eliminar chat — Privado
  - Params: id:number

### Mensajes de Chat
- GET /api/chats/:chatId/mensajes — Listar mensajes de un chat — Privado
  - Params: chatId:number
  - Query opcional: page:number, limit:number
- GET /api/chats/:chatId/mensajes/:mensajeId — Obtener mensaje por ID — Privado
  - Params: chatId:number, mensajeId:number
- POST /api/chats/:chatId/mensajes — Enviar mensaje — Privado
  - Params: chatId:number
  - Body (JSON):
    - mensaje:string (requerido)
    - usuario_id?:number (si no se infiere del token)
- PUT /api/chats/:chatId/mensajes/:mensajeId — Actualizar mensaje (completo) — Privado
  - Params: chatId:number, mensajeId:number
  - Body (JSON): mensaje:string
- PATCH /api/chats/:chatId/mensajes/:mensajeId — Actualizar mensaje (parcial) — Privado
  - Params: chatId:number, mensajeId:number
  - Body (JSON): mensaje?:string
- DELETE /api/chats/:chatId/mensajes/:mensajeId — Eliminar mensaje — Privado
  - Params: chatId:number, mensajeId:number

## Diario
- GET /api/diario — Listar entradas del diario del usuario — Privado (Usuario)
  - Query opcional: page:number, limit:number
- GET /api/diario/:id — Obtener entrada por ID — Privado (Usuario)
  - Params: id:number
- POST /api/diario — Crear entrada de diario — Privado (Usuario)
  - Body (JSON):
    - titulo:string (requerido)
    - contenido:string (requerido)
    - fecha?:ISO8601
- PUT /api/diario/:id — Actualizar entrada (completo) — Privado (Usuario)
  - Params: id:number
  - Body (JSON): titulo:string, contenido:string, fecha?:ISO8601
- PATCH /api/diario/:id — Actualizar entrada (parcial) — Privado (Usuario)
  - Params: id:number
  - Body (JSON): cualquier subconjunto
- DELETE /api/diario/:id — Eliminar entrada — Privado (Usuario)
  - Params: id:number

## Opciones de Registro de Actividades
- GET /api/opciones-actividades — Listar opciones — Privado (Admin)
- GET /api/opciones-actividades/:id — Obtener opción por ID — Privado (Admin)
  - Params: id:number
- POST /api/opciones-actividades — Crear opción — Privado (Admin)
  - Body (JSON):
    - nombre:string (requerido)
    - descripcion?:string
    - url_imagen:string (requerido)
- PUT /api/opciones-actividades/:id — Actualizar opción (completo) — Privado (Admin)
  - Params: id:number
  - Body (JSON): nombre:string, descripcion?:string, url_imagen:string
- PATCH /api/opciones-actividades/:id — Actualizar opción (parcial) — Privado (Admin)
  - Params: id:number
  - Body (JSON): cualquier subconjunto
- DELETE /api/opciones-actividades/:id — Eliminar opción — Privado (Admin)
  - Params: id:number

## Registro de Actividades de Usuarios
- GET /api/registro-actividades — Listar registros del usuario — Privado (Usuario)
  - Query opcional: page:number, limit:number, opcion_id?:number
- GET /api/registro-actividades/:id — Obtener registro por ID — Privado (Usuario)
  - Params: id:number
- POST /api/registro-actividades — Crear registro — Privado (Usuario)
  - Body (JSON):
    - opcion_id:number (requerido)
    - vencimiento?:ISO8601
    - fecha?:ISO8601
    - observaciones?:string
- PUT /api/registro-actividades/:id — Actualizar registro (completo) — Privado (Usuario)
  - Params: id:number
  - Body (JSON): opcion_id:number, vencimiento?:ISO8601, fecha?:ISO8601, observaciones?:string
- PATCH /api/registro-actividades/:id — Actualizar registro (parcial) — Privado (Usuario)
  - Params: id:number
  - Body (JSON): cualquier subconjunto
- DELETE /api/registro-actividades/:id — Eliminar registro — Privado (Usuario)
  - Params: id:number

## Chats IA
- POST /api/chats/ia — Chatear con IA (Ollama) — Privado
  - Body (JSON): { prompt:string }
- GET /api/chats/ia/historial — Obtener historial de chat con IA — Privado

## Salud
- GET /health — Verificación de estado del servidor — Público
# 🚀 Comandos del Proyecto - Mental Health App con IA

## 🔧 Primeros pasos

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd backend-app-semillero
```

2. **⚠️ NO necesitas crear archivo `.env`** - Las variables están en `docker-compose.yml`

3. Asegúrate de tener Docker y Docker Compose instalados.

## 🤖 Ejecución con Ollama (IA Local)

Para iniciar la aplicación completa con IA local:

```bash
# Construir y levantar todos los servicios (incluye Ollama)
docker-compose up --build -d

# Monitorear la descarga inicial del modelo IA
docker-compose logs -f ollama-init
```

**🎯 La primera vez descargará automáticamente el modelo Qwen2.5:0.5b (~500MB)**

## 📊 Verificar que todo funciona

```bash
# Verificar API principal
curl http://localhost:3000/health

# Verificar que Ollama está funcionando
curl http://localhost:11434/api/tags

# Ver logs de la aplicación
docker-compose logs -f app
```

## 🧪 Probar la IA

```bash
# 1. Registrar un usuario de prueba
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "test@test.com",
    "contrasena": "12345678",
    "nombres": "Test",
    "apellidos": "User"
  }'

# 2. Hacer login para obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "test@test.com",
    "contrasena": "12345678",
    "tipo": "usuario"
  }'

# 3. Usar el token para probar chat con IA
curl -X POST http://localhost:3000/api/chats/ia \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{"mensaje": "¿Cómo puedo mejorar mi estado de ánimo?"}'
```

## 🗄️ Base de Datos

Las migraciones y datos de prueba se ejecutan automáticamente:

```bash
# Ver logs de inicialización
docker-compose logs app | grep -i "database\|migration\|seed"

# Ejecutar migraciones manualmente (si es necesario)
docker-compose exec app npm run db:migrate

# Cargar datos de prueba manualmente
docker-compose exec app npm run db:seed
```

## 👥 Credenciales de Prueba

Usuarios (se crean automáticamente):
- Correo: `usuario1@example.com`, Contraseña: `Contrasena123` (estado verde)
- Correo: `usuario2@example.com`, Contraseña: `Contrasena123` (estado amarillo)  
- Correo: `usuario3@example.com`, Contraseña: `Contrasena123` (estado rojo)

Psicólogos:
- Correo: `psicologo1@example.com`
- Correo: `psicologo2@example.com`

## 🔧 Comandos de Desarrollo

### Gestión de Contenedores
```bash
# Ver estado de servicios
docker-compose ps

# Reiniciar servicios
docker-compose restart

# Ver logs específicos
docker-compose logs -f ollama
docker-compose logs -f app

# Parar todo
docker-compose down

# Limpiar completamente (⚠️ elimina datos)
docker-compose down -v
```

### Gestión de Modelos IA
```bash
# Listar modelos instalados
docker-compose exec ollama ollama list

# Descargar modelo específico
docker-compose exec ollama ollama pull qwen2.5:0.5b

# Probar modelo directamente
docker-compose exec ollama ollama run qwen2.5:0.5b "Hola, ¿cómo estás?"
```

### Desarrollo Local (sin Docker)
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
export USE_OLLAMA=false
export OPENAI_API_KEY=tu-api-key

# Ejecutar en desarrollo
npm run dev
```

## 🚀 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión

### IA y Evaluaciones  
- `POST /api/chats/ia` - Chat con IA local 🤖
- `POST /api/evaluaciones` - Crear evaluación con análisis IA
- `GET /api/evaluaciones/preguntas` - Obtener preguntas

### Usuarios y Chats
- `GET /api/users/profile` - Perfil del usuario
- `GET /api/chats` - Chats del usuario
- `GET /api/psicologos` - Lista de psicólogos

## 🔍 Troubleshooting

### Problema: "Ollama no disponible"
```bash
# Verificar que Ollama esté corriendo
docker-compose ps ollama

# Reiniciar Ollama
docker-compose restart ollama

# Ver logs de Ollama
docker-compose logs ollama
```

### Problema: "Modelo no encontrado"
```bash
# Forzar descarga del modelo
docker-compose exec ollama ollama pull qwen2.5:0.5b

# O reiniciar el inicializador
docker-compose up ollama-init
```

### Problema: "Out of memory"
```bash
# Verificar uso de recursos
docker stats

# El modelo Qwen2.5:0.5b necesita ~1GB RAM
# Si no tienes suficiente, usa OpenAI en su lugar:
# Cambiar USE_OLLAMA=false en docker-compose.yml
```

## 📋 Configuración Avanzada

### Cambiar Modelo IA
Editar `docker-compose.yml`:
```yaml
environment:
  - OLLAMA_MODEL=llama3.2:1b  # Cambiar aquí
```

### Usar OpenAI en lugar de Ollama
```yaml
environment:
  - USE_OLLAMA=false
  - OPENAI_API_KEY=tu-api-key
```

### Monitoreo
```bash
# Uso de recursos
docker stats

# Logs en tiempo real
docker-compose logs -f

# Salud de servicios
curl http://localhost:3000/health
curl http://localhost:11434/api/tags
```

---

📚 **Para más detalles sobre Ollama, ver: [OLLAMA-SETUP.md](./OLLAMA-SETUP.md)** 
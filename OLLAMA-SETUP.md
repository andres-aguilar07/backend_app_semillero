# 🤖 Configuración de Ollama - IA Local

Este documento explica cómo usar la integración de Ollama para generar respuestas de IA de manera local y persistente.

## 🚀 Características

- **🔒 Privacidad Total**: Los datos no salen de tu servidor
- **💰 Sin Costos**: No hay límites de API ni costos por token
- **⚡ Respuestas Rápidas**: IA local sin latencia de red
- **💾 Persistencia**: El modelo se mantiene descargado entre reinicios
- **🎯 Modelo Ultra-Liviano**: Qwen2.5:0.5b (~500MB)

## 📋 Requisitos del Sistema

- **RAM**: Mínimo 2GB libres (recomendado 4GB)
- **Almacenamiento**: ~1GB para el modelo
- **CPU**: Cualquier CPU moderna (GPU opcional)

## 🛠️ Instalación y Uso

### 1. Levantar los Servicios

```bash
# Construir y levantar todos los contenedores
docker-compose up --build

# O en segundo plano
docker-compose up --build -d
```

### 2. Primera Ejecución

La primera vez que ejecutes el sistema:

1. **Ollama se iniciará** automáticamente
2. **El modelo Qwen2.5:0.5b se descargará** automáticamente (~500MB)
3. **La aplicación se conectará** a Ollama automáticamente

```bash
# Monitorear el proceso de descarga
docker-compose logs -f ollama-init
```

### 3. Verificar que Todo Funciona

```bash
# Verificar estado de salud
curl http://localhost:3000/health

# Verificar modelos disponibles en Ollama
curl http://localhost:11434/api/tags

# Probar chat con IA
curl -X POST http://localhost:3000/api/chats/ia \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{"mensaje": "Hola, ¿cómo estás?"}'
```

## 🌐 Endpoints Disponibles

### Chat con IA
```http
POST /api/chats/ia
Authorization: Bearer <token>
Content-Type: application/json

{
  "mensaje": "Tu pregunta aquí",
  "contexto": "Contexto opcional"
}
```

### Evaluaciones con IA
```http
POST /api/evaluaciones
Authorization: Bearer <token>
Content-Type: application/json

{
  "respuestas": [
    {"pregunta_id": 1, "respuesta": 3},
    {"pregunta_id": 2, "respuesta": 2}
  ],
  "observaciones": "Observaciones opcionales"
}
```

## ⚙️ Configuración

### Variables de Entorno

En `docker-compose.yml`:

```yaml
environment:
  - USE_OLLAMA=true                    # Habilitar Ollama
  - OLLAMA_API_URL=http://ollama:11434 # URL de Ollama
  - OLLAMA_MODEL=qwen2.5:0.5b          # Modelo a usar
```

### Cambiar de Modelo

Para usar un modelo diferente:

1. Modificar `OLLAMA_MODEL` en `docker-compose.yml`
2. Reiniciar los servicios

```bash
# Modelos disponibles (más livianos primero):
# - qwen2.5:0.5b    (~500MB) - Ultra liviano
# - llama3.2:1b     (~1.3GB) - Liviano 
# - deepseek-coder:1.3b (~1.3GB) - Para código
# - gemma2:2b       (~1.6GB) - Más potente
```

## 🔧 Administración

### Ver Logs
```bash
# Logs de la aplicación
docker-compose logs -f app

# Logs de Ollama
docker-compose logs -f ollama

# Logs de inicialización
docker-compose logs ollama-init
```

### Limpiar y Reiniciar
```bash
# Reiniciar servicios
docker-compose restart

# Reconstruir todo
docker-compose down
docker-compose up --build
```

### Persistencia de Datos
```bash
# Los modelos se guardan en el volumen Docker
docker volume ls | grep ollama

# Para eliminar completamente (forzar re-descarga)
docker-compose down -v
```

## 🐛 Solución de Problemas

### Error: "Ollama no disponible"
```bash
# Verificar que Ollama esté corriendo
docker-compose ps ollama

# Verificar conectividad
curl http://localhost:11434/api/tags
```

### Error: "Modelo no encontrado"
```bash
# Descargar modelo manualmente
docker-compose exec ollama ollama pull qwen2.5:0.5b

# O reiniciar el servicio de inicialización
docker-compose up ollama-init
```

### Error: "Out of memory"
```bash
# Usar un modelo más pequeño
# Cambiar OLLAMA_MODEL a qwen2.5:0.5b en docker-compose.yml
```

## 📊 Monitoreo de Rendimiento

### Uso de Recursos
```bash
# Ver uso de CPU y memoria
docker stats

# Específico de Ollama
docker stats $(docker-compose ps -q ollama)
```

### Tiempo de Respuesta
- **Primera consulta**: ~2-5 segundos (carga del modelo)
- **Consultas subsecuentes**: ~0.5-2 segundos
- **Evaluaciones**: ~3-8 segundos (análisis complejo)

## 🔄 Migración desde OpenAI

El sistema mantiene compatibilidad con OpenAI:

```yaml
# Para usar OpenAI en lugar de Ollama
environment:
  - USE_OLLAMA=false
  - OPENAI_API_KEY=tu-api-key
```

## 📈 Escalabilidad

### Para Mayor Rendimiento
1. **Usar GPU**: Agregar `runtime: nvidia` al servicio ollama
2. **Más RAM**: Asignar más memoria al contenedor
3. **Modelo más grande**: Cambiar a `llama3.2:3b` o `gemma2:7b`

### Para Menor Consumo
1. **Modelo mínimo**: Usar `qwen2.5:0.5b`
2. **Limitar memoria**: Agregar `mem_limit: 2g` al servicio
3. **CPU throttling**: Usar `cpus: 1.0`

## 🎯 Próximos Pasos

- [ ] Implementar cache de respuestas
- [ ] Agregar métricas de uso
- [ ] Soporte para múltiples modelos
- [ ] Interface web para administración

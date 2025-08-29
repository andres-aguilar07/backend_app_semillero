# 🤖 Chat con Ollama - Git Bash

Script súper simple para chatear con tu IA local desde la línea de comandos usando Git Bash.

## 🚀 Cómo Usar

### 1. Hacer el script ejecutable (solo la primera vez)
```bash
chmod +x chat-ollama.sh
```

### 2. Asegúrate de que Ollama esté corriendo
```bash
docker-compose up -d
```

### 3. ¡Chatea con la IA!
```bash
./chat-ollama.sh "Tu mensaje aquí"
```

## 📝 Ejemplos Prácticos

```bash
# Saludo simple
./chat-ollama.sh "Hola, ¿cómo estás?"

# Preguntas de salud mental (tu especialidad)
./chat-ollama.sh "Dame 5 consejos para reducir la ansiedad"
./chat-ollama.sh "¿Cómo puedo mejorar mi estado de ánimo cuando me siento triste?"
./chat-ollama.sh "Técnicas de respiración para relajarme"

# Preguntas técnicas
./chat-ollama.sh "Explícame qué es Docker en términos simples"
./chat-ollama.sh "¿Cuál es la diferencia entre let y const en JavaScript?"
./chat-ollama.sh "¿Qué es una API REST?"

# Preguntas de aprendizaje
./chat-ollama.sh "Explícame machine learning como si tuviera 10 años"
./chat-ollama.sh "¿Cuáles son las mejores prácticas para estudiar programación?"
```

## ✨ Características

- **🎨 Interfaz colorida** - Fácil de leer con colores
- **⚡ Súper rápido** - Respuestas en 1-3 segundos
- **🔒 100% privado** - Todo funciona en tu máquina
- **💰 Gratis** - Sin límites ni costos de API
- **🛡️ Robusto** - Verifica conexiones y maneja errores

## 🔧 Solución de Problemas

### Error: "Permission denied"
```bash
chmod +x chat-ollama.sh
```

### Error: "No se puede conectar con Ollama"
```bash
# Verificar que Docker esté corriendo
docker-compose ps

# Si no está corriendo, levantarlo
docker-compose up -d

# Esperar unos segundos y probar
./chat-ollama.sh "Hola"
```

### El script no responde
```bash
# Ver logs de Ollama
docker-compose logs ollama

# Reiniciar si es necesario
docker-compose restart ollama
```

## 🎯 Tips Útiles

### Crear un alias para usar más fácil
Agrega esto a tu `~/.bashrc` o `~/.bash_profile`:
```bash
alias chat='./chat-ollama.sh'
```

Luego podrás usar:
```bash
chat "¿Cómo estás?"
```

### Preguntas largas con comillas
```bash
./chat-ollama.sh "Explícame paso a paso cómo crear una API REST con Node.js, incluyendo autenticación JWT y conexión a base de datos PostgreSQL"
```

### Usar variables
```bash
PREGUNTA="¿Cuáles son los síntomas de la depresión?"
./chat-ollama.sh "$PREGUNTA"
```

## 🚀 Casos de Uso Perfectos

### Para tu App de Salud Mental:
```bash
./chat-ollama.sh "¿Cómo identificar síntomas de ansiedad?"
./chat-ollama.sh "Técnicas de mindfulness para principiantes"
./chat-ollama.sh "¿Qué hacer cuando me siento abrumado?"
./chat-ollama.sh "Ejercicios de respiración para calmar la mente"
```

### Para Desarrollo:
```bash
./chat-ollama.sh "Explica este error de TypeScript"
./chat-ollama.sh "¿Cómo optimizar una consulta SQL?"
./chat-ollama.sh "Mejores prácticas para APIs REST"
./chat-ollama.sh "¿Qué es Docker Compose?"
```

### Para Aprendizaje:
```bash
./chat-ollama.sh "Diferencias entre frontend y backend"
./chat-ollama.sh "¿Qué es la programación orientada a objetos?"
./chat-ollama.sh "Conceptos básicos de bases de datos"
```

---

**💡 Tip:** ¡Experimenta con diferentes tipos de preguntas! La IA puede ayudarte con programación, salud mental, explicaciones técnicas y mucho más.
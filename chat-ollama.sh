#!/bin/bash

# 🤖 Chat con Ollama - Script Simple para Git Bash
# Uso: ./chat-ollama.sh "Tu mensaje aquí"

# Colores para hacer más bonita la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # Sin color

# URL de Ollama
OLLAMA_URL="http://localhost:11434"
MODEL="qwen2.5:0.5b"

echo -e "${BLUE}🤖 Chat con Ollama${NC}"
echo -e "${YELLOW}Modelo: $MODEL${NC}"
echo ""

# Verificar si se pasó un mensaje
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: Debes proporcionar un mensaje${NC}"
    echo -e "${YELLOW}Uso: $0 \"Tu mensaje aquí\"${NC}"
    echo ""
    echo -e "${CYAN}Ejemplos:${NC}"
    echo -e "  ${GREEN}$0 \"Hola, ¿cómo estás?\"${NC}"
    echo -e "  ${GREEN}$0 \"Explícame qué es la inteligencia artificial\"${NC}"
    echo -e "  ${GREEN}$0 \"Dame 5 consejos para reducir el estrés\"${NC}"
    echo -e "  ${GREEN}$0 \"¿Cómo puedo mejorar mi estado de ánimo?\"${NC}"
    echo -e "  ${GREEN}$0 \"Explica Docker en términos simples\"${NC}"
    exit 1
fi

# Obtener el mensaje del usuario
USER_MESSAGE="$1"

echo -e "${GREEN}👤 Tú:${NC} $USER_MESSAGE"
echo ""

# Verificar si Ollama está disponible
echo -e "${YELLOW}⏳ Verificando conexión con Ollama...${NC}"
if ! curl -s "$OLLAMA_URL/api/tags" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: No se puede conectar con Ollama en $OLLAMA_URL${NC}"
    echo -e "${YELLOW}💡 Asegúrate de que Docker Compose esté corriendo:${NC}"
    echo "   docker-compose up -d"
    exit 1
fi

echo -e "${GREEN}✅ Ollama conectado${NC}"
echo -e "${YELLOW}🧠 Pensando...${NC}"
echo ""

# Realizar la consulta a Ollama
RESPONSE=$(curl -s -X POST "$OLLAMA_URL/api/generate" \
    -H "Content-Type: application/json" \
    -d "{
        \"model\": \"$MODEL\",
        \"prompt\": \"$USER_MESSAGE\",
        \"stream\": false,
        \"options\": {
            \"temperature\": 0.7,
            \"top_p\": 0.9,
            \"top_k\": 40
        }
    }")

# Verificar si la respuesta es válida
if [ $? -ne 0 ] || [ -z "$RESPONSE" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener respuesta de Ollama${NC}"
    exit 1
fi

# Extraer la respuesta usando jq si está disponible, sino usar sed
if command -v jq > /dev/null 2>&1; then
    AI_RESPONSE=$(echo "$RESPONSE" | jq -r '.response // "Error: No se pudo procesar la respuesta"')
else
    # Fallback usando sed (menos preciso pero funciona)
    AI_RESPONSE=$(echo "$RESPONSE" | sed -n 's/.*"response":"\([^"]*\)".*/\1/p')
    if [ -z "$AI_RESPONSE" ]; then
        AI_RESPONSE="Error: No se pudo procesar la respuesta. Instala 'jq' para mejor compatibilidad."
    fi
fi

# Mostrar la respuesta
echo -e "${BLUE}🤖 Ollama:${NC}"
echo "$AI_RESPONSE"
echo ""
echo -e "${GREEN}✨ ¡Listo!${NC}"

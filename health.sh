#!/bin/bash

# Script para hacer curl al endpoint /test
# Configuración del servidor
HOST="localhost"
PORT="3000"
ENDPOINT="/health"
URL="http://${HOST}:${PORT}${ENDPOINT}"

echo "========================================="
echo "🚀 Realizando petición curl a ${URL}"
echo "========================================="

# Realizar la petición curl con opciones detalladas
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -w "\n\n📊 Estadísticas de la petición:\n" \
  -w "Código de estado: %{http_code}\n" \
  -w "Tiempo total: %{time_total}s\n" \
  -w "Tiempo de conexión: %{time_connect}s\n" \
  -w "Tamaño descargado: %{size_download} bytes\n" \
  -v \
  "${URL}"

# Verificar el código de salida
if [ $? -eq 0 ]; then
    echo "✅ Petición realizada exitosamente"
else
    echo "❌ Error al realizar la petición"
    echo "💡 Asegúrate de que el servidor esté ejecutándose en ${HOST}:${PORT}"
fi

echo "========================================="

#!/bin/bash

# Script para probar la conexión con el servidor Mistral
# Uso: ./test_mistral_connection.sh IP_DEL_SERVIDOR

if [ -z "$1" ]; then
    echo "Uso: $0 IP_DEL_SERVIDOR"
    echo "Ejemplo: $0 192.168.1.100"
    exit 1
fi

SERVER_IP=$1
echo "🧪 Probando conexión con servidor Mistral en $SERVER_IP:11434"
echo "=================================================="

# Test 1: Verificar que el servidor responde
echo "1️⃣ Verificando que el servidor responde..."
curl -s http://$SERVER_IP:11434/api/tags
if [ $? -eq 0 ]; then
    echo "✅ Servidor responde correctamente"
else
    echo "❌ Error: No se puede conectar al servidor"
    exit 1
fi

echo ""

# Test 2: Verificar modelos disponibles
echo "2️⃣ Verificando modelos disponibles..."
curl -s http://$SERVER_IP:11434/api/tags | jq '.models[].name' 2>/dev/null || curl -s http://$SERVER_IP:11434/api/tags

echo ""

# Test 3: Probar generación de texto
echo "3️⃣ Probando generación de texto..."
curl -X POST http://$SERVER_IP:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Hola, ¿cómo estás? Responde en español.",
  "stream": false
}' -H "Content-Type: application/json"

echo ""
echo ""
echo "🎉 Si todos los tests pasaron, tu servidor está listo!"
echo "📝 Ahora puedes actualizar tu .env con:"
echo "   MISTRAL_BASE_URL=http://$SERVER_IP:11434"
echo "   MISTRAL_MODEL=mistral" 
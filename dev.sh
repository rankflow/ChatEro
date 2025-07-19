#!/bin/bash

# Script de desarrollo para Chat Ero
# Usa los archivos package.dev.json para evitar conflictos con Vercel

echo "🚀 Iniciando Chat Ero en modo desarrollo..."

# Verificar si existen los archivos de desarrollo
if [ ! -f "package.dev.json" ]; then
    echo "❌ Error: No se encuentra package.dev.json"
    echo "💡 Ejecuta: mv package.json package.dev.json"
    exit 1
fi

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install --prefix . --package-lock-only
    npm install --prefix frontend
    npm install --prefix backend
fi

# Ejecutar en desarrollo
echo "🔥 Ejecutando frontend y backend simultáneamente..."
npm run dev --prefix . --package-lock-only 
#!/bin/bash

# Script para configurar variables de entorno en Vercel
# Uso: ./scripts/setup-vercel-env.sh

echo "🚀 Configurando variables de entorno para Vercel..."

# Verificar que vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado. Instálalo con: npm install -g vercel"
    exit 1
fi

# Variables de entorno necesarias para el frontend
ENV_VARS=(
    "NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key"
    "NEXT_PUBLIC_APP_URL=https://chatero.chat"
)

echo "📝 Variables de entorno a configurar:"
for var in "${ENV_VARS[@]}"; do
    echo "  - $var"
done

echo ""
echo "⚠️  IMPORTANTE:"
echo "1. Reemplaza 'your-railway-backend-url' con la URL real de tu backend en Railway"
echo "2. Usa la misma STRIPE_PUBLISHABLE_KEY que configuraste en Railway"
echo "3. Asegúrate de que NEXT_PUBLIC_APP_URL apunte a tu dominio"
echo ""
echo "🔗 Para configurar Vercel:"
echo "1. Ve a https://vercel.com"
echo "2. Conecta tu repositorio GitHub"
echo "3. En la sección Environment Variables, agrega cada variable"
echo "4. O usa el comando: vercel env add KEY VALUE"
echo ""
echo "✅ Listo para configurar Vercel!" 
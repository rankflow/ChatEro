#!/bin/bash

# Script para configurar variables de entorno en Railway
# Uso: ./scripts/setup-railway-env.sh

echo "🚀 Configurando variables de entorno para Railway..."

# Verificar que railway CLI esté instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI no está instalado. Instálalo con: npm install -g @railway/cli"
    exit 1
fi

# Variables de entorno necesarias para el backend
ENV_VARS=(
    "NODE_ENV=production"
    "PORT=3001"
    "DATABASE_URL=postgresql://user:password@host:port/database"
    "JWT_SECRET=your-super-secret-jwt-key-change-this"
    "VENICE_API_KEY=your-venice-api-key"
    "VENICE_BASE_URL=https://api.venice.ai"
    "STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key"
    "STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret"
    "STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key"
    "CORS_ORIGIN=https://chatero.chat"
)

echo "📝 Variables de entorno a configurar:"
for var in "${ENV_VARS[@]}"; do
    echo "  - $var"
done

echo ""
echo "⚠️  IMPORTANTE:"
echo "1. Reemplaza los valores de ejemplo con tus claves reales"
echo "2. Obtén las claves de Stripe desde: https://dashboard.stripe.com/apikeys"
echo "3. Obtén tu API key de Venice AI desde: https://venice.ai"
echo "4. Genera un JWT_SECRET seguro con: openssl rand -base64 32"
echo ""
echo "🔗 Para configurar Railway:"
echo "1. Ve a https://railway.app"
echo "2. Conecta tu repositorio GitHub"
echo "3. En la sección Variables, agrega cada variable"
echo "4. O usa el comando: railway variables set KEY=VALUE"
echo ""
echo "✅ Listo para configurar Railway!" 
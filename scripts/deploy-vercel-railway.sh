#!/bin/bash

# Script de despliegue automatizado para Vercel + Railway
# Uso: ./scripts/deploy-vercel-railway.sh

set -e

echo "🚀 Iniciando despliegue Vercel + Railway..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

print_status "Verificando estado del repositorio..."

# Verificar que no hay cambios pendientes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Hay cambios pendientes en el repositorio."
    read -p "¿Quieres hacer commit de los cambios? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "🚀 Auto-commit antes del despliegue"
        git push origin main
        print_success "Cambios committeados y pusheados."
    else
        print_error "Por favor, haz commit de los cambios antes de continuar."
        exit 1
    fi
fi

print_status "Verificando herramientas necesarias..."

# Verificar Railway CLI
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI no está instalado."
    print_status "Instalando Railway CLI..."
    npm install -g @railway/cli
fi

# Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI no está instalado."
    print_status "Instalando Vercel CLI..."
    npm install -g vercel
fi

print_success "Herramientas verificadas."

print_status "Preparando configuración..."

# Crear archivo .env.example para Railway
cat > backend/.env.example << EOF
# Railway Environment Variables
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-change-this
VENICE_API_KEY=your-venice-api-key
VENICE_BASE_URL=https://api.venice.ai
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
CORS_ORIGIN=https://chatero.chat
EOF

# Crear archivo .env.example para Vercel
cat > frontend/.env.example << EOF
# Vercel Environment Variables
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
NEXT_PUBLIC_APP_URL=https://chatero.chat
EOF

print_success "Archivos de configuración creados."

echo ""
echo "🎯 PASOS PARA COMPLETAR EL DESPLIEGUE:"
echo ""
echo "1️⃣  CONFIGURAR RAILWAY (Backend):"
echo "   • Ve a https://railway.app"
echo "   • Conecta tu repositorio GitHub"
echo "   • Selecciona la carpeta 'backend'"
echo "   • Configura las variables de entorno desde backend/.env.example"
echo "   • Despliega el proyecto"
echo ""
echo "2️⃣  CONFIGURAR VERCEL (Frontend):"
echo "   • Ve a https://vercel.com"
echo "   • Conecta tu repositorio GitHub"
echo "   • Selecciona la carpeta 'frontend'"
echo "   • Configura las variables de entorno desde frontend/.env.example"
echo "   • Despliega el proyecto"
echo ""
echo "3️⃣  CONFIGURAR DOMINIO:"
echo "   • En Vercel, agrega tu dominio 'chatero.chat'"
echo "   • Configura los registros DNS según las instrucciones"
echo "   • Espera a que se active el SSL"
echo ""
echo "4️⃣  VERIFICAR DESPLIEGUE:"
echo "   • Prueba el frontend en tu dominio"
echo "   • Verifica que el backend responda correctamente"
echo "   • Revisa los logs en Railway y Vercel"
echo ""

print_success "¡Script de despliegue completado!"
print_status "Sigue los pasos anteriores para completar la configuración." 
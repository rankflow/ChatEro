#!/bin/bash

# 🚀 Script de Despliegue Alpha - Chat Ero
# Uso: ./scripts/deploy-alpha.sh

set -e

echo "🚀 Iniciando despliegue alpha de Chat Ero..."

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

print_status "Verificando estado del proyecto..."

# Verificar que los archivos necesarios existen
required_files=(
    "backend/src/index.ts"
    "frontend/src/app/page.tsx"
    "docker-compose.prod.yml"
    "nginx.conf"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Archivo requerido no encontrado: $file"
        exit 1
    fi
done

print_success "Estructura del proyecto verificada"

# Verificar variables de entorno
print_status "Verificando variables de entorno..."

env_vars=(
    "DATABASE_URL"
    "JWT_SECRET"
    "OPENAI_API_KEY"
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "VENICE_API_KEY"
)

missing_vars=()
for var in "${env_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_warning "Variables de entorno faltantes:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Por favor, configura estas variables antes de continuar."
    exit 1
fi

print_success "Variables de entorno verificadas"

# Opciones de despliegue
echo ""
echo "🎯 Selecciona el método de despliegue:"
echo "1) Vercel + Railway (Recomendado)"
echo "2) DigitalOcean App Platform"
echo "3) Docker Compose (VPS)"
echo "4) Solo configuración (sin deploy)"

read -p "Selecciona una opción (1-4): " deploy_option

case $deploy_option in
    1)
        print_status "Desplegando con Vercel + Railway..."
        
        # Verificar que Vercel CLI está instalado
        if ! command -v vercel &> /dev/null; then
            print_error "Vercel CLI no está instalado. Instálalo con: npm i -g vercel"
            exit 1
        fi
        
        # Verificar que Railway CLI está instalado
        if ! command -v railway &> /dev/null; then
            print_error "Railway CLI no está instalado. Instálalo con: npm i -g @railway/cli"
            exit 1
        fi
        
        print_status "Desplegando frontend en Vercel..."
        cd frontend
        vercel --prod --yes
        cd ..
        
        print_status "Desplegando backend en Railway..."
        cd backend
        railway up
        cd ..
        
        print_success "Despliegue completado!"
        ;;
        
    2)
        print_status "Configurando para DigitalOcean App Platform..."
        
        # Crear archivo de configuración para DigitalOcean
        cat > digitalocean-app.yaml << EOF
name: chatero-chat
services:
  - name: frontend
    source_dir: /frontend
    github:
      repo: tu-usuario/chat-ero
      branch: main
    environment_slug: next-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NEXT_PUBLIC_API_URL
        value: https://api.chatero.chat
      - key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        value: \${STRIPE_PUBLISHABLE_KEY}
        
  - name: backend
    source_dir: /backend
    github:
      repo: tu-usuario/chat-ero
      branch: main
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: DATABASE_URL
        value: \${DATABASE_URL}
      - key: JWT_SECRET
        value: \${JWT_SECRET}
      - key: OPENAI_API_KEY
        value: \${OPENAI_API_KEY}
      - key: STRIPE_SECRET_KEY
        value: \${STRIPE_SECRET_KEY}
      - key: VENICE_API_KEY
        value: \${VENICE_API_KEY}
        
  - name: database
    environment_slug: postgres
    instance_count: 1
    instance_size_slug: db-s-1vcpu-1gb
EOF
        
        print_success "Archivo de configuración creado: digitalocean-app.yaml"
        print_status "Sube este archivo a DigitalOcean App Platform"
        ;;
        
    3)
        print_status "Configurando para Docker Compose..."
        
        # Verificar que Docker está instalado
        if ! command -v docker &> /dev/null; then
            print_error "Docker no está instalado"
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            print_error "Docker Compose no está instalado"
            exit 1
        fi
        
        print_status "Construyendo imágenes Docker..."
        docker-compose -f docker-compose.prod.yml build
        
        print_status "Iniciando servicios..."
        docker-compose -f docker-compose.prod.yml up -d
        
        print_success "Servicios iniciados con Docker Compose"
        ;;
        
    4)
        print_status "Solo configuración..."
        ;;
        
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

# Configuración de DNS
echo ""
print_status "Configuración de DNS para chatero.chat:"
echo ""
echo "Añade estos registros en tu proveedor de DNS:"
echo ""
echo "Para Vercel + Railway:"
echo "  A     chatero.chat        → IP de Vercel"
echo "  CNAME www.chatero.chat    → chatero.chat"
echo "  A     api.chatero.chat    → IP de Railway"
echo ""
echo "Para DigitalOcean:"
echo "  A     chatero.chat        → IP del droplet"
echo "  CNAME www.chatero.chat    → chatero.chat"
echo "  A     api.chatero.chat    → IP del droplet"
echo ""

# Verificaciones post-despliegue
print_status "Verificaciones post-despliegue:"
echo ""
echo "1. Verifica que el dominio resuelve correctamente"
echo "2. Prueba el registro de usuarios"
echo "3. Prueba el chat con avatares"
echo "4. Verifica que los pagos funcionan"
echo "5. Revisa los logs de errores"
echo ""

# URLs de monitoreo
print_status "URLs importantes:"
echo ""
echo "Frontend: https://chatero.chat"
echo "API: https://api.chatero.chat"
echo "Health Check: https://api.chatero.chat/health"
echo ""

print_success "¡Despliegue alpha completado! 🎉"
echo ""
echo "Próximos pasos:"
echo "1. Configura el dominio en tu proveedor de DNS"
echo "2. Configura SSL (automático con Vercel/Railway)"
echo "3. Configura Stripe para producción"
echo "4. Configura monitoreo y logs"
echo "5. Prueba todas las funcionalidades"
echo "" 
# 🚀 Plan de Despliegue Alpha - Chat Ero

## 📋 **Estado del Proyecto para Alpha**

### ✅ **Listo para Producción**
- Backend API completa (Fastify + Prisma)
- Frontend Next.js funcional
- Sistema de autenticación JWT
- Chat con IA integrado
- Sistema de avatares
- Sistema de tokens
- Sistema de pagos (Stripe)
- Base de datos funcional

### 🔧 **Necesita Configuración**
- Variables de entorno de producción
- Base de datos PostgreSQL
- Dominio y SSL
- Logs y monitoreo

## 🎯 **Opciones de Despliegue**

### **Opción 1: Vercel + Railway (Recomendado)**

#### **Frontend (Vercel)**
```bash
# Configurar en Vercel Dashboard
# Conectar repositorio GitHub
# Variables de entorno:
NEXT_PUBLIC_API_URL=https://api.chatero.chat
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

#### **Backend (Railway)**
```bash
# Configurar en Railway Dashboard
# Variables de entorno:
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=...
OPENAI_API_KEY=sk-...
```

### **Opción 2: DigitalOcean App Platform**

#### **Configuración Completa**
```yaml
# docker-compose.yml para producción
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.chatero.chat
      
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://...
      - STRIPE_SECRET_KEY=sk_live_...
      
  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=chatero
      - POSTGRES_USER=chatero
      - POSTGRES_PASSWORD=...
```

## 🔧 **Configuración Paso a Paso**

### **1. Preparar Base de Datos**

#### **Opción A: Railway PostgreSQL**
```bash
# En Railway Dashboard
# Crear nueva base de datos PostgreSQL
# Copiar DATABASE_URL
```

#### **Opción B: Supabase**
```bash
# Crear proyecto en Supabase
# Obtener connection string
# Configurar Prisma para PostgreSQL
```

### **2. Configurar Variables de Entorno**

#### **Backend (.env.production)**
```env
# Servidor
PORT=3001
NODE_ENV=production

# Base de datos
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro-produccion

# OpenAI
OPENAI_API_KEY=sk-tu-openai-api-key-produccion

# Stripe (Producción)
STRIPE_SECRET_KEY=sk_live_tu-stripe-secret-key-produccion
STRIPE_PUBLISHABLE_KEY=pk_live_tu-stripe-publishable-key-produccion
STRIPE_WEBHOOK_SECRET=whsec_tu-stripe-webhook-secret-produccion

# Venice AI
VENICE_API_KEY=tu-venice-api-key
VENICE_API_URL=https://api.venice.ai/api/v1/chat/completions
VENICE_MODEL=venice-uncensored

# Frontend URL
FRONTEND_URL=https://chatero.chat
```

#### **Frontend (.env.production)**
```env
NEXT_PUBLIC_API_URL=https://api.chatero.chat
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu-stripe-publishable-key-produccion
```

### **3. Configurar Dominio**

#### **DNS Configuration**
```
# Añadir en tu proveedor de DNS:
A     chatero.chat        → IP de Vercel
CNAME www.chatero.chat    → chatero.chat
A     api.chatero.chat    → IP de Railway/Backend
```

#### **SSL Certificate**
```bash
# Automático con Vercel/Railway
# O configurar manualmente con Let's Encrypt
```

### **4. Configurar Stripe para Producción**

#### **Dashboard de Stripe**
1. Cambiar a modo Live
2. Obtener claves de producción
3. Configurar webhook:
   ```
   URL: https://api.chatero.chat/api/payments/webhook
   Eventos: payment_intent.succeeded, etc.
   ```

### **5. Migrar Base de Datos**

#### **Script de Migración**
```bash
# En Railway/Backend
npm run db:generate
npm run db:push
npm run db:seed
```

## 🚀 **Comandos de Despliegue**

### **Opción 1: Vercel + Railway**

#### **Frontend (Vercel)**
```bash
# 1. Conectar repositorio a Vercel
# 2. Configurar variables de entorno
# 3. Deploy automático

# O manual:
npm run build
vercel --prod
```

#### **Backend (Railway)**
```bash
# 1. Conectar repositorio a Railway
# 2. Configurar variables de entorno
# 3. Deploy automático

# O manual:
railway login
railway init
railway up
```

### **Opción 2: DigitalOcean**

#### **Docker Compose**
```bash
# Construir y desplegar
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose logs -f
```

## 📊 **Monitoreo y Logs**

### **Logs de Aplicación**
```javascript
// En backend/src/index.ts
const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});
```

### **Métricas a Seguir**
- Uptime del servidor
- Tiempo de respuesta de API
- Errores de autenticación
- Uso de tokens
- Conversiones de pago

## 🔒 **Seguridad para Producción**

### **Checklist de Seguridad**
- [ ] HTTPS habilitado
- [ ] Variables de entorno seguras
- [ ] Rate limiting configurado
- [ ] CORS configurado correctamente
- [ ] Logs de auditoría
- [ ] Backup de base de datos

### **Variables Críticas**
```env
# Cambiar en producción:
JWT_SECRET=generar-secret-aleatorio-seguro
DATABASE_URL=postgresql://usuario:password@host:puerto/database
STRIPE_SECRET_KEY=sk_live_...
```

## 🧪 **Testing Pre-Despliegue**

### **Scripts de Prueba**
```bash
# Probar backend
node test-backend.js

# Probar frontend
npm run build
npm run start

# Probar pagos
node test-payments.js
```

### **Pruebas Manuales**
1. Registro de usuario
2. Login/logout
3. Chat con avatares
4. Sistema de tokens
5. Proceso de pago
6. Webhooks de Stripe

## 📈 **Post-Despliegue**

### **Monitoreo Inicial**
- [ ] Verificar uptime
- [ ] Revisar logs de errores
- [ ] Probar funcionalidades críticas
- [ ] Verificar SSL
- [ ] Testear pagos

### **Optimizaciones**
- [ ] Configurar CDN
- [ ] Optimizar imágenes
- [ ] Configurar cache
- [ ] Monitoreo de performance

## 🆘 **Soporte y Mantenimiento**

### **Logs y Debugging**
```bash
# Ver logs en Railway
railway logs

# Ver logs en Vercel
vercel logs

# Base de datos
railway connect
```

### **Backup y Recuperación**
```bash
# Backup de base de datos
pg_dump $DATABASE_URL > backup.sql

# Restaurar
psql $DATABASE_URL < backup.sql
```

---

## 🎯 **Timeline Estimado**

### **Semana 1: Preparación**
- [ ] Configurar base de datos PostgreSQL
- [ ] Configurar variables de entorno
- [ ] Probar en entorno de staging

### **Semana 2: Despliegue**
- [ ] Desplegar backend en Railway
- [ ] Desplegar frontend en Vercel
- [ ] Configurar dominio y SSL

### **Semana 3: Testing**
- [ ] Pruebas completas
- [ ] Configurar monitoreo
- [ ] Optimizaciones iniciales

### **Semana 4: Lanzamiento**
- [ ] Lanzamiento alpha
- [ ] Monitoreo activo
- [ ] Feedback de usuarios

---

**¡El proyecto está listo para el despliegue alpha! 🚀** 
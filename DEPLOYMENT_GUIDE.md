# 🚀 Guía de Despliegue Alpha - Vercel + Railway

## 📋 Resumen del Proyecto

**Chat Ero** es una aplicación de chat con IA y avatares eróticos que incluye:
- ✅ Backend Fastify con Prisma y SQLite
- ✅ Autenticación JWT
- ✅ Sistema de avatares
- ✅ Chat con IA (Venice AI)
- ✅ Sistema de tokens
- ✅ Frontend Next.js con UI moderna
- ✅ Integración completa con Stripe
- ✅ Sistema de pagos y suscripciones

## 🎯 Opción Recomendada: Vercel + Railway

### ✅ Ventajas
- **Simplicidad**: Despliegue automático
- **Escalabilidad**: Escala automáticamente
- **Costo**: Bajo costo inicial ($5/mes Railway)
- **Velocidad**: Configuración rápida
- **Integración**: Perfecta entre servicios

## 🛠️ Preparación

### 1. Verificar Repositorio
```bash
git status
git add .
git commit -m "🚀 Preparación para despliegue alpha"
git push origin main
```

### 2. Ejecutar Script de Preparación
```bash
./scripts/deploy-vercel-railway.sh
```

## 🔧 Configuración Railway (Backend)

### Paso 1: Crear Proyecto en Railway
1. Ve a [Railway.app](https://railway.app)
2. Conecta tu cuenta GitHub
3. Crea un nuevo proyecto
4. Selecciona "Deploy from GitHub repo"
5. Selecciona tu repositorio
6. **IMPORTANTE**: Selecciona la carpeta `backend`

### Paso 2: Configurar Base de Datos
1. En Railway, agrega un servicio PostgreSQL
2. Copia la URL de conexión
3. Configura las variables de entorno

### Paso 3: Variables de Entorno (Railway)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=tu-jwt-secret-super-seguro
VENICE_API_KEY=tu-venice-api-key
VENICE_BASE_URL=https://api.venice.ai
STRIPE_SECRET_KEY=sk_test_tu-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_tu-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_test_tu-stripe-publishable-key
CORS_ORIGIN=https://chatero.chat
```

### Paso 4: Desplegar Backend
1. Railway detectará automáticamente el proyecto Node.js
2. Usará el `package.json` del backend
3. Desplegará automáticamente
4. Copia la URL del backend (ej: `https://backend-xyz.railway.app`)

## 🌐 Configuración Vercel (Frontend)

### Paso 1: Crear Proyecto en Vercel
1. Ve a [Vercel.com](https://vercel.com)
2. Conecta tu cuenta GitHub
3. Importa tu repositorio
4. **IMPORTANTE**: Configura el directorio raíz como `frontend`
5. Framework: Next.js (detectado automáticamente)

### Paso 2: Variables de Entorno (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://tu-backend-railway-url.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu-stripe-publishable-key
NEXT_PUBLIC_APP_URL=https://chatero.chat
```

### Paso 3: Configurar Dominio
1. En Vercel, ve a Settings > Domains
2. Agrega tu dominio: `chatero.chat`
3. Configura los registros DNS según las instrucciones
4. Espera a que se active el SSL (5-10 minutos)

## 🔗 Configuración DNS

### Registros DNS Necesarios
```
Tipo: A
Nombre: @
Valor: 76.76.19.19

Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

## 🧪 Verificación del Despliegue

### 1. Verificar Backend
```bash
curl https://tu-backend-railway-url.railway.app/health
```

### 2. Verificar Frontend
- Visita `https://chatero.chat`
- Verifica que cargue correctamente
- Prueba el login/registro

### 3. Verificar Integración
- Prueba el chat con un avatar
- Verifica que los pagos funcionen
- Revisa los logs en Railway y Vercel

## 🔍 Monitoreo

### Railway Logs
```bash
railway logs
```

### Vercel Logs
```bash
vercel logs
```

## 🚨 Solución de Problemas

### Error: Database Connection
- Verifica `DATABASE_URL` en Railway
- Asegúrate de que PostgreSQL esté activo

### Error: CORS
- Verifica `CORS_ORIGIN` en Railway
- Asegúrate de que apunte a tu dominio

### Error: Stripe
- Verifica las claves de Stripe
- Asegúrate de usar claves de test para desarrollo

### Error: Venice AI
- Verifica `VENICE_API_KEY`
- Asegúrate de tener créditos en Venice AI

## 📊 Métricas Recomendadas

### Railway
- CPU/Memory usage
- Response times
- Error rates

### Vercel
- Page load times
- Core Web Vitals
- Function execution times

## 🔐 Seguridad

### Variables Sensibles
- ✅ JWT_SECRET: Generado con `openssl rand -base64 32`
- ✅ Stripe keys: Desde dashboard de Stripe
- ✅ Venice API key: Desde Venice AI dashboard

### SSL/HTTPS
- ✅ Automático en Vercel
- ✅ Automático en Railway

## 💰 Costos Estimados

### Railway
- **Plan Hobby**: $5/mes
- **Base de datos**: Incluida
- **Bandwidth**: 100GB/mes

### Vercel
- **Plan Hobby**: Gratis
- **Dominio**: $20/año
- **Bandwidth**: 100GB/mes

### Total Estimado: $25/mes

## 🎯 Próximos Pasos

1. **Monitoreo**: Configurar alertas
2. **Backup**: Configurar backups automáticos
3. **Escalado**: Migrar a planes superiores según demanda
4. **CDN**: Configurar CDN para mejor rendimiento
5. **Analytics**: Integrar Google Analytics

## 📞 Soporte

- **Railway**: [Discord](https://discord.gg/railway)
- **Vercel**: [Documentación](https://vercel.com/docs)
- **Stripe**: [Soporte](https://support.stripe.com)

---

**¡Listo para el despliegue alpha! 🚀** 
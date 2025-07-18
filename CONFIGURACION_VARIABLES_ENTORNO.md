# Configuración de Variables de Entorno - Chat Ero

## 🎯 Resumen
Este documento contiene las instrucciones para configurar las variables de entorno necesarias para conectar el frontend (Vercel) con el backend (Railway) y habilitar los pagos con Stripe.

## 📍 URLs de los Servicios

### Backend (Railway)
- **URL:** `https://chat-ero-production.up.railway.app`
- **Estado:** ✅ Desplegado y funcionando
- **Base de datos:** PostgreSQL en Railway

### Frontend (Vercel)
- **URL:** `https://chat-ero-1.vercel.app`
- **Estado:** ✅ Desplegado
- **Necesita:** Variables de entorno configuradas

## 🔧 Variables de Entorno para Configurar

### 1. Variables en Vercel (Frontend)

Ve a [vercel.com/dashboard](https://vercel.com/dashboard) → Tu proyecto → Settings → Environment Variables

#### Variable 1: `NEXT_PUBLIC_API_URL`
- **Valor:** `https://chat-ero-production.up.railway.app`
- **Entorno:** Production (y Preview si quieres)

#### Variable 2: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Valor:** Tu clave pública de Stripe (pk_test_...)
- **Entorno:** Production (y Preview si quieres)
- **⚠️ IMPORTANTE:** Solo la Publishable Key, NUNCA la Secret Key

### 2. Variables en Railway (Backend) - ✅ YA CONFIGURADAS

Las siguientes variables ya están configuradas en Railway:

- ✅ `DATABASE_URL` - PostgreSQL
- ✅ `JWT_SECRET` - Autenticación
- ✅ `STRIPE_SECRET_KEY` - Stripe (sk_test_...)
- ✅ `STRIPE_PUBLISHABLE_KEY` - Stripe (pk_test_...)

## 🔑 Cómo Obtener las Claves de Stripe

### 1. Crear cuenta en Stripe
1. Ve a [stripe.com](https://stripe.com)
2. Crea una cuenta de desarrollador
3. Activa el modo de prueba

### 2. Obtener API Keys
1. Ve a Dashboard → Developers → API Keys
2. Copia las claves:
   - **Publishable Key:** `pk_test_...` (para frontend - Vercel)
   - **Secret Key:** `sk_test_...` (para backend - Railway, NO en frontend)

### 3. Configurar Webhook (Opcional)
1. Ve a Developers → Webhooks
2. Crea endpoint: `https://chat-ero-production.up.railway.app/api/payments/webhook`
3. Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`, etc.

## 🚀 Pasos para Completar la Configuración

### Paso 1: Configurar Variables en Vercel
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `chat-ero-1`
3. Ve a **Settings** → **Environment Variables**
4. Agrega las dos variables mencionadas arriba

### Paso 2: Reemplazar Claves de Stripe
1. Reemplaza `pk_test_tu-stripe-publishable-key-aqui` con tu clave real (solo en Vercel)
2. La Secret Key (`sk_test_...`) solo va en el backend (Railway) - NO en el frontend

### Paso 3: Verificar Conexión
1. Visita tu frontend: `https://chat-ero-1.vercel.app`
2. Prueba el login/registro
3. Verifica que se conecte al backend

### Paso 4: Configurar Dominio Personalizado (Opcional)
1. Ve a Vercel → Settings → Domains
2. Agrega tu dominio: `chatero.chat`
3. Configura los registros DNS según las instrucciones

## 🧪 Testing

### Probar Conexión Backend-Frontend
```bash
# Probar que el backend responde
curl https://chat-ero-production.up.railway.app/api/auth/login

# Probar que el frontend se conecta
curl https://chat-ero-1.vercel.app
```

### Probar Pagos (cuando tengas Stripe configurado)
1. Usa tarjeta de prueba: `4242 4242 4242 4242`
2. Fecha: Cualquier fecha futura
3. CVC: Cualquier 3 dígitos

## 📋 Checklist de Configuración

- [ ] Variables de entorno configuradas en Vercel
- [ ] Claves de Stripe reales configuradas
- [ ] Frontend conectado al backend
- [ ] Login/registro funcionando
- [ ] Chat funcionando
- [ ] Pagos funcionando (cuando tengas Stripe)
- [ ] Dominio personalizado configurado (opcional)

## 🔗 Enlaces Útiles

- **Backend:** https://chat-ero-production.up.railway.app
- **Frontend:** https://chat-ero-1.vercel.app
- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com

## 🆘 Solución de Problemas

### Error: "API URL not configured"
- Verifica que `NEXT_PUBLIC_API_URL` esté configurada en Vercel
- Asegúrate de que el valor sea exactamente: `https://chat-ero-production.up.railway.app`

### Error: "Stripe not configured"
- Verifica que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` esté configurada
- Asegúrate de usar una clave válida de Stripe

### Error: "Backend not responding"
- Verifica que el backend esté desplegado en Railway
- Revisa los logs en Railway Dashboard

### Error: "CORS error"
- El backend ya tiene CORS configurado para Vercel
- Si persiste, verifica las URLs en la configuración

## 🔒 Seguridad - Variables de Entorno

### ✅ Configuración Correcta
- **Frontend (Vercel):** Solo `NEXT_PUBLIC_*` variables (públicas)
- **Backend (Railway):** Solo variables privadas (Secret Keys)

### ❌ NUNCA Hacer
- Poner Secret Keys en el frontend
- Usar `NEXT_PUBLIC_` para variables privadas
- Exponer claves de API en el cliente

### ✅ Variables Seguras por Entorno
- **Frontend:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Backend:** `STRIPE_SECRET_KEY`, `JWT_SECRET`, `DATABASE_URL` 
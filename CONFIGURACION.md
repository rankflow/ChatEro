# 🔑 Configuración Completa - Chat Ero

## 📋 **RESUMEN**

Este documento contiene todas las configuraciones necesarias para conectar el frontend (Vercel) con el backend (Railway) y habilitar los pagos con Stripe.

---

## 📍 **URLs DE LOS SERVICIOS**

### **Backend (Railway)**
- **URL:** `https://chat-ero-production.up.railway.app`
- **Estado:** ✅ Desplegado y funcionando
- **Base de datos:** PostgreSQL en Railway

### **Frontend (Vercel)**
- **URL:** `https://chat-ero-1.vercel.app`
- **Estado:** ✅ Desplegado
- **Necesita:** Variables de entorno configuradas

---

## 🔧 **VARIABLES DE ENTORNO**

### **🚨 IMPORTANTE: Reemplaza estos valores con tus claves reales**

### **1. Variables en Railway (Backend)**

Ve a [railway.app/dashboard](https://railway.app/dashboard) → Tu proyecto → Variables

```env
# Servidor
NODE_ENV=production
PORT=3001

# Base de datos (Railway lo genera automáticamente)
DATABASE_URL=postgresql://user:password@host:port/database

# Autenticación
JWT_SECRET=xkAyQdClV8dEYfZouzp9bWTCjnNfKxuR3ArOtb+K3tU=

# Venice AI
VENICE_API_KEY=tu-venice-api-key-aqui
VENICE_BASE_URL=https://api.venice.ai

# Stripe (Backend - Secret Keys)
STRIPE_SECRET_KEY=sk_test_tu-stripe-secret-key-aqui
STRIPE_WEBHOOK_SECRET=whsec_tu-webhook-secret-aqui
STRIPE_PUBLISHABLE_KEY=pk_test_tu-stripe-publishable-key-aqui

# CORS
CORS_ORIGIN=https://chatero.chat
```

### **2. Variables en Vercel (Frontend)**

Ve a [vercel.com/dashboard](https://vercel.com/dashboard) → Tu proyecto → Settings → Environment Variables

```env
# Backend API
NEXT_PUBLIC_API_URL=https://chat-ero-production.up.railway.app

# Stripe (Frontend - Solo Publishable Key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu-stripe-publishable-key-aqui

# App URL
NEXT_PUBLIC_APP_URL=https://chatero.chat
```

---

## 🔑 **CÓMO OBTENER LAS CLAVES**

### **1. JWT Secret (Generado automáticamente)**
```bash
# Ya generado para el proyecto
JWT_SECRET=xkAyQdClV8dEYfZouzp9bWTCjnNfKxuR3ArOtb+K3tU=
```

### **2. Stripe Keys**

#### **Paso 1: Crear cuenta en Stripe**
1. Ve a [stripe.com](https://stripe.com)
2. Crea una cuenta de desarrollador
3. Activa el modo de prueba

#### **Paso 2: Obtener API Keys**
1. Ve a Dashboard → Developers → API Keys
2. Copia las claves:
   - **Publishable Key:** `pk_test_...` (para frontend - Vercel)
   - **Secret Key:** `sk_test_...` (para backend - Railway, NO en frontend)

#### **Paso 3: Configurar Webhook (Opcional)**
1. Ve a Developers → Webhooks
2. Crea endpoint: `https://chat-ero-production.up.railway.app/api/payments/webhook`
3. Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`, etc.

### **3. Venice AI Key**

#### **Paso 1: Crear cuenta en Venice AI**
1. Ve a [venice.ai](https://venice.ai)
2. Crea una cuenta
3. Obtén tu API key

#### **Paso 2: Configurar API Key**
- **Railway:** `VENICE_API_KEY=tu-venice-api-key-aqui`

---

## 🚀 **PASOS PARA COMPLETAR LA CONFIGURACIÓN**

### **Paso 1: Configurar Variables en Railway**
1. Ve a [railway.app/dashboard](https://railway.app/dashboard)
2. Selecciona tu proyecto
3. Ve a **Variables**
4. Agrega todas las variables del backend mencionadas arriba

### **Paso 2: Configurar Variables en Vercel**
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `chat-ero-1`
3. Ve a **Settings** → **Environment Variables**
4. Agrega las variables del frontend mencionadas arriba

### **Paso 3: Reemplazar Claves de Stripe**
1. Reemplaza `pk_test_tu-stripe-publishable-key-aqui` con tu clave real (solo en Vercel)
2. Reemplaza `sk_test_tu-stripe-secret-key-aqui` con tu clave real (solo en Railway)
3. **⚠️ IMPORTANTE:** La Secret Key (`sk_test_...`) solo va en el backend (Railway) - NO en el frontend

### **Paso 4: Verificar Conexión**
1. Visita tu frontend: `https://chat-ero-1.vercel.app`
2. Prueba el login/registro
3. Verifica que se conecte al backend

### **Paso 5: Configurar Dominio Personalizado (Opcional)**
1. Ve a Vercel → Settings → Domains
2. Agrega tu dominio: `chatero.chat`
3. Configura los registros DNS según las instrucciones

---

## 🧪 **TESTING**

### **Probar Conexión Backend-Frontend**
```bash
# Probar que el backend responde
curl https://chat-ero-production.up.railway.app/api/auth/login

# Probar que el frontend se conecta
curl https://chat-ero-1.vercel.app
```

### **Probar Pagos (cuando tengas Stripe configurado)**
1. Usa tarjeta de prueba: `4242 4242 4242 4242`
2. Fecha: Cualquier fecha futura
3. CVC: Cualquier 3 dígitos

### **Scripts de Test Disponibles**
```bash
# Test de conexión completa
node tests/test-conexion-completa.js

# Test de pagos
node tests/test-payments.js

# Test de chat
node tests/test-chat.js

# Test de autenticación
node tests/test-auth.js
```

---

## 📋 **CHECKLIST DE CONFIGURACIÓN**

### **✅ Preparación**
- [x] Repositorio Git actualizado
- [x] Scripts de configuración creados
- [x] JWT Secret generado
- [ ] Obtener claves de Stripe
- [ ] Obtener API key de Venice AI

### **🔧 Railway (Backend)**
- [x] Crear proyecto en Railway
- [x] Conectar repositorio GitHub
- [x] Seleccionar carpeta 'backend'
- [x] Agregar servicio PostgreSQL
- [ ] Configurar variables de entorno
- [x] Desplegar backend
- [x] Copiar URL del backend

### **🌐 Vercel (Frontend)**
- [x] Crear proyecto en Vercel
- [x] Conectar repositorio GitHub
- [x] Configurar directorio 'frontend'
- [ ] Configurar variables de entorno
- [x] Desplegar frontend
- [ ] Agregar dominio chatero.chat

### **🔗 DNS y Dominio**
- [ ] Configurar registros DNS
- [ ] Esperar activación SSL
- [ ] Verificar dominio

### **🧪 Verificación**
- [ ] Probar frontend
- [ ] Probar backend
- [ ] Probar integración
- [ ] Revisar logs

---

## 🔗 **ENLACES IMPORTANTES**

### **Dashboards**
- **Vercel:** https://vercel.com/dashboard
- **Railway:** https://railway.app/dashboard
- **Stripe:** https://dashboard.stripe.com/apikeys
- **Venice AI:** https://venice.ai

### **Documentación**
- **Setup Stripe:** `STRIPE_SETUP.md`
- **Instalación:** `INSTALACION.md`
- **Desarrollo:** `DESARROLLO.md`

---

## 🚨 **NOTAS IMPORTANTES**

1. **Nunca compartas las claves secretas**
2. **Usa claves de test para desarrollo**
3. **Cambia a claves de producción para live**
4. **La Secret Key de Stripe solo va en el backend**
5. **Verifica que las URLs estén correctas**
6. **Prueba todas las funcionalidades después de configurar**

---

## ✅ **RESULTADO FINAL**

Una vez completada la configuración:

- ✅ **Frontend conectado al backend**
- ✅ **Sistema de pagos funcional**
- ✅ **Autenticación trabajando**
- ✅ **Chat con IA operativo**
- ✅ **Dominio personalizado configurado**

**¡El proyecto estará 100% funcional! 🚀** 
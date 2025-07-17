# Sistema de Pagos con Stripe - Configuración Completa

## 🎯 Resumen del Sistema

El sistema de pagos implementado incluye:

### ✅ **Funcionalidades Completadas**
- ✅ Integración completa con Stripe API
- ✅ Payment Intents para pagos únicos
- ✅ Suscripciones recurrentes
- ✅ Webhooks para procesamiento automático
- ✅ Gestión de clientes en Stripe
- ✅ Historial de pagos en base de datos
- ✅ Frontend con componentes de pago
- ✅ Página de éxito post-pago
- ✅ Sistema de tokens automático

### 🏗️ **Arquitectura**
```
Backend (Fastify + Stripe)
├── /api/payments/create-intent     # Crear Payment Intent
├── /api/payments/packages          # Obtener paquetes
├── /api/payments/webhook           # Procesar webhooks
├── /api/payments/history           # Historial de pagos
├── /api/payments/customer-info     # Info del cliente
└── /api/payments/create-subscription # Crear suscripción

Frontend (Next.js + Stripe.js)
├── /payments                       # Página de compra
├── /payment/success                # Página de éxito
├── PaymentPackages.tsx             # Componente de paquetes
└── PaymentForm.tsx                 # Formulario de pago
```

## 🚀 Configuración Paso a Paso

### 1. Configurar Cuenta de Stripe

1. **Crear cuenta en Stripe**
   - Ve a [stripe.com](https://stripe.com)
   - Crea una cuenta de desarrollador
   - Activa el modo de prueba

2. **Obtener API Keys**
   - Ve a Dashboard > Developers > API Keys
   - Copia las claves de prueba:
     - `pk_test_...` (Publishable Key)
     - `sk_test_...` (Secret Key)

### 2. Configurar Variables de Entorno

#### Backend (`backend/env`)
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_tu-stripe-secret-key-aqui
STRIPE_PUBLISHABLE_KEY=pk_test_tu-stripe-publishable-key-aqui
STRIPE_WEBHOOK_SECRET=whsec_tu-stripe-webhook-secret-aqui
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu-stripe-publishable-key-aqui
```

### 3. Configurar Productos y Precios

Ejecuta el script de configuración:

```bash
cd backend
npm run stripe:setup
```

Este script creará:
- 4 productos de tokens (100, 500, 1000, 2000 tokens)
- 2 productos de suscripción (mensual, anual)
- Precios correspondientes en Stripe

### 4. Configurar Webhook

1. **En Stripe Dashboard:**
   - Ve a Developers > Webhooks
   - Crea un nuevo endpoint
   - URL: `https://tu-dominio.com/api/payments/webhook`
   - Eventos a escuchar:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Copiar Webhook Secret:**
   - Copia el `whsec_...` del webhook creado
   - Agrégalo a `STRIPE_WEBHOOK_SECRET` en el backend

### 5. Probar el Sistema

```bash
# Probar endpoints básicos
node test-payments.js

# Iniciar servidores
npm run dev  # Desde la raíz
```

## 💳 Flujo de Pago

### 1. **Pago Único (Tokens)**
```
Usuario → Selecciona paquete → PaymentForm → Stripe → Webhook → Tokens agregados
```

### 2. **Suscripción**
```
Usuario → Selecciona suscripción → Customer creado → Subscription creada → Stripe → Webhook → Acceso ilimitado
```

### 3. **Webhook Processing**
```
Stripe → Webhook → StripeService.handleWebhookEvent() → DatabaseService.savePayment() → Tokens agregados
```

## 🔧 Endpoints de la API

### `POST /api/payments/create-intent`
```json
{
  "amount": 999,
  "currency": "usd",
  "paymentMethod": "tokens",
  "packageId": "tokens_100"
}
```

### `GET /api/payments/packages`
```json
{
  "success": true,
  "packages": [
    {
      "id": "tokens_100",
      "name": "100 Tokens",
      "price": 999,
      "tokens": 100,
      "type": "tokens"
    }
  ]
}
```

### `POST /api/payments/webhook`
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_...",
      "amount": 999,
      "metadata": {
        "userId": "...",
        "packageId": "tokens_100"
      }
    }
  }
}
```

## 🗄️ Base de Datos

### Tabla `payments`
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  stripeId TEXT UNIQUE,
  description TEXT,
  metadata TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `tokens`
```sql
CREATE TABLE tokens (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  amount INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Componentes del Frontend

### `PaymentPackages.tsx`
- Muestra paquetes disponibles
- Formato de precios
- Selección de paquete

### `PaymentForm.tsx`
- Integración con Stripe.js
- Confirmación de pago
- Manejo de errores

### `/payments` (Página)
- Interfaz completa de compra
- Información y FAQ
- Navegación fluida

## 🔒 Seguridad

### ✅ **Implementado**
- Validación de webhooks con signature
- Autenticación JWT requerida
- No almacenamiento de datos de tarjetas
- Encriptación de extremo a extremo
- Rate limiting en endpoints

### 🛡️ **Buenas Prácticas**
- Usar HTTPS en producción
- Validar todos los inputs
- Logs de auditoría
- Manejo de errores robusto

## 🧪 Testing

### Script de Pruebas
```bash
node test-payments.js
```

### Pruebas Manuales
1. **Pago de prueba:**
   - Tarjeta: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos

2. **Pago fallido:**
   - Tarjeta: `4000 0000 0000 0002`

## 📊 Monitoreo

### Logs Importantes
```javascript
// Payment Intent creado
console.log(`✅ Payment Intent creado: ${paymentIntent.id}`);

// Webhook procesado
console.log(`✅ Webhook procesado: ${event.type}`);

// Tokens agregados
console.log(`✅ Agregados ${tokensToAdd} tokens para usuario ${userId}`);
```

### Métricas a Seguir
- Tasa de conversión de pagos
- Errores de webhook
- Tiempo de procesamiento
- Uso de tokens por usuario

## 🚀 Producción

### Checklist de Despliegue
- [ ] Cambiar a claves de producción de Stripe
- [ ] Configurar webhook con URL de producción
- [ ] Habilitar HTTPS
- [ ] Configurar logs de producción
- [ ] Probar pagos reales
- [ ] Configurar monitoreo

### Variables de Producción
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=production
```

## 🆘 Soporte

### Problemas Comunes
1. **Webhook no funciona:**
   - Verificar URL y secret
   - Revisar logs del servidor

2. **Payment Intent falla:**
   - Verificar claves de Stripe
   - Revisar autenticación

3. **Tokens no se agregan:**
   - Verificar webhook
   - Revisar base de datos

### Contacto
- Documentación: Este archivo
- Logs: `backend/logs/`
- Stripe Dashboard: [dashboard.stripe.com](https://dashboard.stripe.com)

---

**¡El sistema de pagos está listo para usar! 🎉** 
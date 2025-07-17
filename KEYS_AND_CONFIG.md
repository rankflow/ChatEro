# 🔑 Claves y Configuraciones para Despliegue Alpha

## 🚨 IMPORTANTE: Reemplaza estos valores con tus claves reales

### 🔐 JWT Secret (Generado automáticamente)
```
JWT_SECRET=xkAyQdClV8dEYfZouzp9bWTCjnNfKxuR3ArOtb+K3tU=
```

### 💳 Stripe Keys (Obtener desde https://dashboard.stripe.com/apikeys)
```
STRIPE_SECRET_KEY=sk_test_... (reemplazar con tu clave secreta)
STRIPE_PUBLISHABLE_KEY=pk_test_... (reemplazar con tu clave pública)
STRIPE_WEBHOOK_SECRET=whsec_... (reemplazar con tu webhook secret)
```

### 🤖 Venice AI Key (Obtener desde https://venice.ai)
```
VENICE_API_KEY=... (reemplazar con tu API key)
```

## 📋 Variables de Entorno Completas

### Railway (Backend)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:port/database (Railway lo genera automáticamente)
JWT_SECRET=xkAyQdClV8dEYfZouzp9bWTCjnNfKxuR3ArOtb+K3tU=
VENICE_API_KEY=tu-venice-api-key-aqui
VENICE_BASE_URL=https://api.venice.ai
STRIPE_SECRET_KEY=sk_test_tu-stripe-secret-key-aqui
STRIPE_WEBHOOK_SECRET=whsec_tu-webhook-secret-aqui
STRIPE_PUBLISHABLE_KEY=pk_test_tu-stripe-publishable-key-aqui
CORS_ORIGIN=https://chatero.chat
```

### Vercel (Frontend)
```bash
NEXT_PUBLIC_API_URL=https://tu-backend-railway-url.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu-stripe-publishable-key-aqui
NEXT_PUBLIC_APP_URL=https://chatero.chat
```

## 🔗 URLs de Referencia

### Railway Dashboard
- https://railway.app

### Vercel Dashboard
- https://vercel.com

### Stripe Dashboard
- https://dashboard.stripe.com/apikeys

### Venice AI Dashboard
- https://venice.ai

## 📝 Checklist de Configuración

### ✅ Preparación
- [x] Repositorio Git actualizado
- [x] Scripts de configuración creados
- [x] JWT Secret generado
- [ ] Obtener claves de Stripe
- [ ] Obtener API key de Venice AI

### 🔧 Railway (Backend)
- [ ] Crear proyecto en Railway
- [ ] Conectar repositorio GitHub
- [ ] Seleccionar carpeta 'backend'
- [ ] Agregar servicio PostgreSQL
- [ ] Configurar variables de entorno
- [ ] Desplegar backend
- [ ] Copiar URL del backend

### 🌐 Vercel (Frontend)
- [ ] Crear proyecto en Vercel
- [ ] Conectar repositorio GitHub
- [ ] Configurar directorio 'frontend'
- [ ] Configurar variables de entorno
- [ ] Desplegar frontend
- [ ] Agregar dominio chatero.chat

### 🔗 DNS y Dominio
- [ ] Configurar registros DNS
- [ ] Esperar activación SSL
- [ ] Verificar dominio

### 🧪 Verificación
- [ ] Probar frontend
- [ ] Probar backend
- [ ] Probar integración
- [ ] Revisar logs

## 🚨 Notas Importantes

1. **Nunca compartas las claves secretas**
2. **Usa claves de test para desarrollo**
3. **Cambia a claves de producción para live**
4. **Guarda las claves en un lugar seguro**
5. **Revisa los logs regularmente**

## 📞 Soporte

- **Railway**: Discord https://discord.gg/railway
- **Vercel**: https://vercel.com/docs
- **Stripe**: https://support.stripe.com
- **Venice AI**: https://venice.ai/support

---

**¡Listo para configurar el despliegue! 🚀** 
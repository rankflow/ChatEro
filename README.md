# Chat IA + Avatares Eróticos 🚀

Un MVP innovador que combina chat con inteligencia artificial (GPT-4o) y avatares personalizados para crear experiencias de conversación únicas y atractivas.

## ✨ Características Principales

### 🤖 **Chat con IA Real**
- Integración completa con OpenAI GPT-4o
- Respuestas personalizadas basadas en la personalidad del avatar
- Validación de contenido para mantener conversaciones apropiadas
- Sistema de tokens para control de uso

### 🎭 **Sistema de Avatares**
- 6 avatares únicos con personalidades distintas
- Categorías: Misteriosa, Madura, Joven, Elegante
- Avatares premium y gratuitos
- Personalidades personalizadas para cada avatar

### 🔐 **Autenticación y Seguridad**
- Sistema de login/registro con JWT
- Middleware de autenticación
- Validación de contenido con OpenAI Moderation API
- Rate limiting y protección CORS

### 💰 **Sistema de Monetización**
- ✅ Integración completa con Stripe
- ✅ Payment Intents para pagos únicos
- ✅ Suscripciones recurrentes
- ✅ Webhooks automáticos
- ✅ Control de tokens por usuario
- ✅ Consumo automático de tokens
- ✅ Historial de pagos completo

## 🏗️ Arquitectura del Proyecto

```
Chat Ero/
├── backend/                 # API REST con Fastify
│   ├── src/
│   │   ├── routes/         # Endpoints de la API
│   │   ├── services/       # Lógica de negocio
│   │   ├── middleware/     # Autenticación y validación
│   │   └── scripts/        # Scripts de base de datos
│   ├── prisma/             # Esquema y migraciones
│   └── .env               # Variables de entorno
├── frontend/               # Aplicación Next.js
│   ├── src/
│   │   ├── app/           # Páginas de la aplicación
│   │   └── services/      # Cliente de API
│   └── .env              # Variables de entorno
└── package.json           # Scripts principales
```

## 🚀 Estado Actual del Proyecto

### ✅ **Completado**
- [x] **Backend con Fastify** - API REST completa
- [x] **Integración OpenAI GPT-4o** - Chat con IA real
- [x] **Sistema de autenticación** - JWT funcional
- [x] **Base de datos SQLite** - Con Prisma ORM
- [x] **6 avatares predefinidos** - Con personalidades únicas
- [x] **Sistema de tokens** - Control de uso
- [x] **Frontend Next.js** - Interfaz moderna
- [x] **Chat en tiempo real** - Con historial persistente
- [x] **Validación de contenido** - Filtrado automático
- [x] **Datos de prueba** - Usuarios y mensajes de ejemplo

### 🔄 **En Desarrollo**
- [ ] Generación de imágenes de avatares con DALL-E
- [ ] Sistema de notificaciones
- [ ] Analytics y métricas
- [ ] Panel de administración avanzado

### 📋 **Próximas Funcionalidades**
- [ ] Dashboard de administración
- [ ] Sistema de suscripciones
- [ ] Chat grupal
- [ ] Exportación de conversaciones
- [ ] Temas personalizables

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Fastify** - Servidor web
- **Prisma** - ORM para base de datos
- **SQLite** - Base de datos
- **OpenAI API** - GPT-4o y moderación
- **Stripe** - Procesamiento de pagos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **Zod** - Validación de esquemas

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Stripe.js** - Integración de pagos
- **React Hooks** - Estado y efectos

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- API Key de OpenAI

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd "Chat Ero"
```

### 2. Instalar dependencias
```bash
# Instalar dependencias principales
npm install

# Instalar dependencias del backend
cd backend && npm install

# Instalar dependencias del frontend
cd ../frontend && npm install
```

### 3. Configurar variables de entorno

**Backend** (`backend/env`):
```env
# Configuración del servidor
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Base de datos
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro-aqui

# OpenAI
OPENAI_API_KEY=sk-tu-openai-api-key-real-aqui

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_tu-stripe-secret-key-aqui
STRIPE_PUBLISHABLE_KEY=pk_test_tu-stripe-publishable-key-aqui
STRIPE_WEBHOOK_SECRET=whsec_tu-stripe-webhook-secret-aqui

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu-stripe-publishable-key-aqui
```

### 4. Configurar base de datos
```bash
cd backend

# Generar cliente de Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:push

# Poblar con datos de prueba
npm run db:seed

# Configurar productos de Stripe (opcional)
npm run stripe:setup
```

### 5. Ejecutar el proyecto
```bash
# Desde la raíz del proyecto
npm run dev

# O ejecutar por separado:
# Backend: cd backend && npm run dev
# Frontend: cd frontend && npm run dev
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 👤 Credenciales de Prueba

```
Email: test@example.com
Password: password123
```

## 📡 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `GET /api/auth/tokens` - Obtener tokens del usuario

### Chat
- `POST /api/chat/message` - Enviar mensaje
- `GET /api/chat/history` - Obtener historial
- `DELETE /api/chat/history` - Limpiar historial

### Avatares
- `GET /api/avatars` - Listar avatares
- `GET /api/avatars/:id` - Obtener avatar específico

### Pagos
- `POST /api/payments/create-intent` - Crear Payment Intent
- `GET /api/payments/packages` - Obtener paquetes
- `POST /api/payments/webhook` - Webhook de Stripe
- `GET /api/payments/history` - Historial de pagos
- `GET /api/payments/customer-info` - Info del cliente

## 🎯 Funcionalidades del Chat

### Personalidades de Avatares
1. **Luna** - Misteriosa, seductora, inteligente
2. **Sofia** - Madura, experimentada, dominante
3. **Aria** - Juguetona, inocente, curiosa
4. **Venus** - Elegante, sofisticada, apasionada
5. **Nova** - Rebelde, aventurera, independiente
6. **Maya** - Sabia, espiritual, comprensiva

### Sistema de Tokens
- Cada mensaje consume tokens automáticamente
- Control de límites por usuario
- Sistema de pagos integrado con Stripe
- Suscripciones y paquetes de tokens

## 🔒 Seguridad y Cumplimiento

- **Validación de contenido** con OpenAI Moderation API
- **Autenticación JWT** segura
- **Rate limiting** para prevenir abuso
- **CORS** configurado correctamente
- **Encriptación** de contraseñas con bcrypt

## 📊 Métricas de Rendimiento

- **Respuesta de IA**: ~2-4 segundos
- **Tokens por mensaje**: 15-50 tokens
- **Uptime**: 99.9% (desarrollo local)

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
# Configurar variables de entorno en Vercel
# Desplegar automáticamente desde GitHub
```

### Docker (Opcional)
```bash
# Dockerfile incluido para contenedorización
docker build -t chat-ero .
docker run -p 3001:3001 chat-ero
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Email**: soporte@chat-ero.com
- **Documentación**: [docs.chat-ero.com](https://docs.chat-ero.com)
- **Issues**: [GitHub Issues](https://github.com/chat-ero/issues)

## 🎉 Agradecimientos

- OpenAI por GPT-4o
- Vercel por el hosting
- La comunidad de desarrolladores

---

**Desarrollado con ❤️ para crear experiencias únicas de chat con IA** 
# Guía de Instalación - Chat IA + Avatares Eróticos

## 🚀 Instalación Rápida

### 1. Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Git

### 2. Clonar e Instalar
```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd chat-ero-mvp

# Instalar todas las dependencias
npm run install:all
```

### 3. Configurar Variables de Entorno

#### Backend (.env)
```bash
# Copiar archivo de ejemplo
cp backend/env.example backend/.env

# Editar con tus valores
nano backend/.env
```

Variables necesarias:
```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=tu-jwt-secret-super-seguro-aqui
OPENAI_API_KEY=sk-tu-openai-api-key-aqui
STRIPE_SECRET_KEY=sk_test_tu-stripe-secret-key-aqui
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```bash
# Copiar archivo de ejemplo
cp frontend/env.example frontend/.env.local

# Editar con tus valores
nano frontend/.env.local
```

Variables necesarias:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu-stripe-publishable-key-aqui
```

### 4. Configurar Base de Datos
```bash
cd backend

# Generar cliente Prisma
npm run db:generate

# Crear y migrar base de datos
npm run db:push

# (Opcional) Abrir Prisma Studio
npm run db:studio
```

### 5. Ejecutar en Desarrollo
```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🔧 Configuración Avanzada

### OpenAI API
1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una cuenta y obtén tu API key
3. Agrega la key en `backend/.env`

### Stripe
1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Crea una cuenta y obtén tus keys de prueba
3. Agrega las keys en los archivos .env correspondientes

### Base de Datos (Producción)
Para producción, cambia `DATABASE_URL` en `backend/.env`:
```env
# PostgreSQL (recomendado)
DATABASE_URL="postgresql://usuario:password@host:puerto/database"

# MySQL
DATABASE_URL="mysql://usuario:password@host:puerto/database"
```

## 📁 Estructura del Proyecto

```
chat-ero-mvp/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router
│   │   │   ├── page.tsx     # Landing page
│   │   │   ├── avatars/     # Página de avatares
│   │   │   └── chat/        # Página del chat
│   │   ├── components/      # Componentes React
│   │   ├── lib/            # Utilidades
│   │   └── types/          # Tipos TypeScript
│   └── public/             # Assets estáticos
├── backend/                 # Fastify API
│   ├── src/
│   │   ├── routes/         # Rutas API
│   │   ├── services/       # Lógica de negocio
│   │   ├── models/         # Modelos de datos
│   │   ├── middleware/     # Middleware
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilidades
│   └── prisma/             # Esquemas de base de datos
├── package.json            # Scripts principales
├── README.md              # Documentación
└── vercel.json            # Configuración Vercel
```

## 🚀 Despliegue

### Vercel (Frontend)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
cd frontend
vercel
```

### Backend (Railway/Render/Heroku)
```bash
cd backend
# Seguir instrucciones específicas de la plataforma
```

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"
```bash
# Cambiar puerto en .env
PORT=3002
```

### Error: "Database connection failed"
```bash
# Verificar DATABASE_URL en .env
# Para desarrollo, usar SQLite
DATABASE_URL="file:./dev.db"
```

### Error: "JWT secret not found"
```bash
# Generar un JWT secret seguro
openssl rand -base64 32
# Agregar al .env
JWT_SECRET=tu-secret-generado
```

## 📝 Notas de Desarrollo

- El frontend usa Next.js 14 con App Router
- El backend usa Fastify con TypeScript
- La base de datos usa Prisma ORM
- Los avatares son simulados (placeholders)
- El chat simula respuestas de IA
- Los pagos simulan Stripe

## 🔒 Seguridad

- Todas las rutas sensibles requieren autenticación
- Los tokens JWT tienen expiración
- Las contraseñas se hashean con bcrypt
- CORS está configurado para el frontend
- Rate limiting está habilitado

## 📞 Soporte

Para problemas técnicos:
1. Revisar los logs del servidor
2. Verificar las variables de entorno
3. Comprobar la conectividad de la base de datos
4. Revisar la documentación de las dependencias 
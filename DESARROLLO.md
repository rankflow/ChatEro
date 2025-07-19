# 🚀 Desarrollo Local - Chat Ero

## 📋 Configuración

Los archivos de configuración del monorepo están renombrados para evitar conflictos con Vercel:
- `package.json` → `package.dev.json`
- `package-lock.json` → `package-lock.dev.json`

## 🛠️ Comandos de Desarrollo

### Opción 1: Script automático
```bash
./dev.sh
```

### Opción 2: Comandos manuales
```bash
# Instalar dependencias
npm install --prefix frontend
npm install --prefix backend

# Ejecutar frontend (puerto 3000)
cd frontend && npm run dev

# Ejecutar backend (puerto 3001)
cd backend && npm run dev
```

### Opción 3: Usar package.dev.json directamente
```bash
# Instalar dependencias del monorepo
npm install --prefix . --package-lock-only

# Ejecutar ambos servicios
npm run dev --prefix . --package-lock-only
```

## 🔧 Variables de Entorno

### Backend (`backend/env`)
```bash
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=tu-jwt-secret-super-seguro-aqui-cambiar-en-produccion
VENICE_API_KEY=2lVrq2Li0x6EPvpEavss544mEd7xF3OY1kVVTzDzmS
FRONTEND_URL=http://localhost:3000
ADDITIONAL_CORS_ORIGINS=https://chat-ero-1.vercel.app,https://chatero.chat
```

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu-stripe-publishable-key-aqui
```

## 🎯 URLs de Desarrollo
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555

## 🗄️ Base de Datos

### Desarrollo Local
```bash
# Usar schema de desarrollo (SQLite)
npx prisma studio --schema=./prisma/schema.prisma
```

### Producción
```bash
# Usar schema de producción (PostgreSQL)
npx prisma studio --schema=./prisma/schema.prod.prisma
```

## 📝 Notas Importantes
- Los archivos `package.dev.json` evitan que Vercel detecte el monorepo como un proyecto Next.js
- El script `dev.sh` automatiza el proceso de desarrollo
- Las variables de entorno están parametrizadas para múltiples entornos 
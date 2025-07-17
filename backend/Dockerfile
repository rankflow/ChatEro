FROM node:18-alpine

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para compilación)
RUN npm ci

# Copiar código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Eliminar devDependencies después de la compilación
RUN npm prune --production

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["npm", "start"] 
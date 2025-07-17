# Usar la imagen base de Node.js
FROM node:18-alpine

# Instalar librerías SSL necesarias para Prisma
RUN apk add --no-cache openssl libc6-compat

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar solo la carpeta backend
COPY backend/ .

# Instalar dependencias (incluyendo devDependencies para TypeScript)
RUN npm ci

# Construir la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"] 
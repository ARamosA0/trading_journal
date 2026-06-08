# ===== Build Stage =====
FROM node:22-alpine AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar proyecto
COPY . .

# Build de producción
RUN npm run build

# ===== Production Stage =====
FROM nginx:stable-alpine

# Copiar build generado por Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

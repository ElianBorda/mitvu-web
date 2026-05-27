# ============================================================
#  Dockerfile — Frontend React + Vite (miTVU) para Railway
# ============================================================

# ── Etapa 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifiestos de dependencias primero (caché de capas)
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Build de producción — VITE_API_URL se inyecta como build arg
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Etapa 2: Servidor Nginx con SPA fallback ─────────────────
FROM nginx:stable-alpine AS runtime

# Eliminar config default de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada con SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el build de Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Script de inicio que reemplaza el puerto dinámico de Railway
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]

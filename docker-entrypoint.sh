#!/bin/sh
# ============================================================
#  docker-entrypoint.sh — Inyecta $PORT de Railway en Nginx
# ============================================================

# Railway inyecta $PORT dinámicamente. Nginx no lee variables de entorno
# directamente, así que reemplazamos el placeholder en el config.

PORT="${PORT:-80}"

# Reemplazar el placeholder __PORT__ con el valor real de $PORT
sed -i "s/__PORT__/$PORT/g" /etc/nginx/conf.d/default.conf

echo "Iniciando Nginx en puerto $PORT..."

# Arrancar Nginx en primer plano
exec nginx -g "daemon off;"

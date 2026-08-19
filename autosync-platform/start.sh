#!/bin/bash
# Wrapper para arrancar AutoSync Platform con todas las variables de entorno
cd /home/z/my-project/autosync-platform

# Variables de entorno requeridas
export DATABASE_URL='postgresql://neondb_owner:npg_6DeGKLnaqs5T@ep-quiet-mud-ayk9j0fm-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
export JWT_SECRET='autosync-jwt-secret-prod-2025'
export RESEND_API_KEY=''

echo "[start.sh] DATABASE_URL set: ${DATABASE_URL:0:30}..."
echo "[start.sh] JWT_SECRET set: ${JWT_SECRET:0:10}..."
echo "[start.sh] Arrancando next dev en puerto 3000"

# Arrancar Next.js
exec npx next dev --port 3000

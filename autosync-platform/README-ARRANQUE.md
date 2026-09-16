# Instrucciones de Arranque — AutoSync Platform

## Para el asistente nuevo

Este ZIP contiene el proyecto completo de AutoSync Platform. Seguí estos pasos:

### 1. Descomprimir el ZIP
```bash
cd /home/z/my-project
unzip autosync-platform.zip
# Esto crea /home/z/my-project/autosync-platform/
```

### 2. Leer el contexto
Leé el archivo `ESTADO.md` en `/home/z/my-project/autosync-platform/ESTADO.md` para tener el contexto completo del proyecto.

### 3. Crear .env.local
```bash
cat > /home/z/my-project/autosync-platform/.env.local << 'EOF'
DATABASE_URL=postgresql://neondb_owner:npg_6DeGKLnaqs5T@ep-quiet-mud-ayk9j0fm-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=autosync-jwt-secret-prod-2025
RESEND_API_KEY=
EOF
```

### 4. Instalar dependencias
```bash
cd /home/z/my-project/autosync-platform
npm install
npx prisma generate
```

### 5. Arrancar el server
```bash
# Instalar pm2 si no está instalado
npm install -g pm2

# Arrancar con pm2 (mantiene el server corriendo)
pm2 start start.sh --name autosync-platform

# Verificar
pm2 list
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000
```

### 6. Para tomar capturas de pantalla
```bash
# Instalar agent-browser si no está instalado
npm install -g agent-browser

# Tomar captura de la home
agent-browser open http://localhost:3000
agent-browser screenshot --full /home/z/my-project/download/screenshots/home.png
```

### 7. Para ver capturas previas ya tomadas
Las capturas están en `/home/z/my-project/autosync-platform/screenshots/` (incluidas en el ZIP):
- 01-home.png - Home
- 02-login.png - Login
- 03-talleres.png - Directorio de talleres
- 04-taller-dashboard.png - Dashboard del taller
- 05-taller-vehiculos.png - Vehículos del taller
- 06-taller-carga-rapida.png - Carga rápida
- 07-taller-turnos.png - Turnos
- 08-taller-perfil.png - Perfil del taller
- 09-taller-diagnosticos.png - Diagnósticos
- 10-taller-estadisticas.png - Estadísticas
- 11-fondo-A-mesh.png - Opción fondo: Mesh Gradient
- 12-fondo-B-particulas.png - Opción fondo: Partículas Network
- 13-fondo-C-aurora.png - Opción fondo: Aurora Suave

### 8. Para loguearse como taller (para ver el panel)
```bash
agent-browser open http://localhost:3000/login
agent-browser snapshot -i
# Te muestra campos con refs como @e4 @e5 @e6
agent-browser fill @e4 "ejemplo@ejemplo.com"
agent-browser fill @e5 "test1234"
agent-browser click @e6
sleep 3
# Ahora estás logueado como taller
# Podés navegar a /app/taller y tomar capturas
```

### 9. Deploy a Vercel
- El repo está en GitHub: `https://github.com/autosynctaller/autosync-platform`
- Cada push a main branch deploya automáticamente a `autosync-platform.vercel.app`
- Para hacer push:
```bash
cd /home/z/my-project/autosync-platform
git add .
git commit -m "descripción del cambio"
git push origin main
```
⚠️ Si pide credenciales, pedile al usuario su GitHub Personal Access Token.

### 10. Estado actual del proyecto
- ✅ Server local: corriendo con pm2 (3h uptime al momento de empaquetar)
- ✅ DB Neon: sincronizada con schema (535 cronogramas, varios talleres y vehículos de prueba)
- ✅ Deploy en Vercel: autosync-platform.vercel.app
- 🔲 Pendiente: elegir fondo dinámico, mejoras en panel taller, integración Mercado Pago, etc.

### 11. Para ver capturas en el chat
Cuando tomes una captura, guardala en `/home/z/my-project/download/screenshots/`. El usuario puede verla desde el explorador de archivos del chat ("todos los archivos en la tarea").

### 12. Importante
- **NO deployar a Vercel en cada cambio**. Agrupar 3-5 cambios confirmados por el usuario antes de hacer push.
- **Usar capturas de pantalla** para mostrar cambios al usuario antes de deployar.
- **Las credenciales de prueba** son: `ejemplo@ejemplo.com` / `test1234` (rol TALLER).
- **No tocar el usuario admin@autosync.com.ar** sin permiso del usuario.

### 13. Si el usuario pregunta por algo que no está en ESTADO.md
Decile: *"No tengo ese contexto en el ESTADO.md. ¿Podés pasarme la info para que la agregue al proyecto?"*

### 14. Siguiente paso inmediato
El usuario quiere elegir entre 3 fondos dinámicos (Mesh, Partículas, Aurora) y avanzar con la sección taller. Mirá las capturas 11, 12 y 13 para ver las opciones, y pedile al usuario que elija una.

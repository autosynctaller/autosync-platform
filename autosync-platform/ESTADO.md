# AutoSync Platform - Estado del Proyecto

## IMPORTANTE — Leé esto primero
Este archivo es el contexto completo del proyecto AutoSync Platform. Si estás en una conversación nueva y te pidieron que leas esto, **tenés todo el contexto acá** para continuar trabajando sin perder nada.

## Qué es
Plataforma multi-taller estilo Carfax argentino. Dueños reclaman sus autos, talleres cargan trabajos. Gratis para todos, premium con stock. Deploy en producción en `autosync-platform.vercel.app`.

## Ubicación del proyecto
`/home/z/my-project/autosync-platform/`

## Repo de GitHub (privado)
`https://github.com/autosynctaller/autosync-platform`
Usuario: `autosynctaller`

## Variables de entorno (.env.local)
```
DATABASE_URL=postgresql://neondb_owner:npg_6DeGKLnaqs5T@ep-quiet-mud-ayk9j0fm-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=autosync-jwt-secret-prod-2025
RESEND_API_KEY=
```

## Producción (Vercel)
- URL: `autosync-platform.vercel.app`
- Deploy: cada push a main branch de GitHub deploya automáticamente
- Plan Hobby: 100 deploys/mes gratuito

## Stack técnico
- Next.js 16 + TypeScript + App Router
- Prisma + PostgreSQL (Neon)
- JWT + bcrypt + cookies httpOnly
- PWA (manifest + service worker)
- Tailwind CSS 4
- pm2 para mantener el server local corriendo

## Cómo arrancar el server local
```bash
# 1. Crear .env.local con las variables de arriba
cd /home/z/my-project/autosync-platform
cat > .env.local << 'EOF'
DATABASE_URL=postgresql://neondb_owner:npg_6DeGKLnaqs5T@ep-quiet-mud-ayk9j0fm-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=autosync-jwt-secret-prod-2025
RESEND_API_KEY=
EOF

# 2. Instalar dependencias
npm install

# 3. Generar cliente Prisma
npx prisma generate

# 4. Sincronizar schema con DB
npx prisma db push

# 5. Arrancar con pm2 (mantiene el server corriendo)
npm install -g pm2  # si no está instalado
pm2 start start.sh --name autosync-platform
# Server en http://localhost:3000
```

## Script start.sh (ya está en el proyecto)
Es un wrapper que exporta las variables de entorno antes de arrancar `next dev --port 3000`. Evita que las variables se pierdan al forkear el proceso.

## URL pública del server local (proxy Caddy)
```
http://21.0.20.239:81/?XTransformPort=3000
```
El puerto 81 corre Caddy como proxy. El parámetro `?XTransformPort=3000` le dice a Caddy que redirija al puerto 3000.

⚠️ Esta IP puede cambiar entre sesiones. Para obtener la nueva IP:
```bash
hostname -i
```

## Roles (3 tipos de usuario)
1. **SUPER_ADMIN** - Panel en /app/admin, gestiona todo
2. **TALLER** - Panel en /app/taller, carga trabajos a cualquier patente
3. **DUENO** - Panel en /app/dueno, reclama su auto y ve historial

## Usuarios de prueba en la DB
| Email | Rol | Password |
|-------|-----|----------|
| admin@autosync.com.ar | SUPER_ADMIN | (original, sin resetear) |
| ejemplo@ejemplo.com | TALLER "Ejemplo" | `test1234` (reseteada 2026-08-18) |
| ej@gmaiol | TALLER "carlito" | (original) |
| gep89dmq@outlook.es | DUENO | (original) |

Para resetear una password (script en `/home/z/my-project/scripts/reset-pwd-taller.js`):
```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();
(async () => {
  const hashed = await bcrypt.hash('test1234', 10);
  await db.user.update({ where: { email: 'ejemplo@ejemplo.com' }, data: { password: hashed } });
  await db.$disconnect();
})();
```

## Estructura del panel TALLER (/app/taller)
13 secciones:
- `/app/taller` (dashboard)
- `/app/taller/vehiculos` + `/vehiculos/[id]`
- `/app/taller/carga-rapida` (carga rápida de trabajo)
- `/app/taller/diagnosticos`
- `/app/taller/turnos`
- `/app/taller/stock` (Premium)
- `/app/taller/presupuestos` + `/presupuestos/nuevo` (Premium)
- `/app/taller/recordatorios`
- `/app/taller/servicios`
- `/app/taller/estadisticas`
- `/app/taller/perfil`

## Estructura del panel DUENO (/app/dueno)
- Servicios y trámites (VTV, GNC, etc.)

## Estructura del panel ADMIN (/app/admin)
5 secciones:
- Stats
- Vehículos
- Usuarios (con reset password)
- Talleres
- Anuncios (sistema de publicidad con métricas)

## Schema Prisma (23+ tablas)
User, Taller, Vehiculo, Trabajo, FotoTrabajo, Diagnostico, DocumentoVehiculo, Turno, Producto, MovimientoStock, Presupuesto, Anunciante, Anuncio, ClickAnuncio, CronogramaService, etc.

Archivo: `prisma/schema.prisma`

## Features implementadas
- ✅ Multi-tenant con 3 roles
- ✅ Sistema de turnos online
- ✅ Sistema de publicidad (anuncios con métricas, CTR, targeting)
- ✅ Cronogramas de service (535 cronogramas de 20 marcas hasta 500k km)
- ✅ Generador de PDF del historial (jsPDF)
- ✅ Dropdowns en cascada para selección de vehículo (marca→año→modelo)
- ✅ Diagnósticos con búsqueda global y categorías de fotos
- ✅ PWA (Progressive Web App)
- ✅ Sistema de stock y presupuestos (Premium)

## Features pendientes
- 🔲 Sistema de pagos con Mercado Pago (para plan Premium)
- 🔲 Migrar datos del AutoSync original al nuevo
- 🔲 Conectar dominio autosync.com.ar a la nueva plataforma
- 🔲 Configurar Resend para mails automáticos
- 🔲 Consulta de VIN por patente (DataLo) con cache para no gastar consultas
- 🔲 PWA pulir (service worker offline real)
- 🔲 Elegir e implementar fondo dinámico para la home (3 opciones en /fondos)

## Decisiones de diseño actuales
- Plan Free: gratis para dueños y talleres (sin stock/presupuestos)
- Plan Premium: stock + presupuestos (cuando se implemente Mercado Pago)
- Taller carga trabajos a CUALQUIER patente (no necesita reclamar)
- Dueño debe reclamar su auto para verlo en su panel

## Página de comparación de fondos dinámicos
En `/fondos` hay 3 opciones de fondo animado para la home:
- **Opción A: Mesh Gradient** - Multicolor (azul/morado/cyan/rosa) que se mueve en ondas
- **Opción B: Partículas Network** - Puntos azules que se conectan con líneas tipo tech
- **Opción C: Aurora Suave** - Tres blobs de color (verde/morado/naranja) moviéndose lento con blur

Capturas en `screenshots/11-fondo-A-mesh.png`, `12-fondo-B-particulas.png`, `13-fondo-C-aurora.png`.

## Flujo de trabajo recomendado
1. Modificar código en local
2. Tomar capturas con agent-browser
3. El usuario revisa capturas y aprueba
4. Cuando hay 3-5 cambios confirmados, 1 solo push a GitHub = 1 deploy a Vercel
5. Repetir

## Cómo tomar capturas (agent-browser ya instalado global)
```bash
agent-browser open http://localhost:3000
agent-browser screenshot --full /home/z/my-project/download/screenshots/nombre.png
```

Para loguearse como taller antes de tomar capturas:
```bash
agent-browser open http://localhost:3000/login
agent-browser snapshot -i
# Te muestra los campos con refs como @e4 @e5 @e6
agent-browser fill @e4 "ejemplo@ejemplo.com"
agent-browser fill @e5 "test1234"
agent-browser click @e6
# Después navegás a las rutas del panel y capturás
```

## Deploy a Vercel
- Push a main branch de GitHub deploya automáticamente
- URL producción: autosync-platform.vercel.app
- Para ver variables de entorno de Vercel: Settings → Environment Variables
- Plan Hobby: 100 deploys/mes (cada push a main = 1 deploy)

## Log de cambios recientes
- 2026-08-18: Creada página /fondos con 3 opciones de fondo dinámico (mesh, partículas, aurora)
- 2026-08-18: Configurado pm2 + start.sh para mantener server corriendo
- 2026-08-18: Encontrado proxy Caddy en puerto 81 con parámetro ?XTransformPort=3000
- 2026-08-18: Reset password de ejemplo@ejemplo.com a test1234
- 2026-08-18: Tomadas capturas del panel taller y de los 3 fondos dinámicos

## Archivos importantes del proyecto
- `prisma/schema.prisma` - Schema de la DB (23+ tablas)
- `src/lib/auth.ts` - Autenticación JWT
- `src/lib/db.ts` - Cliente Prisma
- `src/lib/pdf.ts` - Generador de PDF
- `src/app/api/` - Todas las APIs (auth, vehiculos, talleres, turnos, stock, presupuestos, admin, anuncios, cronogramas, modelos)
- `src/app/app/` - Paneles (admin, taller, dueno)
- `src/app/fondos/page.tsx` - Página de comparación de fondos dinámicos
- `src/components/site/` - AdBanner, TallerWidgets, etc.
- `start.sh` - Script wrapper para arrancar con variables de entorno
- `.env.local` - Variables de entorno locales (NO incluido en ZIP por seguridad)

## Capturas de pantalla tomadas (en /home/z/my-project/download/screenshots/)
- `01-home.png` - Home de la plataforma
- `02-login.png` - Pantalla de login
- `03-talleres.png` - Directorio público de talleres
- `04-taller-dashboard.png` - Dashboard del panel taller
- `05-taller-vehiculos.png` - Lista de vehículos del taller
- `06-taller-carga-rapida.png` - Carga rápida de trabajo
- `07-taller-turnos.png` - Turnos online
- `08-taller-perfil.png` - Perfil del taller
- `09-taller-diagnosticos.png` - Diagnósticos
- `10-taller-estadisticas.png` - Estadísticas
- `11-fondo-A-mesh.png` - Opción de fondo: Mesh Gradient
- `12-fondo-B-particulas.png` - Opción de fondo: Partículas Network
- `13-fondo-C-aurora.png` - Opción de fondo: Aurora Suave

## Usuario y contexto
- Usuario: dueño de taller mecánico en Mar del Plata, Argentina
- Plataforma para todos los talleres del país
- Zona horaria: America/Buenos_Aires
- Idioma: español (argentina)

## Pendiente inmediato (siguiente iteración)
1. El usuario debe elegir cuál de los 3 fondos dinámicos le gusta más
2. Implementar el fondo elegido en la home
3. Avanzar con mejoras en el panel taller (definir cuáles con el usuario)
4. Deployar a Vercel cuando estén confirmados 3-5 cambios

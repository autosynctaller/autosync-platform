# 🚀 Guía de Publicación - AutoSync

Esta guía te lleva paso a paso para publicar la web en internet con dominio .com.ar y mails automáticos.

**Tiempo total estimado: 1-2 horas**

---

## 📋 Resumen de lo que vas a necesitar

| Recurso | Costo | Dónde |
|---------|-------|-------|
| Cuenta en Vercel | GRATIS | vercel.com |
| Cuenta en Resend | GRATIS (100 mails/día) | resend.com |
| Cuenta en GitHub | GRATIS | github.com |
| Dominio .com.ar | ~$2.000-3.000 ARS/año | nic.ar o DonWeb |
| Hosting | GRATIS | Vercel |

---

## 🗺️ Pasos a seguir (en orden)

1. **Crear cuentas** (15 min) - Vercel, GitHub, Resend
2. **Subir el código a GitHub** (10 min)
3. **Publicar en Vercel** (10 min) - tu web ya está online en autosync.vercel.app
4. **Configurar mails con Resend** (15 min)
5. **Comprar dominio .com.ar** (10 min)
6. **Conectar dominio a Vercel** (15 min)
7. **Verificar dominio en Resend** (15 min)
8. **Probar todo** (10 min)

---

## 1️⃣ Crear cuentas (gratis)

### GitHub
1. Andá a https://github.com/signup
2. Creá una cuenta con tu email
3. Elegí un nombre de usuario (ej: `taller-autosync`)

### Vercel
1. Andá a https://vercel.com/signup
2. Elegí "Continue with GitHub" (usá la cuenta que creaste arriba)
3. Autorizá a Vercel a acceder a tu GitHub

### Resend (para mails automáticos)
1. Andá a https://resend.com/signup
2. Creá una cuenta con tu email
3. En el dashboard, vas a ver tu **API Key** (la vas a necesitar después)

---

## 2️⃣ Subir el código a GitHub

### Opción A: Subir desde tu computadora

1. Descargá el archivo `autosync-proyecto-completo.tar.gz` que te pasé
2. Descomprimilo en una carpeta
3. Abrí una terminal en esa carpeta y ejecutá:

```bash
# Inicializar repositorio git
git init
git add .
git commit -m "AutoSync - versión inicial"

# Crear repositorio en GitHub (desde la web de GitHub)
# Después conectalo:
git remote add origin https://github.com/TU_USUARIO/autosync.git
git branch -M main
git push -u origin main
```

### Opción B: Subir desde la web de GitHub

1. En GitHub, hacé clic en "New repository"
2. Nombralo `autosync`
3. Hacé clic en "uploading an existing file"
4. Arrastrá todos los archivos del proyecto
5. Hacé clic en "Commit changes"

---

## 3️⃣ Publicar en Vercel

1. Andá a https://vercel.com/new
2. Elegí tu repositorio `autosync` de GitHub
3. Vercel detecta Next.js automáticamente, no toques nada
4. Hacé clic en "Deploy"
5. ¡Esperá 2-3 minutos y ya está online!

Tu web va a estar en una dirección tipo:
```
https://autosync-xxxxx.vercel.app
```

### ⚠️ IMPORTANTE: Configurar variables de entorno

Antes de que funcione todo, tenés que configurar las variables en Vercel:

1. En Vercel, andá a tu proyecto → **Settings** → **Environment Variables**
2. Agregá estas variables (una por una):

| Nombre | Valor |
|--------|-------|
| `ADMIN_PIN` | `1989` (o el PIN que quieras) |
| `DATABASE_URL` | ver paso siguiente ⬇️ |

### 🗄️ Configurar base de datos (IMPORTANTE)

Vercel no soporta SQLite (es solo para desarrollo). Tenés que usar **PostgreSQL** gratis:

1. En Vercel, andá a **Storage** → **Create Database** → **Postgres** ( Neon)
2. Llamalo `autosync-db`
3. Una vez creado, hacé clic en "**Connect to project**"
4. Vercel te va a dar una `DATABASE_URL` automáticamente

Después, en tu computadora, editá el archivo `prisma/schema.prisma` y cambiá:

```prisma
datasource db {
  provider = "postgresql"  // ← cambiar de sqlite a postgresql
  url      = env("DATABASE_URL")
}
```

Subí ese cambio a GitHub y Vercel lo va a deployar automáticamente.

Después, para crear las tablas en la base de datos nueva, en Vercel andá a:
- **Storage** → tu base de datos → **Query** → ejecutá:
```sql
-- Esto lo hacemos desde la terminal de tu compu, ver DEPLOY-DB.md más abajo
```

---

## 4️⃣ Configurar mails con Resend

1. Andá a https://resend.com/dashboard
2. Copiá tu **API Key** (empieza con `re_...`)
3. En Vercel, agregá esta variable de entorno:

| Nombre | Valor |
|--------|-------|
| `RESEND_API_KEY` | `re_tu_api_key_aqui` |

4. También agregá:

| Nombre | Valor |
|--------|-------|
| `RESEND_FROM_EMAIL` | `notificaciones@autosync.com.ar` |
| `RESEND_FROM_NAME` | `AutoSync - Taller Mecánico` |
| `CRON_SECRET` | (generá uno aleatorio de 32 caracteres) |

### Probar que el email funcione

Mientras verificás tu dominio (paso 7), podés probar mandando un email de test.

Para esto, Resend te da un email de prueba gratis: `delivered@resend.dev`

Desde una terminal:
```bash
curl "https://TU-DOMINIO.vercel.app/api/cron/test-email?email=delivered@resend.dev" \
  -H "x-admin-pin: TU_PIN"
```

Si devuelve `{"ok": true}`, ¡los mails funcionan!

---

## 5️⃣ Comprar dominio .com.ar

### En Nic.ar (más barato, pero más burocrático)
1. Andá a https://nic.ar
2. Buscá tu dominio: `autosync.com.ar`
3. Si está libre, compralo (~$2.500 ARS/año)
4. Vas a recibir un email con instrucciones para pagarlo por transferencia o PagoFácil

### En DonWeb o Hostinger (más fácil, un poco más caro)
1. Andá a https://donweb.com
2. Buscá `autosync.com.ar`
3. Compralo con tarjeta de crédito (~$3.000 ARS/año)

**Recomendación:** Si no tenés experiencia, usá DonWeb. Es más caro pero más simple.

---

## 6️⃣ Conectar dominio a Vercel

1. En Vercel, andá a tu proyecto → **Settings** → **Domains**
2. Escribí `autosync.com.ar` y hacé clic en "Add"
3. También agregá `www.autosync.com.ar`
4. Vercel te va a dar instrucciones de qué **DNS** configurar en tu registrador

### Configurar DNS en Nic.ar / DonWeb

Andá al panel de tu registrador de dominio y configurá:

**Registro A:**
```
Tipo: A
Nombre: @
Valor: 76.76.21.21
```

**Registro CNAME:**
```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

Esperá de 5 minutos a 24 horas para que se propaguen los DNS (suele tardar 30 min).

Tu web va a estar accesible en:
```
https://autosync.com.ar
```

---

## 7️⃣ Verificar dominio en Resend

Para poder mandar mails desde `notificaciones@autosync.com.ar`, tenés que verificar el dominio en Resend:

1. Andá a https://resend.com/domains
2. Hacé clic en "Add Domain"
3. Escribí `autosync.com.ar`
4. Resend te va a dar registros DNS para agregar:

**Ejemplo (los valores reales te los da Resend):**
```
Tipo: MX
Nombre: bounce.autosync.com.ar
Valor: feedback-smtp.us-east-1.amazonses.com

Tipo: TXT
Nombre: @
Valor: "v=spf1 include:amazonses.com ~all"

Tipo: TXT
Nombre: resend._domainkey
Valor: "v=DKIM1; k=rsa; p=..."
```

5. Agregá esos registros en el panel de tu registrador de dominio (Nic.ar / DonWeb)
6. Volvé a Resend y hacé clic en "Verify" (puede tardar hasta 48 horas, pero suele ser rápido)

¡Listo! Ahora podés mandar mails desde `notificaciones@autosync.com.ar`

---

## 8️⃣ Probar todo

### Probar la web
- Entrá a https://autosync.com.ar
- Probá registrar un vehículo
- Probá consultar el historial por patente
- Entrá al panel admin con tu PIN

### Probar los mails

**Mandar email de test:**
```bash
curl "https://autosync.com.ar/api/cron/test-email?email=tu-email@gmail.com" \
  -H "x-admin-pin: TU_PIN"
```

**Ejecutar el cron manualmente (para probar recordatorios):**
```bash
curl "https://autosync.com.ar/api/cron/recordatorios" \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

Te va a devolver un JSON con cuántos mails se mandaron.

---

## 🔄 Migración de base de datos (IMPORTANTE)

Como cambiaste de SQLite (desarrollo) a PostgreSQL (producción), tenés que crear las tablas en la nueva base de datos y cargar los datos iniciales.

### Desde tu computadora, en la carpeta del proyecto:

```bash
# 1. Instalar dependencias
bun install

# 2. Configurar temporalmente la URL de producción
# Editá el archivo .env y poné la DATABASE_URL de Vercel

# 3. Crear las tablas
bunx prisma db push

# 4. Cargar datos iniciales (servicios)
bun run scripts/seed.ts

# 5. Cargar cronogramas
bun run scripts/seed-cronogramas.ts
bun run scripts/seed-cronogramas-extra.ts
bun run scripts/seed-km-altos.ts
bun run scripts/seed-modelos-faltantes.ts

# 6. Restaurar el .env original (SQLite local) para seguir desarrollando local
```

---

## 📞 Soporte

Si tenés problemas en algún paso, decime cuál y te ayudo. Los problemas más comunes son:

1. **"No funciona el panel admin"** → Olvidaste configurar `ADMIN_PIN` en Vercel
2. **"No se ven los vehículos"** → No creaste las tablas en PostgreSQL (`prisma db push`)
3. **"No llegan los mails"** → Falta verificar el dominio en Resend
4. **"El dominio no funciona"** → Los DNS todavía no se propagaron (esperá 24hs)

---

## ✅ Checklist final

Marcá cada item cuando lo completes:

- [ ] Cuenta de GitHub creada
- [ ] Código subido a GitHub
- [ ] Cuenta de Vercel creada
- [ ] Proyecto deployado en Vercel
- [ ] Base de datos PostgreSQL creada y conectada
- [ ] Variables de entorno configuradas (ADMIN_PIN, DATABASE_URL)
- [ ] Tablas creadas en PostgreSQL (prisma db push)
- [ ] Datos iniciales cargados (seeds)
- [ ] Cuenta de Resend creada
- [ ] API key de Resend en Vercel
- [ ] Dominio .com.ar comprado
- [ ] Dominio conectado a Vercel
- [ ] Dominio verificado en Resend
- [ ] Email de test funcionando
- [ ] Cron de recordatorios configurado

¡Cuando tengas todo esto, tu web va a estar 100% operativa con mails automáticos!

---

© 2026 AutoSync - Taller Mecánico

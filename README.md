# AutoSync - Taller Mecánico

Web completa para taller mecánico en Mar del Plata, Argentina.
Construida con Next.js 16, TypeScript, Prisma (SQLite) y Tailwind CSS + shadcn/ui.

## 🔧 Para arrancar el proyecto (si lo abrís en otro lado)

### Requisitos
- Node.js 18+ o Bun instalado
- Un editor de código (recomendado: VS Code)

### Pasos
```bash
# 1. Instalar dependencias
bun install
# o: npm install

# 2. Crear la base de datos
bun run db:push
# o: npx prisma db push

# 3. Cargar datos iniciales (servicios, cronogramas)
bun run scripts/seed.ts
bun run scripts/seed-cronogramas.ts
bun run scripts/seed-cronogramas-extra.ts
bun run scripts/seed-km-altos.ts
bun run scripts/seed-modelos-faltantes.ts

# 4. Iniciar el servidor de desarrollo
bun run dev
# o: npm run dev
```

Abrí http://localhost:3000 en tu navegador.

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── api/                    # Endpoints REST
│   │   ├── admin/              # Login admin (PIN)
│   │   ├── cronogramas/        # Cronogramas de services por marca/modelo
│   │   ├── estadisticas/       # Estadísticas del taller
│   │   ├── recordatorios/      # Sistema de recordatorios
│   │   ├── servicios/          # Catálogo de servicios
│   │   ├── trabajos/           # CRUD de trabajos
│   │   │   └── [id]/
│   │   └── vehiculos/          # CRUD de vehículos
│   │       └── [id]/
│   │           ├── fotos/      # Subida/listado/borrado de fotos
│   │           └── documentos/ # Subida/listado/borrado de PDFs
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Página principal
├── components/
│   ├── site/                   # Componentes de la web pública
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── ServiciosSection.tsx
│   │   ├── SobreNosotros.tsx
│   │   ├── RegistrarVehiculo.tsx
│   │   ├── ConsultarHistorial.tsx
│   │   ├── Contacto.tsx
│   │   ├── Footer.tsx
│   │   └── AdminPanel.tsx      # Panel de administración completo
│   └── ui/                     # Componentes shadcn/ui
├── lib/
│   ├── db.ts                   # Cliente de Prisma
│   ├── format.ts               # Formateo de precios, fechas, patentes
│   └── pdf-historial.ts        # Generador de PDF del historial (jsPDF)
└── hooks/
    ├── use-toast.ts
    └── use-mobile.ts

prisma/
└── schema.prisma               # Esquema de la base de datos

scripts/
├── seed.ts                     # Servicios iniciales (11)
├── seed-cronogramas.ts         # Cronogramas básicos (50)
├── seed-cronogramas-extra.ts   # Más marcas y modelos (114)
├── seed-km-altos.ts            # Services hasta 500.000 km (147)
├── seed-modelos-faltantes.ts   # Modelos específicos faltantes (104)
└── ajustar-servicios.ts        # Ajustes puntuales

public/
├── logo-autosync-light.png     # Logo para fondos claros
├── logo-autosync-dark.png      # Logo transparente para fondos oscuros
├── favicon-autosync.png        # Favicon
└── uploads/                    # Fotos y documentos subidos
    ├── vehiculos/
    └── documentos/

db/
└── custom.db                   # Base de datos SQLite (incluye tus datos actuales)
```

## 🎯 Funcionalidades

### Para el cliente (público, sin PIN)
- Ver catálogo de servicios
- Registrar vehículo con datos completos
- Consultar historial por patente
- Ver fotos del vehículo
- Ver badges de VTV/GNC (al día, por vencer, vencida)
- Editar color, km (solo aumentar) y notas de su vehículo
- Botón "Agregar nota" para mensajes rápidos al taller
- Exportar historial a PDF

### Para el taller (admin, PIN: 1989)
- Ver y buscar todos los vehículos
- Avisos visuales cuando un cliente actualiza sus notas
- Editar todos los datos del vehículo + notas internas
- Cargar, editar y eliminar trabajos (con fecha, km, precio, estado, próxima revisión, recordatorio, notas internas)
- Subir y gestionar fotos (públicas y privadas)
- Subir y gestionar documentos PDF (informes de scanner, etc.)
- Cronograma de services sugerido según marca y km del vehículo (415 cronogramas de 20 marcas, hasta 500.000 km)
- Sección de recordatorios (trabajos + VTV + GNC) con botón de WhatsApp/Email
- Estadísticas del taller (vehículos, clientes, trabajos, ingresos, gráficos, top servicios)

## 🔒 Seguridad

- PIN del admin: `1989` (configurable en .env con variable `ADMIN_PIN`)
- El cliente solo puede editar color, km (solo aumentarlo) y notas
- El admin puede editar todo
- Las notas internas y fotos privadas NO las ve el cliente
- Los documentos (PDFs) siempre son privados del taller

## 📊 Datos precargados

- **11 servicios** del catálogo (cambio de aceite, frenos, diagnóstico, etc.)
- **415 cronogramas** de services de **20 marcas** (Toyota, Ford, VW, Chevrolet, Renault, Peugeot, Honda, Fiat, Nissan, Citroën, Hyundai, Kia, BMW, Audi, Mercedes-Benz, Jeep, Mitsubishi, Suzuki, Mazda, Chery, Geely)
- Services desde 10.000 km hasta 500.000 km
- Modelos específicos: Hilux, Corolla, Etios, SW4, Yaris, RAV4, Ranger, EcoSport, Fiesta, Focus, Territory, Amarok, Gol, Suran, Vento, T-Cross, Taos, Nivus, Sandero, Logan, Kwid, Duster, Kangoo, Trafic, Cronos, Toro, Strada, Pulse, Onix, Prisma, S10, Tracker, Spin, 208, 2008, Partner, Civic, CR-V, Fit, HR-V, Versa, Frontier, Kicks, C3, C4 Cactus, HB20, Creta

## 🛠️ Tecnologías

- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript 5
- **Base de datos**: SQLite con Prisma ORM
- **Estilos**: Tailwind CSS 4 + shadcn/ui (componentes)
- **Íconos**: Lucide React
- **PDF**: jsPDF
- **Paleta**: Ámbar/naranja sobre zinc (evitando azul/índigo)

## 📝 Configuración

### Cambiar el PIN del admin
Editá el archivo `.env` y agregá:
```
ADMIN_PIN=tu_nuevo_pin
```

### Cambiar datos del taller
- **Teléfono/WhatsApp**: buscá `2235941522` en `src/components/site/Header.tsx`, `Footer.tsx`, `Hero.tsx`, `Contacto.tsx`
- **Dirección**: buscá `Falucho 4657` en los mismos archivos
- **Horarios**: buscá `9:00 – 18:00` en `Contacto.tsx`, `Footer.tsx`, `SobreNosotros.tsx`

### Logo
Los archivos del logo están en `public/`:
- `logo-autosync-light.png` - para fondos claros (header, footer)
- `logo-autosync-dark.png` - transparente, para fondos oscuros (hero)
- `favicon-autosync.png` - favicon del navegador

## 🚀 Publicar en internet (deploy)

La forma más fácil y gratis es con Vercel:
1. Crear cuenta en vercel.com
2. Conectar el repositorio de GitHub (subir el proyecto)
3. Vercel detecta Next.js automáticamente
4. Configurar variable de entorno `ADMIN_PIN` en Vercel
5. ¡Listo! Queda online con dirección tipo `autosync.vercel.app`

Para dominio propio (ej: `autosync.com.ar`):
1. Comprar dominio (~$2000-3000 ARS/año)
2. Configurar DNS en Vercel
3. Listo

## 📞 Soporte

Este proyecto fue desarrollado para AutoSync - Centro Integral Automotriz.
Mar del Plata, Buenos Aires, Argentina.

---

© 2026 AutoSync. Todos los derechos reservados.

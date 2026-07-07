import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const serviciosIniciales = [
  {
    nombre: 'Cambio de Aceite y Filtros',
    descripcion: 'Renovación completa de aceite del motor con filtros de aceite, aire y combustible. Incluye revisión de niveles y diagnóstico visual.',
    categoria: 'Mantenimiento',
    icono: 'oil',
    destacado: true,
  },
  {
    nombre: 'Sistema de Frenos',
    descripcion: 'Revisión, reparación y reemplazo de pastillas, discos, campanas y líquido de frenos. Diagnóstico de ABS.',
    categoria: 'Seguridad',
    icono: 'brake',
    destacado: true,
  },
  {
    nombre: 'Diagnóstico Computarizado',
    descripcion: 'Escaneo completo de la centralita electrónica (ECU) con equipo profesional. Detección de códigos de falla y problemas ocultos.',
    categoria: 'Diagnóstico',
    icono: 'scan',
    destacado: true,
  },
  {
    nombre: 'Suspensión y Amortiguadores',
    descripcion: 'Revisión y reemplazo de amortiguadores, espirales, rótulas y terminales. Recuperá el confort y la seguridad de manejo.',
    categoria: 'Suspensión',
    icono: 'suspension',
    destacado: false,
  },
  {
    nombre: 'Sistema Eléctrico y Baterías',
    descripcion: 'Cambio de baterías, revisión de alternador, arranque, cableado y luces. Solución a fallas eléctricas en general.',
    categoria: 'Eléctrico',
    icono: 'battery',
    destacado: false,
  },
  {
    nombre: 'Sistema de Embrague',
    descripcion: 'Reemplazo de kit de embrague (disco, plato y rulemán) y purgado de sistema hidráulico en cajas manuales.',
    categoria: 'Transmisión',
    icono: 'clutch',
    destacado: false,
  },
  {
    nombre: 'Aire Acondicionado',
    descripcion: 'Carga de gas, revisión de compresor, limpieza de conductos y desinfección. Recuperá el confort en verano.',
    categoria: 'Confort',
    icono: 'ac',
    destacado: false,
  },
  {
    nombre: 'Service Programado',
    descripcion: 'Mantenimiento integral según kilometraje del fabricante. Incluye revisión de 50 puntos, fluidos, filtros y ajustes generales.',
    categoria: 'Mantenimiento',
    icono: 'service',
    destacado: true,
  },
  {
    nombre: 'Escaneo y Diagnosis de Fallas',
    descripcion: 'Diagnóstico profundo de problemas del motor con equipos de última generación. Informe detallado y presupuesto sin cargo.',
    categoria: 'Diagnóstico',
    icono: 'scan',
    destacado: false,
  },
  {
    nombre: 'Tren Delantero y Dirección',
    descripcion: 'Revisión y reemplazo de rótulas, terminales, cremallera y brazos de dirección. Eliminá ruidos y vibraciones.',
    categoria: 'Suspensión',
    icono: 'suspension',
    destacado: false,
  },
  {
    nombre: 'Sistema de Encendido',
    descripcion: 'Cambio de bujías, cables y bobinas. Mejorá el rendimiento, reducí el consumo y eliminás fallas en el arranque.',
    categoria: 'Motor',
    icono: 'spark',
    destacado: false,
  },
]

async function main() {
  console.log('Iniciando seed de servicios...')
  for (const servicio of serviciosIniciales) {
    await prisma.servicio.create({ data: servicio }).catch(() => {
      // ya existe
    })
  }
  const total = await prisma.servicio.count()
  console.log(`Servicios cargados: ${total}`)
}

main()
  .catch((e) => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

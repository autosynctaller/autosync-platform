import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const marcasConCorrea: Record<string, boolean> = {
  Toyota: false, Ford: false, Volkswagen: false, Chevrolet: false,
  Renault: true, Peugeot: true, Honda: false, Fiat: true, Nissan: false,
  'Citroën': true, Hyundai: false, Kia: false, BMW: false, Audi: false,
  'Mercedes-Benz': false, Jeep: false, Mitsubishi: true, Suzuki: false,
  Mazda: false, Chery: true, Geely: false,
}

function genKmAlto(tieneCorrea: boolean, marca: string) {
  const correaItem = tieneCorrea
    ? `Cambio de CORREA DE DISTRIBUCIÓN (tercer ciclo)\nCambio de bomba de agua`
    : `Revisión de CADENA de distribución (no requiere cambio normal)`

  return [
    { kilometraje: 120000, items: `Cambio de aceite motor\nFiltro de aceite\nFiltro de aire\nFiltro de combustible\nRevisión de frenos completos\nCambio de líquido de frenos (DOT 4) si corresponde\nCambio de filtro de habitáculo\nRevisión de suspensión completa\nRevisión de amortiguadores\nDiagnóstico computarizado\nLimpieza de inyectores\nRevisión de sistema eléctrico`, notas: 'Service de los 120.000 km: revisión integral.' },
    { kilometraje: 150000, items: `Todos los items del service de 120.000 km\nCambio de bujías (iridio)\n${correaItem}\nCambio de tensor de correa\nRevisión de embrague (manuales)\nCambio de aceite de caja automática (si aplica)\nRevisión de catalizador\nLimpieza de cuerpo de mariposa`, notas: tieneCorrea ? `Service CRÍTICO de 150.000 km: ${marca} con CORREA de distribución requiere cambio por tercera vez.` : `Service de 150.000 km: ${marca} usa CADENA, revisar estado.` },
    { kilometraje: 200000, items: `Todos los items del service de 150.000 km\nCambio de líquido refrigerante\nCambio de líquido de frenos (DOT 4)\nCambio de filtros completos\nRevisión completa de motor\nRevisión de turbo (si aplica)\nLimpieza de radiador\nRevisión de alternador y arranque`, notas: 'Service crítico de 200.000 km: revisión profunda del motor.' },
    { kilometraje: 250000, items: `Todos los items del service de 200.000 km\n${correaItem} (cuarto ciclo)\nCambio de bujías (iridio)\nCambio de aceite de caja automática\nRevisión de diferenciales (4x4)\nDiagnóstico completo computarizado`, notas: tieneCorrea ? `Service de 250.000 km: ${marca} con CORREA, cuarto cambio.` : `Service de 250.000 km: ${marca} con CADENA, alta kilometría.` },
    { kilometraje: 300000, items: `Todos los items del service de 250.000 km\nCambio de líquido refrigerante\nRevisión de pistones y válvulas\nRevisión de compresión de motor\nRevisión de catalizador y escape completo\nCambio de mangueras y gomas antiguas`, notas: 'Service de los 300.000 km: revisión mecánica profunda.' },
    { kilometraje: 400000, items: `Todos los items del service de 300.000 km\n${correaItem} (quinto ciclo)\nCambio de bujías (iridio)\nCambio completo de líquidos\nRevisión de sistema eléctrico completo\nDiagnóstico completo computarizado`, notas: 'Service de los 400.000 km: alta kilometría.' },
    { kilometraje: 500000, items: `Todos los items del service de 400.000 km\nRevisión completa de motor\nRevisión de caja de cambios completa\n${correaItem} (sexto ciclo)\nCambio de todos los filtros\nCambio de todos los líquidos\nRevisión estructural del vehículo\nDiagnóstico completo computarizado`, notas: 'Service MILESTONE de 500.000 km: revisión integral. Felicitaciones por la durabilidad!' },
  ]
}

async function main() {
  console.log('Migrando cronogramas de km altos (hasta 500k)...')
  let total = 0
  const marcasExistentes = await prisma.cronogramaService.findMany({ where: { modelo: 'Genérico', activo: true }, select: { marca: true }, distinct: ['marca'] })

  for (const { marca } of marcasExistentes) {
    const tieneCorrea = marcasConCorrea[marca] ?? false
    const kmAltos = genKmAlto(tieneCorrea, marca)
    for (const km of kmAltos) {
      try {
        await prisma.cronogramaService.create({ data: { marca, modelo: 'Genérico', kilometraje: km.kilometraje, items: km.items, notas: km.notas || null } })
        total++
      } catch (e) { /* ya existe */ }
    }
  }

  const count = await prisma.cronogramaService.count()
  console.log(`Migrados: ${total}`)
  console.log(`Total en base: ${count}`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())

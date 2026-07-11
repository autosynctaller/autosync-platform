import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Patrones de services para km altos (más allá de 100.000 km)
// Los services típicamente se repiten cada 100k o cada 50k dependiendo de la marca
// Aquí definimos los patrones para cada milestone

interface KmAlto {
  kilometraje: number
  items: string
  notas?: string
}

// Función para generar los items de services altos según si tiene correa o cadena
function genKmAlto(tieneCorrea: boolean, marca: string): KmAlto[] {
  const correaItem = tieneCorrea
    ? `Cambio de CORREA DE DISTRIBUCIÓN (tercer ciclo)
Cambio de bomba de agua`
    : `Revisión de CADENA de distribución (no requiere cambio normal)`

  return [
    {
      kilometraje: 120000,
      items: `Cambio de aceite motor
Filtro de aceite
Filtro de aire
Filtro de combustible
Revisión de frenos completos
Cambio de líquido de frenos (DOT 4) si corresponde
Cambio de filtro de habitáculo
Revisión de suspensión completa
Revisión de amortiguadores
Diagnóstico computarizado
Limpieza de inyectores
Revisión de sistema eléctrico`,
      notas: 'Service de los 120.000 km: revisión integral.',
    },
    {
      kilometraje: 150000,
      items: `Todos los items del service de 120.000 km
Cambio de bujías (iridio)
${correaItem}
Cambio de tensor de correa
Revisión de embrague (manuales)
Cambio de aceite de caja automática (si aplica)
Revisión de catalizador
Limpieza de cuerpo de mariposa`,
      notas: tieneCorrea
        ? `Service CRÍTICO de 150.000 km: ${marca} con CORREA de distribución requiere cambio por tercera vez.`
        : `Service de 150.000 km: ${marca} usa CADENA, revisar estado. Cambio de bujías iridio.`,
    },
    {
      kilometraje: 200000,
      items: `Todos los items del service de 150.000 km
Cambio de líquido refrigerante
Cambio de líquido de frenos (DOT 4)
Cambio de filtros completos
Revisión completa de motor
Revisión de turbo (si aplica)
Limpieza de radiador
Revisión de alternador y arranque
Revisión de cableado principal`,
      notas: 'Service crítico de 200.000 km: revisión profunda del motor.',
    },
    {
      kilometraje: 250000,
      items: `Todos los items del service de 200.000 km
${correaItem} (cuarto ciclo)
Cambio de bujías (iridio)
Cambio de aceite de caja automática
Revisión de diferenciales (4x4)
Revisión de cardán (camionetas)
Diagnóstico completo computarizado`,
      notas: tieneCorrea
        ? `Service de 250.000 km: ${marca} con CORREA, cuarto cambio.`
        : `Service de 250.000 km: ${marca} con CADENA, alta kilometría.`,
    },
    {
      kilometraje: 300000,
      items: `Todos los items del service de 250.000 km
Cambio de líquido refrigerante
Revisión de pistones y válvulas
Revisión de compresión de motor
Revisión de catalizador y escape completo
Cambio de mangueras y gomas antiguas
Revisión de burletes y gomas de puertas`,
      notas: 'Service de los 300.000 km: revisión mecánica profunda. Considerar estado general.',
    },
    {
      kilometraje: 400000,
      items: `Todos los items del service de 300.000 km
${correaItem} (quinto ciclo)
Cambio de bujías (iridio)
Cambio completo de líquidos (frenos, refrigerante, dirección)
Revisión de sistema eléctrico completo
Revisión de instrumental
Diagnóstico completo computarizado`,
      notas: 'Service de los 400.000 km: alta kilometría. Revisión completa del vehículo.',
    },
    {
      kilometraje: 500000,
      items: `Todos los items del service de 400.000 km
Revisión completa de motor (compresión, válvulas, pistones)
Revisión de caja de cambios completa
${correaItem} (sexto ciclo)
Cambio de todos los filtros
Cambio de todos los líquidos
Revisión estructural del vehículo
Evaluación de seguridad completa
Diagnóstico completo computarizado
Revisión de turbo (si aplica)`,
      notas: 'Service MILESTONE de 500.000 km: revisión integral del vehículo. Felicitaciones por la durabilidad!',
    },
  ]
}

// Definir qué marcas usan correa y cuáles cadena
const marcasConCorrea: Record<string, boolean> = {
  Toyota: false, // cadena
  Ford: false, // cadena en motores modernos
  Volkswagen: false, // cadena en TSI
  Chevrolet: false, // cadena en motores modernos
  Renault: true, // CORREA (K4M, K7M, etc.)
  Peugeot: true, // CORREA (EP6, TU5)
  Honda: false, // cadena
  Fiat: true, // CORREA (FIRE, E.torQ)
  Nissan: false, // cadena
  'Citroën': true, // CORREA (mismos motores PSA)
  Hyundai: false, // cadena
  Kia: false, // cadena
  BMW: false, // cadena
  Audi: false, // cadena en TFSI
  'Mercedes-Benz': false, // cadena
  Jeep: false, // cadena
  Mitsubishi: true, // CORREA en L200 4D56, cadena en nuevos
  Suzuki: false, // cadena
  Mazda: false, // cadena SkyActiv
  Chery: true, // CORREA en ACTECO
  Geely: false, // cadena en modernos
}

async function main() {
  console.log('Extending cronogramas to 500.000 km...')

  // Para cada marca existente, agregar los km altos al modelo "Genérico"
  const marcasExistentes = await prisma.cronogramaService.findMany({
    where: { modelo: 'Genérico', activo: true },
    select: { marca: true },
    distinct: ['marca'],
  })

  let cargados = 0
  for (const { marca } of marcasExistentes) {
    const tieneCorrea = marcasConCorrea[marca] ?? false
    const kmAltos = genKmAlto(tieneCorrea, marca)

    for (const km of kmAltos) {
      try {
        await prisma.cronogramaService.create({
          data: {
            marca,
            modelo: 'Genérico',
            kilometraje: km.kilometraje,
            items: km.items,
            notas: km.notas || null,
          },
        })
        cargados++
      } catch (e) {
        // ya existe
      }
    }
    console.log(`✓ ${marca}: ${kmAltos.length} services altos agregados (correa: ${tieneCorrea})`)
  }

  const total = await prisma.cronogramaService.count()
  console.log(`\nCronogramas cargados en esta tanda: ${cargados}`)
  console.log(`Total en base: ${total}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

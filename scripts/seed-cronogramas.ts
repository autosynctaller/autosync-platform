import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Cronogramas genéricos (aplican a cualquier modelo de la marca)
// Están basados en los services típicos cada 10.000 km del mercado argentino
const cronogramas: Array<{
  marca: string
  modelo: string
  kilometraje: number
  items: string
  notas?: string
}> = [
  // ============ TOYOTA ============
  {
    marca: 'Toyota',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 sintético)
Filtro de aceite
Filtro de aire
Filtro de combustible (c/20.000 km)
Revisión de niveles (líquido frenos, refrigerante, dirección)
Revisión de frenos (pastillas y discos)
Revisión de suspensión
Revisión de neumáticos y presión
Inspección visual de gomas y mangueras
Reset de luz de mantenimiento`,
    notas: 'Toyota recomienda aceite sintético 5W30. Filtro de combustible cada 20.000 km.',
  },
  {
    marca: 'Toyota',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías (cambio c/30.000 km)
Revisión de correas
Limpieza de inyectores
Revisión de batería y sistema eléctrico
Revisión de escape`,
  },
  {
    marca: 'Toyota',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de bujías
Cambio de líquido de frenos
Cambio de filtro de aire acondicionado
Revisión de amortiguadores
Revisión de cremallera de dirección
Limpieza de mariposa de aceleración`,
    notas: 'Service importante: revisar correa de distribución si aplica.',
  },
  {
    marca: 'Toyota',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (si aplica)
Cambio de aceite de diferencial (4x4)
Revisión de embrague (manuales)
Cambio de filtros completos
Revisión de catalizador`,
  },
  {
    marca: 'Toyota',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de correa de distribución (motores que la tengan)
Cambio de bomba de agua
Cambio de tensores
Revisión completa de motor
Cambio de líquido refrigerante
Limpieza de radiador`,
    notas: 'Service de los 100.000 km: CRÍTICO. Cambiar correa de distribución en motores que la tengan.',
  },

  // ============ FORD ============
  {
    marca: 'Ford',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W20 o 5W30)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería
Reset de luz de service`,
    notas: 'Ford recomienda aceite 5W20 en motores EcoBoost. 5W30 en el resto.',
  },
  {
    marca: 'Ford',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías
Revisión de correas
Limpieza de cuerpo de mariposa
Revisión de sistema de escape`,
  },
  {
    marca: 'Ford',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de bujías
Cambio de líquido de frenos
Cambio de filtro de aire A/C
Revisión de amortiguadores
Revisión de dirección`,
  },
  {
    marca: 'Ford',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja (automática)
Revisión de embrague
Cambio de filtros completos`,
  },
  {
    marca: 'Ford',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de correa de distribución (si aplica)
Cambio de bomba de agua
Cambio de líquido refrigerante
Revisión completa de motor`,
    notas: 'Service crítico de 100.000 km.',
  },

  // ============ VOLKSWAGEN ============
  {
    marca: 'Volkswagen',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 sintético VW 502.00)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'VW exige aceite con norma VW 502.00 (nafteros) o VW 505.00 (diesel).',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías
Revisión de correas
Revisión de embrague
Limpieza de inyectores`,
  },
  {
    marca: 'Volkswagen',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de bujías
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa`,
  },
  {
    marca: 'Volkswagen',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja DSG (si aplica)
Revisión de embrague (DSG)
Cambio de filtros completos`,
    notas: 'En cajas DSG usar aceite específico. Cambiar cada 60.000 km.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de correa de distribución (1.6/1.8 TSI)
Cambio de bomba de agua
Cambio de líquido refrigerante (G12/G13)
Revisión completa de motor`,
    notas: 'Service crítico: correa de distribución obligatoria en 1.6 y 1.8 TSI.',
  },

  // ============ CHEVROLET ============
  {
    marca: 'Chevrolet',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'Chevrolet recomienda aceite Dexos 1 (nafteros) o Dexos 2 (diesel).',
  },
  {
    marca: 'Chevrolet',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías
Revisión de correas
Limpieza de cuerpo de mariposa`,
  },
  {
    marca: 'Chevrolet',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de bujías
Cambio de líquido de frenos
Cambio de filtro de habitáculo
Revisión de amortiguadores`,
  },
  {
    marca: 'Chevrolet',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática
Revisión de embrague
Cambio de filtros completos`,
  },
  {
    marca: 'Chevrolet',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de correa de distribución (si aplica)
Cambio de bomba de agua
Cambio de líquido refrigerante (Dex-Cool)
Revisión completa de motor`,
    notas: 'Service crítico de 100.000 km. Usar refrigerante Dex-Cool (naranja).',
  },

  // ============ RENAULT ============
  {
    marca: 'Renault',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 ELF)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'Renault recomienda aceite ELF 5W40 (norma RN0710 o RN0700).',
  },
  {
    marca: 'Renault',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías
Revisión de correas
Limpieza de inyectores`,
  },
  {
    marca: 'Renault',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de bujías
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa`,
  },
  {
    marca: 'Renault',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de correa de distribución (motores K4M y otros)
Cambio de bomba de agua
Revisión de embrague`,
    notas: 'En Renault la correa de distribución va cada 60.000 km o 5 años (lo que ocurra primero).',
  },
  {
    marca: 'Renault',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de correa de distribución (NUEVAMENTE)
Cambio de bomba de agua
Cambio de líquido refrigerante
Cambio de filtros completos
Revisión completa de motor`,
    notas: 'Service crítico: correa de distribución ya cambió a los 60.000, ahora va otra vez.',
  },

  // ============ PEUGEOT ============
  {
    marca: 'Peugeot',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 TOTAL)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'Peugeot recomienda aceite TOTAL 5W40 con norma PSA B71 2296.',
  },
  {
    marca: 'Peugeot',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías
Revisión de correas
Limpieza de cuerpo de mariposa`,
  },
  {
    marca: 'Peugeot',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de bujías
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores`,
  },
  {
    marca: 'Peugeot',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de correa de distribución (motores EP6 y TU5)
Cambio de bomba de agua
Revisión de embrague`,
    notas: 'Motores EP6 (1.6 THP) requieren especial atención: correa c/60.000 km o 5 años.',
  },
  {
    marca: 'Peugeot',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de correa de distribución (NUEVAMENTE)
Cambio de bomba de agua
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ HONDA ============
  {
    marca: 'Honda',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (0W20 o 5W30)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'Honda recomienda 0W20 en motores modernos (1.5T, 2.0 NA). 5W30 en modelos anteriores.',
  },
  {
    marca: 'Honda',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías (cambio c/40.000 km)
Revisión de correas
Limpieza de inyectores`,
  },
  {
    marca: 'Honda',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de bujías (iridio)
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa`,
  },
  {
    marca: 'Honda',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja CVT (si aplica)
Revisión de embrague
Cambio de filtros completos`,
    notas: 'En cajas CVT cambiar aceite cada 60.000 km con aceite Honda CVT Fluid.',
  },
  {
    marca: 'Honda',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de líquido refrigerante
Revisión de correa de accesorios
Revisión completa de motor`,
    notas: 'Honda usa cadena de distribución (no requiere cambio), pero sí correa de accesorios.',
  },

  // ============ FIAT ============
  {
    marca: 'Fiat',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 Selenia)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'Fiat recomienda aceite Selenia 5W40. En motores Fire puede usar 10W40.',
  },
  {
    marca: 'Fiat',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías
Revisión de correas
Limpieza de cuerpo de mariposa`,
  },
  {
    marca: 'Fiat',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de bujías
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores`,
  },
  {
    marca: 'Fiat',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de correa de distribución (motores FIRE y E.torQ)
Cambio de bomba de agua
Revisión de embrague`,
    notas: 'Fiat FIRE/E.torQ: correa de distribución cada 60.000 km o 5 años.',
  },
  {
    marca: 'Fiat',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de correa de distribución (NUEVAMENTE)
Cambio de bomba de agua
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ NISSAN ============
  {
    marca: 'Nissan',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (0W20 o 5W30)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'Nissan recomienda 0W20 en motores modernos. Usar aceite Nissan o equivalente API SN.',
  },
  {
    marca: 'Nissan',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías (iridio c/100.000 km)
Revisión de correas
Limpieza de inyectores`,
  },
  {
    marca: 'Nissan',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa`,
  },
  {
    marca: 'Nissan',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja CVT (NS-2 o NS-3)
Revisión de embrague
Cambio de filtros completos`,
    notas: 'CAJAS CVT: cambio de aceite OBLIGATORIO cada 60.000 km con fluido Nissan NS-2 o NS-3.',
  },
  {
    marca: 'Nissan',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías (iridio)
Cambio de líquido refrigerante
Revisión completa de motor`,
    notas: 'Nissan usa cadena de distribución (no requiere cambio).',
  },

  // ============ CITROEN ============
  {
    marca: 'Citroën',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 TOTAL)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'Citroën usa mismas normas PSA que Peugeot. Aceite TOTAL 5W40 con norma PSA B71 2296.',
  },
  {
    marca: 'Citroën',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías
Revisión de correas
Limpieza de cuerpo de mariposa`,
  },
  {
    marca: 'Citroën',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de bujías
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores`,
  },
  {
    marca: 'Citroën',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de correa de distribución (motores EP6 y TU5)
Cambio de bomba de agua
Revisión de embrague`,
    notas: 'Motores PureTech (EB2): correa de distribución húmeda, c/60.000 km o 5 años.',
  },
  {
    marca: 'Citroën',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de correa de distribución (NUEVAMENTE)
Cambio de bomba de agua
Cambio de líquido refrigerante
Revisión completa de motor`,
  },
]

async function main() {
  console.log('Cargando cronogramas de services...')
  let cargados = 0
  for (const c of cronogramas) {
    try {
      await prisma.cronogramaService.create({ data: c })
      cargados++
    } catch (e) {
      // ya existe o error, continuar
    }
  }
  const total = await prisma.cronogramaService.count()
  console.log(`Cronogramas cargados: ${cargados}`)
  console.log(`Total en base: ${total}`)

  const marcas = await prisma.cronogramaService.findMany({
    where: { activo: true },
    select: { marca: true },
    distinct: ['marca'],
  })
  console.log(`Marcas disponibles: ${marcas.map((m) => m.marca).join(', ')}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

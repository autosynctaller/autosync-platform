import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Modelos específicos faltantes
// Para cada modelo: services a 10k, 40k, 60k, 100k, 150k, 200k, 300k, 500k
// (los intermedios usan el Genérico de la marca)

interface CronogramaModelo {
  marca: string
  modelo: string
  kilometraje: number
  items: string
  notas?: string
}

const cronogramas: CronogramaModelo[] = [
  // ============ TOYOTA SW4 (Diesel) ============
  {
    marca: 'Toyota',
    modelo: 'SW4',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 diesel, 7.5L 1GD-FTV)
Filtro de aceite
Filtro de aire
Filtro de combustible (separador de agua)
Drenaje de agua del filtro de gasoil
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de sistema 4x4`,
    notas: 'SW4 1GD-FTV 2.8L: mismo motor que Hilux. Capacidad aceite: 7.5L. 4x4: revisar diferenciales.',
  },
  {
    marca: 'Toyota',
    modelo: 'SW4',
    kilometraje: 40000,
    items: `Todos los items del service de 10.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de aceite de diferencial delantero (4x4)
Cambio de aceite de diferencial trasero
Cambio de aceite de caja transferencia (4x4)
Cambio de filtro de habitáculo`,
    notas: 'SW4 4x4: cambio de aceites de diferencial y transfer c/40.000 km.',
  },
  {
    marca: 'Toyota',
    modelo: 'SW4',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de líquido refrigerante (SLLC)
Cambio de aceite de diferenciales y transfer
Revisión completa de motor diesel
Revisión de inyectores
Revisión de turbo`,
    notas: 'SW4 usa CADENA de distribución. Coolant Toyota Super Long Life (SLLC).',
  },

  // ============ TOYOTA YARIS ============
  {
    marca: 'Toyota',
    modelo: 'Yaris',
    kilometraje: 10000,
    items: `Cambio de aceite motor (0W20, 4.2L 1NZ-FE)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Yaris 1NZ-FE 1.5L: aceite 0W20 Toyota. Capacidad: 4.2L.',
  },
  {
    marca: 'Toyota',
    modelo: 'Yaris',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (si aplica)
Cambio de filtros completos
Cambio de bujías (iridio c/100.000 km)`,
    notas: 'Yaris usa CADENA de distribución. Caja auto: aceite c/60.000 km.',
  },
  {
    marca: 'Toyota',
    modelo: 'Yaris',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante (SLLC)
Revisión completa de motor`,
  },

  // ============ TOYOTA RAV4 ============
  {
    marca: 'Toyota',
    modelo: 'RAV4',
    kilometraje: 10000,
    items: `Cambio de aceite motor (0W16 o 0W20, 4.5L)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería
Revisión de sistema híbrido (si aplica)`,
    notas: 'RAV4 Hybrid: aceite 0W16. Capacidad: 4.5L. Revisar batería híbrida.',
  },
  {
    marca: 'Toyota',
    modelo: 'RAV4',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Cambio de aceite de diferencial trasero (AWD)
Revisión de amortiguadores`,
    notas: 'RAV4 AWD: cambio de aceite de diferencial trasero c/40.000 km.',
  },
  {
    marca: 'Toyota',
    modelo: 'RAV4',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante (SLLC)
Revisión completa de motor
Revisión de batería híbrida (si aplica)`,
    notas: 'RAV4 usa CADENA de distribución. Hybrid: revisar batería de alto voltaje.',
  },

  // ============ FORD FIESTA ============
  {
    marca: 'Ford',
    modelo: 'Fiesta',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30, 3.5L Sigma)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Fiesta 1.6 Sigma: aceite 5W30. Capacidad: 3.5L.',
  },
  {
    marca: 'Ford',
    modelo: 'Fiesta',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías
Cambio de aceite de caja automática (PowerShift)
Revisión de embrague PowerShift
Cambio de filtros completos`,
    notas: 'Fiesta PowerShift: revisar embrague (caja seca). 1.6 Sigma usa CADENA de distribución.',
  },
  {
    marca: 'Ford',
    modelo: 'Fiesta',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías
Cambio de líquido refrigerante (Motorcraft Gold)
Revisión completa de motor`,
  },

  // ============ FORD FOCUS ============
  {
    marca: 'Ford',
    modelo: 'Focus',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30, 4.0L Sigma)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Focus 1.6 Sigma: aceite 5W30. Capacidad: 4.0L.',
  },
  {
    marca: 'Ford',
    modelo: 'Focus',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías
Cambio de aceite de caja automática (PowerShift)
Revisión de embrague
Cambio de filtros completos`,
    notas: 'Focus PowerShift: revisar embrague. 1.6 Sigma usa CADENA de distribución.',
  },
  {
    marca: 'Ford',
    modelo: 'Focus',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ FORD TERRITORY ============
  {
    marca: 'Ford',
    modelo: 'Territory',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30, 4.0L 2.0L EcoBoost)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería
Diagnóstico computarizado`,
    notas: 'Territory 1.5L EcoBoost: aceite 5W30. Capacidad: 4.0L. Turbo: revisar sistema.',
  },
  {
    marca: 'Ford',
    modelo: 'Territory',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (7 velocidades)
Cambio de bujías (iridio)
Cambio de filtros completos
Revisión de turbo`,
    notas: 'Territory caja 7 velocidades: cambio de aceite c/60.000 km.',
  },
  {
    marca: 'Ford',
    modelo: 'Territory',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Revisión completa de motor
Revisión de turbo`,
  },

  // ============ VW SURAN ============
  {
    marca: 'Volkswagen',
    modelo: 'Suran',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 VW 502.00, 3.6L EA111)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Suran 1.6 EA111: aceite 5W40 VW 502.00. Capacidad: 3.6L. USA CORREA de distribución c/90.000 km.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Suran',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías
Cambio de aceite de caja manual
Revisión de embrague`,
  },
  {
    marca: 'Volkswagen',
    modelo: 'Suran',
    kilometraje: 90000,
    items: `Todos los items del service de 60.000 km
CAMBIO DE CORREA DE DISTRIBUCIÓN (EA111)
Cambio de bomba de agua
Cambio de tensor
Cambio de filtros completos`,
    notas: 'Suran EA111 1.6L: CORREA DE DISTRIBUCIÓN c/90.000 km. CRÍTICO.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Suran',
    kilometraje: 100000,
    items: `Todos los items del service de 90.000 km
Cambio de bujías
Cambio de líquido refrigerante (G12++/G13)
Revisión completa de motor`,
  },

  // ============ VW VENTO ============
  {
    marca: 'Volkswagen',
    modelo: 'Vento',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 VW 502.00, 5.5L EA888)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería
Diagnóstico computarizado VCDS`,
    notas: 'Vento 2.0 TSI EA888: aceite 5W40 VW 502.00. Capacidad: 5.5L. CADENA de distribución.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Vento',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de inyectores
Revisión de turbo`,
  },
  {
    marca: 'Volkswagen',
    modelo: 'Vento',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías (TSI)
Cambio de aceite de caja DSG (si aplica)
Revisión de embrague DSG
Cambio de filtros completos`,
    notas: 'Vento TSI: bujías c/60.000 km. Caja DSG: aceite c/60.000 km.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Vento',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías
Cambio de líquido refrigerante (G12++/G13)
Revisión completa de motor
Revisión de turbo`,
    notas: 'Vento EA888 usa CADENA de distribución (no requiere cambio).',
  },

  // ============ VW T-CROSS ============
  {
    marca: 'Volkswagen',
    modelo: 'T-Cross',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 VW 502.00, 3.6L EA211)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'T-Cross 1.6 EA211: aceite 5W40 VW 502.00. Capacidad: 3.6L. CADENA de distribución.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'T-Cross',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías
Cambio de aceite de caja automática (Aisin)
Revisión de embrague
Cambio de filtros completos`,
    notas: 'T-Cross caja Aisin 6 velocidades: cambio de aceite c/60.000 km.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'T-Cross',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías
Cambio de líquido refrigerante (G12++/G13)
Revisión completa de motor`,
  },

  // ============ VW TAOS ============
  {
    marca: 'Volkswagen',
    modelo: 'Taos',
    kilometraje: 10000,
    items: `Cambio de aceite motor (0W20 VW 508.00, 5.0L EA888)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería
Diagnóstico computarizado VCDS`,
    notas: 'Taos 2.0 TSI EA888 Gen3: aceite 0W20 VW 508.00. Capacidad: 5.0L. CADENA de distribución.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Taos',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de inyectores
Revisión de turbo`,
  },
  {
    marca: 'Volkswagen',
    modelo: 'Taos',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías (TSI)
Cambio de aceite de caja DSG
Revisión de embrague DSG
Cambio de filtros completos`,
    notas: 'Taos caja DSG: cambio de aceite c/60.000 km con aceite específico VAG.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Taos',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías
Cambio de líquido refrigerante (G12++/G13)
Revisión completa de motor
Revisión de turbo`,
  },

  // ============ VW NIVUS ============
  {
    marca: 'Volkswagen',
    modelo: 'Nivus',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 VW 502.00, 3.6L EA211)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Nivus 1.6 EA211: aceite 5W40 VW 502.00. Capacidad: 3.6L. CADENA de distribución.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Nivus',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías
Cambio de aceite de caja automática (Aisin)
Cambio de filtros completos`,
  },
  {
    marca: 'Volkswagen',
    modelo: 'Nivus',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías
Cambio de líquido refrigerante (G12++/G13)
Revisión completa de motor`,
  },

  // ============ RENAULT LOGAN ============
  {
    marca: 'Renault',
    modelo: 'Logan',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 ELF, 4.8L K4M)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Logan K4M 1.6L: aceite ELF 5W40 con norma RN0710. Capacidad: 4.8L.',
  },
  {
    marca: 'Renault',
    modelo: 'Logan',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de CORREA DE DISTRIBUCIÓN (K4M)
Cambio de bomba de agua
Cambio de tensor de correa
Cambio de bujías
Revisión de embrague`,
    notas: 'Logan K4M: CORREA DE DISTRIBUCIÓN c/60.000 km o 5 años. CRÍTICO.',
  },
  {
    marca: 'Renault',
    modelo: 'Logan',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de CORREA DE DISTRIBUCIÓN (NUEVAMENTE)
Cambio de bomba de agua
Cambio de líquido refrigerante (GLACEOL)
Revisión completa de motor`,
  },

  // ============ RENAULT KANGOO ============
  {
    marca: 'Renault',
    modelo: 'Kangoo',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 ELF, 4.8L K4M)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería
Revisión de suspensión trasera (carga)`,
    notas: 'Kangoo K4M 1.6L: aceite ELF 5W40. Capacidad: 4.8L. Revisar suspensión trasera por carga.',
  },
  {
    marca: 'Renault',
    modelo: 'Kangoo',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de CORREA DE DISTRIBUCIÓN (K4M)
Cambio de bomba de agua
Cambio de bujías
Revisión de suspensión trasera`,
    notas: 'Kangoo K4M: CORREA DE DISTRIBUCIÓN c/60.000 km. CRÍTICO.',
  },
  {
    marca: 'Renault',
    modelo: 'Kangoo',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de CORREA DE DISTRIBUCIÓN (NUEVAMENTE)
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ RENAULT TRAFIC (Diesel) ============
  {
    marca: 'Renault',
    modelo: 'Trafic',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 diesel, 7.4L R9M)
Filtro de aceite
Filtro de aire
Filtro de combustible (separador de agua)
Drenaje de agua del filtro de gasoil
Revisión de niveles
Revisión de frenos
Revisión de suspensión trasera (carga)`,
    notas: 'Trafic 1.6 dCi R9M: aceite 5W30 diesel ELF. Capacidad: 7.4L. CADENA de distribución.',
  },
  {
    marca: 'Renault',
    modelo: 'Trafic',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Cambio de aceite de diferencial trasero
Revisión de amortiguadores`,
  },
  {
    marca: 'Renault',
    modelo: 'Trafic',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja manual
Cambio de filtros completos
Revisión de inyectores diesel`,
    notas: 'Trafic R9M usa CADENA de distribución. Inyectores: revisar c/60.000 km.',
  },
  {
    marca: 'Renault',
    modelo: 'Trafic',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de líquido refrigerante
Revisión completa de motor diesel
Revisión de turbo
Revisión de DPF (filtro de partículas)`,
  },

  // ============ FIAT TORO (Diesel/Nafta) ============
  {
    marca: 'Fiat',
    modelo: 'Toro',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 Selenia o 5W30 diesel, 5.0L)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería
Revisión de sistema 4x4 (si aplica)`,
    notas: 'Toro 2.0 Multijet diesel: aceite 5W30 Selenia. Capacidad: 5.0L. CADENA de distribución.',
  },
  {
    marca: 'Fiat',
    modelo: 'Toro',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Cambio de aceite de diferencial trasero (4x4)
Revisión de amortiguadores`,
  },
  {
    marca: 'Fiat',
    modelo: 'Toro',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (9 velocidades)
Revisión de embrague (manuales)
Cambio de filtros completos`,
    notas: 'Toro caja 9 velocidades: cambio de aceite c/60.000 km.',
  },
  {
    marca: 'Fiat',
    modelo: 'Toro',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías (nafta)
Cambio de líquido refrigerante (Paraflu)
Revisión completa de motor
Revisión de turbo (si aplica)`,
  },

  // ============ FIAT STRADA ============
  {
    marca: 'Fiat',
    modelo: 'Strada',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 Selenia, 3.5L E.torQ)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería
Revisión de suspensión trasera (carga)`,
    notas: 'Strada 1.4 E.torQ: aceite Selenia 5W40. Capacidad: 3.5L. CORREA de distribución c/60.000 km.',
  },
  {
    marca: 'Fiat',
    modelo: 'Strada',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de CORREA DE DISTRIBUCIÓN (E.torQ)
Cambio de bomba de agua
Cambio de bujías
Revisión de embrague`,
    notas: 'Strada E.torQ: CORREA DE DISTRIBUCIÓN c/60.000 km o 5 años. CRÍTICO.',
  },
  {
    marca: 'Fiat',
    modelo: 'Strada',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de CORREA DE DISTRIBUCIÓN (NUEVAMENTE)
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ FIAT PULSE ============
  {
    marca: 'Fiat',
    modelo: 'Pulse',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 Selenia, 4.0L GSE)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Pulse 1.3 GSE Firefly: aceite Selenia 5W40. Capacidad: 4.0L. CADENA de distribución.',
  },
  {
    marca: 'Fiat',
    modelo: 'Pulse',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (CVT)
Cambio de bujías
Cambio de filtros completos`,
    notas: 'Pulse CVT: cambio de aceite c/60.000 km. 1.3 GSE usa CADENA.',
  },
  {
    marca: 'Fiat',
    modelo: 'Pulse',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías
Cambio de líquido refrigerante (Paraflu)
Revisión completa de motor`,
  },

  // ============ CHEVROLET PRISMA ============
  {
    marca: 'Chevrolet',
    modelo: 'Prisma',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 Dexos 1, 3.5L)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Prisma 1.4: aceite Dexos 1 5W30. Capacidad: 3.5L.',
  },
  {
    marca: 'Chevrolet',
    modelo: 'Prisma',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías
Cambio de aceite de caja automática (si aplica)
Cambio de filtros completos`,
    notas: 'Prisma 1.4 usa CADENA de distribución (no requiere cambio).',
  },
  {
    marca: 'Chevrolet',
    modelo: 'Prisma',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías
Cambio de líquido refrigerante (Dex-Cool)
Revisión completa de motor`,
  },

  // ============ CHEVROLET S10 (Diesel) ============
  {
    marca: 'Chevrolet',
    modelo: 'S10',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 diesel, 7.5L Duramax)
Filtro de aceite
Filtro de aire
Filtro de combustible (separador de agua)
Drenaje de agua del filtro de gasoil
Revisión de niveles
Revisión de frenos
Revisión de sistema 4x4`,
    notas: 'S10 2.8 Duramax: aceite 5W30 diesel. Capacidad: 7.5L. CADENA de distribución.',
  },
  {
    marca: 'Chevrolet',
    modelo: 'S10',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de aceite de diferencial delantero (4x4)
Cambio de aceite de diferencial trasero
Cambio de aceite de caja transferencia (4x4)
Cambio de filtro de habitáculo`,
    notas: 'S10 4x4: cambio de aceites de diferencial y transfer c/40.000 km.',
  },
  {
    marca: 'Chevrolet',
    modelo: 'S10',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (6L50)
Revisión de sistema DPF (filtro de partículas)
Cambio de filtros completos`,
    notas: 'S10 caja auto 6L50: cambio de aceite c/60.000 km.',
  },
  {
    marca: 'Chevrolet',
    modelo: 'S10',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de líquido refrigerante (Dex-Cool)
Cambio de aceite de diferenciales y transfer
Revisión completa de motor diesel
Revisión de turbo
Revisión de inyectores`,
  },

  // ============ CHEVROLET TRACKER ============
  {
    marca: 'Chevrolet',
    modelo: 'Tracker',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 Dexos 1, 4.0L 1.2T)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Tracker 1.2 Turbo: aceite Dexos 1 5W30. Capacidad: 4.0L. CADENA de distribución.',
  },
  {
    marca: 'Chevrolet',
    modelo: 'Tracker',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (CVT)
Cambio de bujías (iridio)
Cambio de filtros completos
Revisión de turbo`,
    notas: 'Tracker CVT: cambio de aceite c/60.000 km.',
  },
  {
    marca: 'Chevrolet',
    modelo: 'Tracker',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante (Dex-Cool)
Revisión completa de motor
Revisión de turbo`,
  },

  // ============ CHEVROLET SPIN ============
  {
    marca: 'Chevrolet',
    modelo: 'Spin',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 Dexos 1, 4.5L)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Spin 1.8: aceite Dexos 1 5W30. Capacidad: 4.5L.',
  },
  {
    marca: 'Chevrolet',
    modelo: 'Spin',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías
Cambio de aceite de caja automática (6 velocidades)
Cambio de filtros completos`,
    notas: 'Spin 1.8 usa CADENA de distribución.',
  },
  {
    marca: 'Chevrolet',
    modelo: 'Spin',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías
Cambio de líquido refrigerante (Dex-Cool)
Revisión completa de motor`,
  },

  // ============ PEUGEOT 208 ============
  {
    marca: 'Peugeot',
    modelo: '208',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 TOTAL, 3.5L PureTech)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: '208 1.2 PureTech: aceite TOTAL 5W30 con norma PSA B71 2290. Capacidad: 3.5L.',
  },
  {
    marca: 'Peugeot',
    modelo: '208',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de CORREA DE DISTRIBUCIÓN (PureTech húmeda)
Cambio de bomba de agua
Cambio de bujías
Revisión de embrague`,
    notas: '208 PureTech: CORREA DE DISTRIBUCIÓN húmeda c/60.000 km o 5 años. CRÍTICO.',
  },
  {
    marca: 'Peugeot',
    modelo: '208',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de CORREA DE DISTRIBUCIÓN (NUEVAMENTE)
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ PEUGEOT 2008 ============
  {
    marca: 'Peugeot',
    modelo: '2008',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 TOTAL, 3.5L PureTech)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: '2008 1.2 PureTech: aceite TOTAL 5W30. Capacidad: 3.5L.',
  },
  {
    marca: 'Peugeot',
    modelo: '2008',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de CORREA DE DISTRIBUCIÓN (PureTech húmeda)
Cambio de bomba de agua
Cambio de bujías`,
    notas: '2008 PureTech: CORREA DE DISTRIBUCIÓN húmeda c/60.000 km. CRÍTICO.',
  },
  {
    marca: 'Peugeot',
    modelo: '2008',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de CORREA DE DISTRIBUCIÓN (NUEVAMENTE)
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ PEUGEOT PARTNER ============
  {
    marca: 'Peugeot',
    modelo: 'Partner',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 TOTAL, 4.5L)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería
Revisión de suspensión trasera (carga)`,
    notas: 'Partner 1.6: aceite TOTAL 5W40 con norma PSA. Capacidad: 4.5L.',
  },
  {
    marca: 'Peugeot',
    modelo: 'Partner',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de CORREA DE DISTRIBUCIÓN (TU5)
Cambio de bomba de agua
Cambio de bujías
Revisión de suspensión trasera`,
    notas: 'Partner TU5: CORREA DE DISTRIBUCIÓN c/60.000 km. CRÍTICO.',
  },
  {
    marca: 'Peugeot',
    modelo: 'Partner',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de CORREA DE DISTRIBUCIÓN (NUEVAMENTE)
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ HONDA CR-V ============
  {
    marca: 'Honda',
    modelo: 'CR-V',
    kilometraje: 10000,
    items: `Cambio de aceite motor (0W20, 4.0L)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería
Revisión de sistema AWD (si aplica)`,
    notas: 'CR-V 2.0: aceite 0W20 Honda. Capacidad: 4.0L. CADENA de distribución.',
  },
  {
    marca: 'Honda',
    modelo: 'CR-V',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Cambio de aceite de diferencial trasero (AWD)
Revisión de amortiguadores`,
    notas: 'CR-V AWD: cambio de aceite de diferencial trasero c/40.000 km.',
  },
  {
    marca: 'Honda',
    modelo: 'CR-V',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja CVT
Cambio de bujías (iridio c/100.000 km)
Cambio de filtros completos`,
    notas: 'CR-V CVT: cambio de aceite c/60.000 km con Honda CVT Fluid.',
  },
  {
    marca: 'Honda',
    modelo: 'CR-V',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ HONDA FIT ============
  {
    marca: 'Honda',
    modelo: 'Fit',
    kilometraje: 10000,
    items: `Cambio de aceite motor (0W20, 3.5L L15A)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Fit 1.5 L15A: aceite 0W20 Honda. Capacidad: 3.5L. CADENA de distribución.',
  },
  {
    marca: 'Honda',
    modelo: 'Fit',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja CVT
Cambio de bujías (iridio c/100.000 km)
Cambio de filtros completos`,
    notas: 'Fit CVT: cambio de aceite c/60.000 km.',
  },
  {
    marca: 'Honda',
    modelo: 'Fit',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ HONDA HR-V ============
  {
    marca: 'Honda',
    modelo: 'HR-V',
    kilometraje: 10000,
    items: `Cambio de aceite motor (0W20, 3.5L L15B)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'HR-V 1.8: aceite 0W20 Honda. Capacidad: 3.5L. CADENA de distribución.',
  },
  {
    marca: 'Honda',
    modelo: 'HR-V',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja CVT
Cambio de bujías (iridio c/100.000 km)
Cambio de filtros completos`,
    notas: 'HR-V CVT: cambio de aceite c/60.000 km.',
  },
  {
    marca: 'Honda',
    modelo: 'HR-V',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ NISSAN VERSA ============
  {
    marca: 'Nissan',
    modelo: 'Versa',
    kilometraje: 10000,
    items: `Cambio de aceite motor (0W20, 3.5L HR16DE)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Versa 1.6 HR16DE: aceite 0W20 Nissan. Capacidad: 3.5L. CADENA de distribución.',
  },
  {
    marca: 'Nissan',
    modelo: 'Versa',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja CVT (NS-3)
Cambio de bujías (iridio c/100.000 km)
Cambio de filtros completos`,
    notas: 'Versa CVT: cambio de aceite c/60.000 km con Nissan NS-3.',
  },
  {
    marca: 'Nissan',
    modelo: 'Versa',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ NISSAN FRONTIER (Diesel) ============
  {
    marca: 'Nissan',
    modelo: 'Frontier',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 diesel, 8.0L YD25)
Filtro de aceite
Filtro de aire
Filtro de combustible (separador de agua)
Drenaje de agua del filtro de gasoil
Revisión de niveles
Revisión de frenos
Revisión de sistema 4x4`,
    notas: 'Frontier 2.5 YD25: aceite 5W30 diesel Nissan. Capacidad: 8.0L. CADENA de distribución.',
  },
  {
    marca: 'Nissan',
    modelo: 'Frontier',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de aceite de diferencial delantero (4x4)
Cambio de aceite de diferencial trasero
Cambio de aceite de caja transferencia (4x4)
Cambio de filtro de habitáculo`,
    notas: 'Frontier 4x4: cambio de aceites de diferencial y transfer c/40.000 km.',
  },
  {
    marca: 'Nissan',
    modelo: 'Frontier',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (7 velocidades)
Cambio de filtros completos
Revisión de inyectores diesel`,
    notas: 'Frontier caja auto 7 velocidades: cambio de aceite c/60.000 km.',
  },
  {
    marca: 'Nissan',
    modelo: 'Frontier',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de líquido refrigerante
Cambio de aceite de diferenciales y transfer
Revisión completa de motor diesel
Revisión de turbo
Revisión de inyectores`,
  },

  // ============ NISSAN KICKS ============
  {
    marca: 'Nissan',
    modelo: 'Kicks',
    kilometraje: 10000,
    items: `Cambio de aceite motor (0W20, 4.0L HR16DE)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Kicks 1.6 HR16DE: aceite 0W20 Nissan. Capacidad: 4.0L. CADENA de distribución.',
  },
  {
    marca: 'Nissan',
    modelo: 'Kicks',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja CVT (NS-3)
Cambio de bujías (iridio c/100.000 km)
Cambio de filtros completos`,
    notas: 'Kicks CVT: cambio de aceite c/60.000 km con Nissan NS-3.',
  },
  {
    marca: 'Nissan',
    modelo: 'Kicks',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ CITROEN C3 ============
  {
    marca: 'Citroën',
    modelo: 'C3',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 TOTAL, 3.5L PureTech)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'C3 1.2 PureTech: aceite TOTAL 5W30. Capacidad: 3.5L.',
  },
  {
    marca: 'Citroën',
    modelo: 'C3',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de CORREA DE DISTRIBUCIÓN (PureTech húmeda)
Cambio de bomba de agua
Cambio de bujías`,
    notas: 'C3 PureTech: CORREA DE DISTRIBUCIÓN húmeda c/60.000 km. CRÍTICO.',
  },
  {
    marca: 'Citroën',
    modelo: 'C3',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de CORREA DE DISTRIBUCIÓN (NUEVAMENTE)
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ CITROEN C4 CACTUS ============
  {
    marca: 'Citroën',
    modelo: 'C4 Cactus',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 TOTAL, 3.5L PureTech)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'C4 Cactus 1.2 PureTech: aceite TOTAL 5W30. Capacidad: 3.5L.',
  },
  {
    marca: 'Citroën',
    modelo: 'C4 Cactus',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de CORREA DE DISTRIBUCIÓN (PureTech húmeda)
Cambio de bomba de agua
Cambio de bujías`,
    notas: 'C4 Cactus PureTech: CORREA DE DISTRIBUCIÓN húmeda c/60.000 km. CRÍTICO.',
  },
  {
    marca: 'Citroën',
    modelo: 'C4 Cactus',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de CORREA DE DISTRIBUCIÓN (NUEVAMENTE)
Cambio de líquido refrigerante
Revisión completa de motor`,
  },
]

async function main() {
  console.log('Cargando modelos específicos faltantes...')
  let cargados = 0
  for (const c of cronogramas) {
    try {
      await prisma.cronogramaService.create({ data: c })
      cargados++
    } catch (e) {
      // ya existe
    }
  }
  const total = await prisma.cronogramaService.count()
  console.log(`Modelos cargados en esta tanda: ${cargados}`)
  console.log(`Total en base: ${total}`)

  // Listar todos los modelos por marca
  const todos = await prisma.cronogramaService.findMany({
    where: { activo: true },
    select: { marca: true, modelo: true, kilometraje: true },
    orderBy: [{ marca: 'asc' }, { modelo: 'asc' }, { kilometraje: 'asc' }],
  })
  const porMarca: Record<string, Set<string>> = {}
  for (const t of todos) {
    if (!porMarca[t.marca]) porMarca[t.marca] = new Set()
    porMarca[t.marca].add(t.modelo)
  }
  console.log(`\n=== Resumen por marca ===`)
  for (const [marca, modelos] of Object.entries(porMarca).sort()) {
    console.log(`${marca}: ${Array.from(modelos).sort().join(', ')}`)
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

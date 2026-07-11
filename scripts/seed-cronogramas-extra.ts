import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Cronogramas específicos por marca y modelo + marcas nuevas
// Info basada en manuals de service del mercado argentino
const cronogramas: Array<{
  marca: string
  modelo: string
  kilometraje: number
  items: string
  notas?: string
}> = [
  // ============ HYUNDAI (NUEVA) ============
  {
    marca: 'Hyundai',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 API SN)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'Hyundai recomienda aceite 5W30 API SN o superior. Aceite original Hyundai o equivalente.',
  },
  {
    marca: 'Hyundai',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías (iridio c/100.000 km)
Limpieza de cuerpo de mariposa
Revisión de correas`,
  },
  {
    marca: 'Hyundai',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de inyectores`,
  },
  {
    marca: 'Hyundai',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Revisión de aceite de caja automática (c/90.000 km)
Revisión de embrague
Cambio de filtros completos`,
  },
  {
    marca: 'Hyundai',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías (iridio)
Cambio de aceite de caja automática
Cambio de líquido refrigerante
Revisión completa de motor`,
    notas: 'Service crítico: Hyundai usa cadena de distribución (no requiere cambio).',
  },

  // ============ HYUNDAI HB20 (específico) ============
  {
    marca: 'Hyundai',
    modelo: 'HB20',
    kilometraje: 10000,
    items: `Cambio de aceite motor 5W30 (3.3L aprox)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Reset de luz de mantenimiento`,
    notas: 'HB20 1.0 Kappa: aceite 5W30 API SN. Capacidad: 3.3L.',
  },
  {
    marca: 'Hyundai',
    modelo: 'HB20',
    kilometraje: 40000,
    items: `Todos los items del service de 10.000 km
Cambio de líquido de frenos DOT 4
Cambio de filtro de habitáculo
Limpieza de cuerpo de mariposa
Revisión de amortiguadores`,
  },
  {
    marca: 'Hyundai',
    modelo: 'HB20',
    kilometraje: 100000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Revisión completa de motor`,
    notas: 'HB20 usa cadena de distribución, no requiere cambio. Bujías iridio c/100.000 km.',
  },

  // ============ KIA (NUEVA) ============
  {
    marca: 'Kia',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 API SN)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'Kia usa mismas especificaciones que Hyundai (mismo grupo). Aceite 5W30 API SN.',
  },
  {
    marca: 'Kia',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías (iridio c/100.000 km)
Limpieza de cuerpo de mariposa`,
  },
  {
    marca: 'Kia',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores`,
  },
  {
    marca: 'Kia',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (c/90.000 km)
Revisión de embrague`,
  },
  {
    marca: 'Kia',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de aceite de caja automática
Cambio de líquido refrigerante
Revisión completa de motor`,
    notas: 'Kia usa cadena de distribución (no requiere cambio).',
  },

  // ============ BMW (NUEVA) ============
  {
    marca: 'BMW',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (Longlife 5W30 Castrol Edge)
Filtro de aceite
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Diagnóstico computarizado BMW ISTA
Reset de service CBS (Condition Based Service)`,
    notas: 'BMW exige aceite con norma Longlife-01 (LL01) o Longlife-04 (LL04 diesel). Castrol Edge 5W30 original.',
  },
  {
    marca: 'BMW',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de aire
Filtro de combustible (c/40.000 km)
Revisión de bujías (c/60.000 km turbo, c/100.000 NA)
Limpieza de cuerpo de mariposa`,
  },
  {
    marca: 'BMW',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Filtro de combustible
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Revisión de correas
Limpieza de inyectores`,
  },
  {
    marca: 'BMW',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías (motores turbo)
Cambio de aceite de caja automática ZF (c/100.000 km)
Revisión de embrague
Cambio de filtros completos`,
    notas: 'Cajas ZF 8HP: cambio de aceite c/100.000 km con aceite ZF Lifeguard.',
  },
  {
    marca: 'BMW',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de aceite de caja automática
Cambio de bujías (todos los motores)
Cambio de líquido refrigerante
Revisión completa de motor
Diagnóstico completo ISTA`,
    notas: 'Service crítico: BMW usa cadena de distribución (no requiere cambio). Revisar sistema Valvetronic en motores N42/N46.',
  },

  // ============ AUDI (NUEVA) ============
  {
    marca: 'Audi',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (VW 504.00/507.00 LongLife)
Filtro de aceite
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Diagnóstico computarizado VAG-COM/VCDS
Reset de service`,
    notas: 'Audi exige aceite con norma VW 504.00 (nafta LongLife) o VW 507.00 (diesel LongLife). 5W30 o 0W30.',
  },
  {
    marca: 'Audi',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de aire
Revisión de bujías (iridio c/60.000 km)
Revisión de correas
Limpieza de cuerpo de mariposa`,
  },
  {
    marca: 'Audi',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de inyectores`,
  },
  {
    marca: 'Audi',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías (motores TFSI)
Cambio de aceite de caja S-Tronic (DSG) (c/60.000 km)
Revisión de embrague DSG
Cambio de filtros completos`,
    notas: 'Cajas S-Tronic (DSG): cambio de aceite OBLIGATORIO c/60.000 km con aceite específico VAG.',
  },
  {
    marca: 'Audi',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías (todos los motores)
Cambio de líquido refrigerante (G12++/G13)
Revisión completa de motor
Diagnóstico completo VCDS`,
    notas: 'Service crítico: Audi usa cadena de distribución en TFSI modernos. En motores 1.4 TSI antiguos revisar correa.',
  },

  // ============ MERCEDES-BENZ (NUEVA) ============
  {
    marca: 'Mercedes-Benz',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (229.51/229.52)
Filtro de aceite
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Diagnóstico computarizado XENTRY
Reset de service ASSYST`,
    notas: 'Mercedes exige aceite con norma MB 229.51 (diesel) o MB 229.52 (nafta). Mobil 1 ESP 5W30 original.',
  },
  {
    marca: 'Mercedes-Benz',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de aire
Filtro de combustible (c/40.000 km)
Revisión de bujías (c/60.000 km)
Limpieza de cuerpo de mariposa`,
  },
  {
    marca: 'Mercedes-Benz',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Filtro de combustible
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de inyectores`,
  },
  {
    marca: 'Mercedes-Benz',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías (motores turbo)
Cambio de aceite de caja 7G-Tronic (c/70.000 km)
Revisión de embrague
Cambio de filtros completos`,
    notas: 'Cajas 7G-Tronic: cambio de aceite c/70.000 km con aceite MB 236.14 (Shell ATF 3403).',
  },
  {
    marca: 'Mercedes-Benz',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de aceite de caja automática
Cambio de bujías (todos los motores)
Cambio de líquido refrigerante
Revisión completa de motor
Diagnóstico completo XENTRY`,
    notas: 'Service crítico: Mercedes usa cadena de distribución en todos los motores modernos. Revisar sistema BlueTEC en diesel.',
  },

  // ============ JEEP (NUEVA) ============
  {
    marca: 'Jeep',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 Pennzoil)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'Jeep usa normas FCA. Aceite Pennzoil 5W40 con norma MS-12991 (diesel) o MS-6395 (nafta).',
  },
  {
    marca: 'Jeep',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías (iridio c/60.000 km)
Limpieza de cuerpo de mariposa
Revisión de sistema 4x4`,
  },
  {
    marca: 'Jeep',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Cambio de aceite de diferencial 4x4
Revisión de caja transferencia`,
    notas: 'Jeep 4x4: cambio de aceite de diferencial y transfer c/40.000 km con aceite Mopar.',
  },
  {
    marca: 'Jeep',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías
Cambio de aceite de caja automática
Revisión de embrague
Cambio de filtros completos`,
  },
  {
    marca: 'Jeep',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de líquido refrigerante
Cambio de aceite de diferencial y transfer
Revisión completa de motor
Revisión completa de sistema 4x4`,
    notas: 'Jeep usa cadena de distribución en motores modernos (Tigershark, Hurricane).',
  },

  // ============ MITSUBISHI (NUEVA) ============
  {
    marca: 'Mitsubishi',
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
    notas: 'Mitsubishi recomienda aceite 5W30 API SN. L200: aceite 5W30 diesel con norma JASO DH-2.',
  },
  {
    marca: 'Mitsubishi',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías (iridio c/100.000 km)
Limpieza de cuerpo de mariposa
Revisión de sistema 4x4 (L200/Outlander)`,
  },
  {
    marca: 'Mitsubishi',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Cambio de aceite de diferencial (4x4)`,
  },
  {
    marca: 'Mitsubishi',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (INVECS)
Cambio de aceite de caja transfer
Revisión de embrague
Cambio de filtros completos`,
    notas: 'Cajas INVECS: cambio de aceite c/60.000 km con aceite Mitsubishi Dia Queen ATF SP-III.',
  },
  {
    marca: 'Mitsubishi',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Cambio de aceite de diferencial y transfer
Revisión completa de motor`,
    notas: 'Mitsubishi L200: correa de distribución c/100.000 km en motores 4D56/4D56T.',
  },

  // ============ SUZUKI (NUEVA) ============
  {
    marca: 'Suzuki',
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
    notas: 'Suzuki recomienda 0W20 en motores modernos (K14B, K10B). 5W30 en modelos anteriores.',
  },
  {
    marca: 'Suzuki',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías (iridio c/100.000 km)
Limpieza de cuerpo de mariposa`,
  },
  {
    marca: 'Suzuki',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores`,
  },
  {
    marca: 'Suzuki',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja CVT (si aplica)
Revisión de embrague
Cambio de filtros completos`,
    notas: 'Suzuki Vitara con caja CVT: cambio de aceite c/60.000 km con Suzuki CVT Fluid.',
  },
  {
    marca: 'Suzuki',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Revisión completa de motor`,
    notas: 'Suzuki usa cadena de distribución (no requiere cambio).',
  },

  // ============ MAZDA (NUEVA) ============
  {
    marca: 'Mazda',
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
    notas: 'Mazda recomienda 0W20 en motores SkyActiv. 5W30 en motores MZR anteriores.',
  },
  {
    marca: 'Mazda',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías (iridio c/120.000 km SkyActiv)
Limpieza de cuerpo de mariposa`,
  },
  {
    marca: 'Mazda',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores`,
  },
  {
    marca: 'Mazda',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (SkyActiv-Drive)
Revisión de embrague
Cambio de filtros completos`,
    notas: 'Mazda SkyActiv-Drive: cambio de aceite de caja c/60.000 km con Mazda ATF FZ.',
  },
  {
    marca: 'Mazda',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Revisión completa de motor`,
    notas: 'Mazda SkyActiv usa cadena de distribución (no requiere cambio).',
  },

  // ============ CHERY (NUEVA) ============
  {
    marca: 'Chery',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 sintético)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'Chery recomienda aceite 5W40 sintético API SN. Tiggo: 5W30 en motor 1.5L.',
  },
  {
    marca: 'Chery',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías (c/40.000 km)
Limpieza de cuerpo de mariposa`,
  },
  {
    marca: 'Chery',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de bujías
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores`,
  },
  {
    marca: 'Chery',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de correa de distribución (motores ACTECO)
Cambio de bomba de agua
Revisión de embrague`,
    notas: 'Motores ACTECO: correa de distribución c/60.000 km o 5 años.',
  },
  {
    marca: 'Chery',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de correa de distribución (NUEVAMENTE)
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ GEELY (NUEVA) ============
  {
    marca: 'Geely',
    modelo: 'Genérico',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 sintético)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Revisión de suspensión
Inspección de neumáticos
Revisión de batería`,
    notas: 'Geely recomienda aceite 5W30 API SN sintético.',
  },
  {
    marca: 'Geely',
    modelo: 'Genérico',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Filtro de combustible
Revisión de bujías
Limpieza de cuerpo de mariposa`,
  },
  {
    marca: 'Geely',
    modelo: 'Genérico',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de bujías
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores`,
  },
  {
    marca: 'Geely',
    modelo: 'Genérico',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática
Revisión de embrague
Cambio de filtros completos`,
  },
  {
    marca: 'Geely',
    modelo: 'Genérico',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de líquido refrigerante
Revisión completa de motor`,
    notas: 'Geely usa cadena de distribución en motores modernos.',
  },

  // ============ TOYOTA HILUX (Diesel específico) ============
  {
    marca: 'Toyota',
    modelo: 'Hilux',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 diesel, 7.5L 1GD-FTV)
Filtro de aceite
Filtro de aire
Filtro de combustible (separador de agua)
Revisión de niveles
Revisión de frenos
Drenaje de agua del filtro de gasoil
Revisión de suspensión
Inspección de neumáticos`,
    notas: 'Hilux 1GD-FTV 2.8L: aceite 5W30 diesel Toyota. Capacidad: 7.5L. Drenar agua del filtro c/10.000 km.',
  },
  {
    marca: 'Toyota',
    modelo: 'Hilux',
    kilometraje: 20000,
    items: `Todos los items del service de 10.000 km
Cambio de filtro de combustible
Revisión de bujías incandescentes
Limpieza de intercooler
Revisión de sistema EGR`,
  },
  {
    marca: 'Toyota',
    modelo: 'Hilux',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Cambio de aceite de diferencial delantero (4x4)
Cambio de aceite de diferencial trasero
Cambio de aceite de caja transferencia (4x4)
Revisión de amortiguadores`,
    notas: 'Hilux 4x4: cambio de aceites de diferencial y transfer c/40.000 km con aceite Toyota 80W-90 GL-5.',
  },
  {
    marca: 'Toyota',
    modelo: 'Hilux',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (Aisin)
Revisión de embrague (manuales)
Cambio de filtros completos
Revisión de sistema DPF (filtro de partículas)`,
    notas: 'Hilux diesel con DPF: revisar sistema de filtro de partículas. Caja auto: aceite c/60.000 km.',
  },
  {
    marca: 'Toyota',
    modelo: 'Hilux',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de líquido refrigerante (SLLC)
Cambio de aceite de diferenciales y transfer
Revisión completa de motor diesel
Revisión de inyectores
Limpieza de radiador
Revisión de turbo`,
    notas: 'Hilux usa CADENA de distribución (no requiere cambio). Coolant Toyota Super Long Life (SLLC).',
  },

  // ============ TOYOTA ETIOS (Económico) ============
  {
    marca: 'Toyota',
    modelo: 'Etios',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 sintético, 3.6L 2NR-FE)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Reset de luz de mantenimiento`,
    notas: 'Etios 2NR-FE 1.5L: aceite 5W30 sintético Toyota. Capacidad: 3.6L.',
  },
  {
    marca: 'Toyota',
    modelo: 'Etios',
    kilometraje: 40000,
    items: `Todos los items del service de 10.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Cambio de bujías (iridio c/100.000 km)`,
  },
  {
    marca: 'Toyota',
    modelo: 'Etios',
    kilometraje: 100000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Cambio de aceite de caja manual
Revisión completa de motor`,
    notas: 'Etios usa CADENA de distribución (no requiere cambio). Bujías iridio c/100.000 km.',
  },

  // ============ FORD RANGER (Diesel específico) ============
  {
    marca: 'Ford',
    modelo: 'Ranger',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 diesel, 8.0L Puma)
Filtro de aceite
Filtro de aire
Filtro de combustible (separador de agua)
Revisión de niveles
Revisión de frenos
Drenaje de agua del filtro de gasoil
Revisión de suspensión`,
    notas: 'Ranger 3.2 Puma: aceite 5W30 diesel Ford. Capacidad: 8.0L. Drenar agua del filtro c/10.000 km.',
  },
  {
    marca: 'Ford',
    modelo: 'Ranger',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Cambio de aceite de diferencial delantero (4x4)
Cambio de aceite de diferencial trasero
Cambio de aceite de caja transferencia (4x4)`,
    notas: 'Ranger 4x4: cambio de aceites de diferencial y transfer c/40.000 km con aceite Ford 75W-85 GL-5.',
  },
  {
    marca: 'Ford',
    modelo: 'Ranger',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (6R80)
Revisión de sistema DPF (filtro de partículas)
Cambio de filtros completos`,
    notas: 'Ranger diesel con DPF: revisar sistema. Caja auto 6R80: aceite c/60.000 km con Motorcraft Mercon LV.',
  },
  {
    marca: 'Ford',
    modelo: 'Ranger',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de líquido refrigerante (Motorcraft Gold)
Cambio de aceite de diferenciales y transfer
Revisión completa de motor diesel
Revisión de inyectores
Revisión de turbo`,
    notas: 'Ranger 3.2 Puma usa CADENA de distribución (no requiere cambio).',
  },

  // ============ VW AMAROK (Diesel específico) ============
  {
    marca: 'Volkswagen',
    modelo: 'Amarok',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 VW 507.00, 8.4L)
Filtro de aceite
Filtro de aire
Filtro de combustible (separador de agua)
Revisión de niveles
Revisión de frenos
Drenaje de agua del filtro de gasoil`,
    notas: 'Amarok 3.0 V6 TDI: aceite 5W30 con norma VW 507.00 (LongLife). Capacidad: 8.4L.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Amarok',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Cambio de aceite de diferencial delantero (4x4)
Cambio de aceite de diferencial trasero
Cambio de aceite de caja transferencia (4x4)
Revisión de sistema DPF`,
    notas: 'Amarok 4Motion: cambio de aceites de diferencial y transfer c/40.000 km con aceite VW 75W-90 GL-5.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Amarok',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (8HP)
Cambio de filtros completos
Revisión de inyectores diesel`,
    notas: 'Amarok caja auto 8HP ZF: cambio de aceite c/60.000 km con aceite ZF Lifeguard 8.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Amarok',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de líquido refrigerante (G12++/G13)
Cambio de aceite de diferenciales y transfer
Revisión completa de motor TDI
Revisión de turbo
Revisión de DPF`,
    notas: 'Amarok 3.0 V6 TDI usa CADENA de distribución (no requiere cambio).',
  },

  // ============ RENAULT SANDERO/LOGAN (Motor K4M) ============
  {
    marca: 'Renault',
    modelo: 'Sandero',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 ELF, 4.8L K4M)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Sandero K4M 1.6L: aceite ELF 5W40 con norma RN0710. Capacidad: 4.8L.',
  },
  {
    marca: 'Renault',
    modelo: 'Sandero',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa`,
  },
  {
    marca: 'Renault',
    modelo: 'Sandero',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de CORREA DE DISTRIBUCIÓN (K4M)
Cambio de bomba de agua
Cambio de tensor de correa
Cambio de bujías
Revisión de embrague`,
    notas: 'Sandero K4M: CORREA DE DISTRIBUCIÓN c/60.000 km o 5 años (lo que ocurra primero). CRÍTICO.',
  },
  {
    marca: 'Renault',
    modelo: 'Sandero',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de CORREA DE DISTRIBUCIÓN (NUEVAMENTE)
Cambio de bomba de agua
Cambio de líquido refrigerante (GLACEOL)
Cambio de filtros completos
Revisión completa de motor`,
  },

  // ============ RENAULT KWID (Motor 1.0 BR8) ============
  {
    marca: 'Renault',
    modelo: 'Kwid',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 ELF, 3.3L BR8)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Kwid BR8 1.0L: aceite ELF 5W40 con norma RN0700. Capacidad: 3.3L.',
  },
  {
    marca: 'Renault',
    modelo: 'Kwid',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa`,
  },
  {
    marca: 'Renault',
    modelo: 'Kwid',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de CORREA DE DISTRIBUCIÓN (BR8)
Cambio de bomba de agua
Cambio de bujías
Revisión de embrague`,
    notas: 'Kwid BR8: CORREA DE DISTRIBUCIÓN c/60.000 km o 5 años. CRÍTICO.',
  },
  {
    marca: 'Renault',
    modelo: 'Kwid',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de CORREA DE DISTRIBUCIÓN (NUEVAMENTE)
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ FIAT CRONOS (Motor 1.3 GSE) ============
  {
    marca: 'Fiat',
    modelo: 'Cronos',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 Selenia, 4.0L)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Cronos 1.3 GSE Firefly: aceite Selenia 5W40. Capacidad: 4.0L.',
  },
  {
    marca: 'Fiat',
    modelo: 'Cronos',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa`,
  },
  {
    marca: 'Fiat',
    modelo: 'Cronos',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías
Cambio de aceite de caja manual
Revisión de embrague
Cambio de filtros completos`,
    notas: 'Cronos 1.3 GSE usa CADENA de distribución (no requiere cambio).',
  },
  {
    marca: 'Fiat',
    modelo: 'Cronos',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías
Cambio de líquido refrigerante (Paraflu)
Revisión completa de motor`,
  },

  // ============ CHEVROLET ONIX (1.0 Turbo) ============
  {
    marca: 'Chevrolet',
    modelo: 'Onix',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 Dexos 1, 4.0L)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Onix 1.0 Turbo: aceite Dexos 1 5W30. Capacidad: 4.0L. Turbo: revisar sistema de aceite.',
  },
  {
    marca: 'Chevrolet',
    modelo: 'Onix',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa
Revisión de turbo`,
  },
  {
    marca: 'Chevrolet',
    modelo: 'Onix',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías (iridio)
Cambio de aceite de caja automática
Revisión de embrague
Cambio de filtros completos`,
    notas: 'Onix 1.0 Turbo usa CADENA de distribución (no requiere cambio).',
  },
  {
    marca: 'Chevrolet',
    modelo: 'Onix',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante (Dex-Cool)
Revisión completa de motor
Revisión de turbo`,
  },

  // ============ HONDA CIVIC (1.5L Turbo) ============
  {
    marca: 'Honda',
    modelo: 'Civic',
    kilometraje: 10000,
    items: `Cambio de aceite motor (0W20, 3.5L L15B7)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Civic 1.5L Turbo L15B7: aceite 0W20 Honda. Capacidad: 3.5L. Turbo: revisar sistema de aceite.',
  },
  {
    marca: 'Honda',
    modelo: 'Civic',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa
Revisión de turbo`,
  },
  {
    marca: 'Honda',
    modelo: 'Civic',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja CVT (si aplica)
Revisión de embrague
Cambio de filtros completos
Cambio de bujías (iridio c/100.000 km)`,
    notas: 'Civic CVT: cambio de aceite c/60.000 km con Honda CVT Fluid. Civic usa CADENA de distribución.',
  },
  {
    marca: 'Honda',
    modelo: 'Civic',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Revisión completa de motor
Revisión de turbo`,
  },

  // ============ HYUNDAI CRETA (1.6L) ============
  {
    marca: 'Hyundai',
    modelo: 'Creta',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30 API SN, 3.6L Gamma)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Creta 1.6 Gamma: aceite 5W30 API SN. Capacidad: 3.6L.',
  },
  {
    marca: 'Hyundai',
    modelo: 'Creta',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa`,
  },
  {
    marca: 'Hyundai',
    modelo: 'Creta',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja automática (6 velocidades)
Revisión de embrague
Cambio de filtros completos`,
    notas: 'Creta 1.6: CADENA de distribución (no requiere cambio).',
  },
  {
    marca: 'Hyundai',
    modelo: 'Creta',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante
Revisión completa de motor`,
  },

  // ============ TOYOTA COROLLA (1.8L) ============
  {
    marca: 'Toyota',
    modelo: 'Corolla',
    kilometraje: 10000,
    items: `Cambio de aceite motor (0W20, 4.2L 2ZR-FAE)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería
Reset de luz de mantenimiento`,
    notas: 'Corolla 2ZR-FAE 1.8L: aceite 0W20 Toyota. Capacidad: 4.2L.',
  },
  {
    marca: 'Toyota',
    modelo: 'Corolla',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa`,
  },
  {
    marca: 'Toyota',
    modelo: 'Corolla',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de aceite de caja CVT (si aplica)
Revisión de embrague
Cambio de filtros completos
Cambio de bujías (iridio c/100.000 km)`,
    notas: 'Corolla CVT: cambio de aceite c/60.000 km con Toyota CVT Fluid. CADENA de distribución.',
  },
  {
    marca: 'Toyota',
    modelo: 'Corolla',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías iridio
Cambio de líquido refrigerante (SLLC)
Revisión completa de motor`,
    notas: 'Corolla 2ZR-FAE usa CADENA de distribución (no requiere cambio).',
  },

  // ============ VW GOL (1.6L) ============
  {
    marca: 'Volkswagen',
    modelo: 'Gol',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 VW 502.00, 3.6L EA211)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'Gol EA211 1.6L: aceite 5W40 con norma VW 502.00. Capacidad: 3.6L.',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Gol',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa`,
  },
  {
    marca: 'Volkswagen',
    modelo: 'Gol',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías
Revisión de embrague
Cambio de filtros completos
Cambio de aceite de caja manual`,
    notas: 'Gol EA211 usa CADENA de distribución (no requiere cambio).',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Gol',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías
Cambio de líquido refrigerante (G12++/G13)
Revisión completa de motor`,
  },

  // ============ RENAULT DUSTER (4x4) ============
  {
    marca: 'Renault',
    modelo: 'Duster',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W40 ELF, 4.8L K4M)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería
Revisión de sistema 4x4 (si aplica)`,
    notas: 'Duster K4M 1.6L: aceite ELF 5W40 con norma RN0710. Capacidad: 4.8L.',
  },
  {
    marca: 'Renault',
    modelo: 'Duster',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Cambio de aceite de diferencial trasero (4x4)
Cambio de aceite de caja transferencia (4x4)
Revisión de amortiguadores`,
    notas: 'Duster 4x4: cambio de aceites de diferencial y transfer c/40.000 km con aceite Renault 75W-80.',
  },
  {
    marca: 'Renault',
    modelo: 'Duster',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de CORREA DE DISTRIBUCIÓN (K4M)
Cambio de bomba de agua
Cambio de tensor de correa
Cambio de bujías
Revisión de embrague`,
    notas: 'Duster K4M: CORREA DE DISTRIBUCIÓN c/60.000 km o 5 años. CRÍTICO.',
  },
  {
    marca: 'Renault',
    modelo: 'Duster',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de CORREA DE DISTRIBUCIÓN (NUEVAMENTE)
Cambio de bomba de agua
Cambio de líquido refrigerante (GLACEOL)
Cambio de aceite de diferenciales y transfer
Revisión completa de motor`,
  },

  // ============ FORD ECOSPORT (1.5L) ============
  {
    marca: 'Ford',
    modelo: 'EcoSport',
    kilometraje: 10000,
    items: `Cambio de aceite motor (5W30, 4.0L Sigma)
Filtro de aceite
Filtro de aire
Revisión de niveles
Revisión de frenos
Inspección de neumáticos
Revisión de batería`,
    notas: 'EcoSport 1.5 Sigma: aceite 5W30 Ford. Capacidad: 4.0L.',
  },
  {
    marca: 'Ford',
    modelo: 'EcoSport',
    kilometraje: 40000,
    items: `Todos los items del service de 20.000 km
Cambio de líquido de frenos (DOT 4)
Cambio de filtro de habitáculo
Revisión de amortiguadores
Limpieza de mariposa`,
  },
  {
    marca: 'Ford',
    modelo: 'EcoSport',
    kilometraje: 60000,
    items: `Todos los items del service de 40.000 km
Cambio de bujías
Cambio de aceite de caja automática (PowerShift)
Revisión de embrague
Cambio de filtros completos`,
    notas: 'EcoSport 1.5 Sigma usa CADENA de distribución. Caja PowerShift: revisar embrague.',
  },
  {
    marca: 'Ford',
    modelo: 'EcoSport',
    kilometraje: 100000,
    items: `Todos los items del service de 60.000 km
Cambio de bujías
Cambio de líquido refrigerante (Motorcraft Gold)
Revisión completa de motor`,
  },
]

async function main() {
  console.log('Cargando nuevos cronogramas (más marcas y modelos)...')
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
  console.log(`Cronogramas cargados en esta tanda: ${cargados}`)
  console.log(`Total en base: ${total}`)

  const marcas = await prisma.cronogramaService.findMany({
    where: { activo: true },
    select: { marca: true, modelo: true },
    distinct: ['marca', 'modelo'],
  })
  console.log(`\nMarcas y modelos disponibles:`)
  const porMarca: Record<string, string[]> = {}
  for (const m of marcas) {
    if (!porMarca[m.marca]) porMarca[m.marca] = []
    porMarca[m.marca].push(m.modelo)
  }
  for (const [marca, modelos] of Object.entries(porMarca).sort()) {
    console.log(`  ${marca}: ${modelos.join(', ')}`)
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

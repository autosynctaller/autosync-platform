// Seed: 20 vehículos de prueba con trabajos e historial inventado
// Asignados al taller "Ejemplo" (ejemplo@ejemplo.com / test1234)

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const TALLER_ID = 'cmsz7kuki0002nub9bqpjsjl0'; // Taller "Ejemplo"

// 20 vehículos variados
const vehiculos = [
  { patente: 'AB123CD', marca: 'Toyota', modelo: 'Corolla', anio: 2018, color: 'Gris', km: 85000, combustible: 'Nafta', gnc: false, tipo: 'Auto' },
  { patente: 'AC456EF', marca: 'Ford', modelo: 'Fiesta', anio: 2015, color: 'Rojo', km: 120000, combustible: 'Nafta', gnc: true, tipo: 'Auto' },
  { patente: 'AD789GH', marca: 'Chevrolet', modelo: 'Onix', anio: 2020, color: 'Blanco', km: 35000, combustible: 'Nafta', gnc: false, tipo: 'Auto' },
  { patente: 'AE012IJ', marca: 'Volkswagen', modelo: 'Gol Trend', anio: 2017, color: 'Negro', km: 95000, combustible: 'Nafta', gnc: true, tipo: 'Auto' },
  { patente: 'AF345KL', marca: 'Renault', modelo: 'Sandero', anio: 2019, color: 'Azul', km: 62000, combustible: 'Nafta', gnc: false, tipo: 'Auto' },
  { patente: 'AG678MN', marca: 'Toyota', modelo: 'Hilux', anio: 2021, color: 'Blanco', km: 48000, combustible: 'Diesel', gnc: false, tipo: 'Camioneta' },
  { patente: 'AH901OP', marca: 'Ford', modelo: 'Ranger', anio: 2016, color: 'Gris', km: 145000, combustible: 'Diesel', gnc: false, tipo: 'Camioneta' },
  { patente: 'AI234QR', marca: 'Chevrolet', modelo: 'Cruze', anio: 2018, color: 'Plateado', km: 78000, combustible: 'Nafta', gnc: false, tipo: 'Auto' },
  { patente: 'AJ567ST', marca: 'Volkswagen', modelo: 'Amarok', anio: 2020, color: 'Negro', km: 56000, combustible: 'Diesel', gnc: false, tipo: 'Camioneta' },
  { patente: 'AK890UV', marca: 'Honda', modelo: 'CG 150 Titan', anio: 2019, color: 'Rojo', km: 28000, combustible: 'Nafta', gnc: false, tipo: 'Moto' },
  { patente: 'AL123WX', marca: 'Yamaha', modelo: 'FZ FI', anio: 2022, color: 'Azul', km: 12000, combustible: 'Nafta', gnc: false, tipo: 'Moto' },
  { patente: 'AM456YZ', marca: 'Renault', modelo: 'Kangoo', anio: 2014, color: 'Blanco', km: 180000, combustible: 'Nafta', gnc: true, tipo: 'Utilitario' },
  { patente: 'AN789AB', marca: 'Peugeot', modelo: '208', anio: 2021, color: 'Azul', km: 42000, combustible: 'Nafta', gnc: false, tipo: 'Auto' },
  { patente: 'AO012CD', marca: 'Citroen', modelo: 'C3', anio: 2016, color: 'Rojo', km: 110000, combustible: 'Nafta', gnc: true, tipo: 'Auto' },
  { patente: 'AP345EF', marca: 'Fiat', modelo: 'Cronos', anio: 2020, color: 'Gris', km: 38000, combustible: 'Nafta', gnc: false, tipo: 'Auto' },
  { patente: 'AQ678GH', marca: 'Toyota', modelo: 'Etios', anio: 2017, color: 'Blanco', km: 88000, combustible: 'Nafta', gnc: true, tipo: 'Auto' },
  { patente: 'AR901IJ', marca: 'Ford', modelo: 'EcoSport', anio: 2019, color: 'Naranja', km: 58000, combustible: 'Nafta', gnc: false, tipo: 'SUV' },
  { patente: 'AS234KL', marca: 'Chevrolet', modelo: 'Tracker', anio: 2022, color: 'Blanco', km: 18000, combustible: 'Diesel', gnc: false, tipo: 'SUV' },
  { patente: 'AT567MN', marca: 'Volkswagen', modelo: 'T-Cross', anio: 2021, color: 'Gris', km: 32000, combustible: 'Nafta', gnc: false, tipo: 'SUV' },
  { patente: 'AU890OP', marca: 'Audi', modelo: 'A3', anio: 2015, color: 'Negro', km: 165000, combustible: 'Nafta', gnc: false, tipo: 'Auto' },
];

// Trabajos variados por vehículo (1 a 4 trabajos cada uno)
const trabajosPosibles = [
  { titulo: 'Cambio de aceite y filtros', descripcion: 'Cambio de aceite motor 5W30 + filtro de aceite + filtro de aire. Lubricante sintético.', precio: 18000 },
  { titulo: 'Service de 60.000 km', descripcion: 'Service completo según plan: aceite, filtros, bujías, líquido de frenos.', precio: 45000 },
  { titulo: 'Cambio de pastillas de freno', descripcion: 'Pastillas de freno delanteras nuevas. Revisión de discos (sin cambio).', precio: 22000 },
  { titulo: 'Cambio de pastillas y discos', descripcion: 'Pastillas delanteras + discos nuevos. Sistema de frenos completo.', precio: 58000 },
  { titulo: 'Diagnóstico computarizado', descripcion: 'Scanner OBD2. Sin fallas detectadas. Se resetean testigos.', precio: 8000 },
  { titulo: 'Alineación y balanceo', descripcion: 'Alineación de dirección + balanceo de las 4 ruedas.', precio: 12000 },
  { titulo: 'Cambio de neumáticos (x4)', descripcion: '4 neumáticos nuevos 195/65 R15. Alineación incluida.', precio: 95000 },
  { titulo: 'Amortiguadores delanteros', descripcion: 'Cambio de 2 amortiguadores delanteros + rulemanes.', precio: 72000 },
  { titulo: 'Service de 100.000 km', descripcion: 'Service completo + cambio de correa de distribución + bomba de agua.', precio: 120000 },
  { titulo: 'Sistema de GNC - Revisión', descripcion: 'Revisión de sistema GNC. Cambio de filtros y regulador. Prueba de hermeticidad.', precio: 35000 },
  { titulo: 'VTV - Inspección previa', descripcion: 'Revisión general para VTV. Se detectan 2 observaciones menores.', precio: 15000 },
  { titulo: 'Cambio de batería', descripcion: 'Batería nueva 12V 75Ah. Prueba de arranque OK.', precio: 38000 },
  { titulo: 'Embrague completo', descripcion: 'Cambio de kit de embrague (disco, platillo y rulemanes).', precio: 95000 },
  { titulo: 'Limpieza de inyectores', descripcion: 'Limpieza y calibración de 4 inyectores. Mejora en consumo.', precio: 28000 },
  { titulo: 'Service de 30.000 km', descripcion: 'Cambio de aceite + filtros + revisión de frenos + líquidos.', precio: 32000 },
  { titulo: 'Cambio de líquido de frenos', descripcion: 'Sangrado completo del sistema. Líquido DOT4 nuevo.', precio: 14000 },
  { titulo: 'Reparación de escape', descripcion: 'Soldadura y refuerzo de caño de escape. Silenciador OK.', precio: 18000 },
  { titulo: 'Diagnóstico eléctrico', descripcion: 'Búsqueda de cortocircuito en sistema de luces. Reparado.', precio: 25000 },
  { titulo: 'Cambio de espejo retrovisor', descripcion: 'Espejo retrovisor derecho nuevo (roto por vandalismo).', precio: 18000 },
];

async function main() {
  console.log('=== Limpiando datos de prueba anteriores ===');
  // Borrar trabajos existentes del taller Ejemplo
  const trabajosBorrados = await db.trabajo.deleteMany({ where: { tallerId: TALLER_ID } });
  console.log(`- ${trabajosBorrados.count} trabajos eliminados`);
  
  // Borrar vehículos que no tengan dueño (los de prueba)
  const vehiculosBorrados = await db.vehiculo.deleteMany({ where: { ownerId: null } });
  console.log(`- ${vehiculosBorrados.count} vehículos sin dueño eliminados`);
  
  console.log('\n=== Creando 20 vehículos ===');
  const vehiculosCreados = [];
  
  for (const v of vehiculos) {
    // Fecha de VTV vencida para algunos (random), gnc si tiene GNC
    const tieneVTV = Math.random() > 0.4;
    const vtvVencimiento = tieneVTV ? new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) : null;
    const gncVencimiento = v.gnc ? new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) : null;
    
    const vehiculo = await db.vehiculo.create({
      data: {
        patente: v.patente,
        marca: v.marca,
        modelo: v.modelo,
        anio: v.anio,
        color: v.color,
        kilometraje: v.km,
        tipo: v.tipo,
        combustible: v.combustible,
        vtvVencimiento,
        gncVencimiento,
      },
    });
    vehiculosCreados.push(vehiculo);
    console.log(`+ ${vehiculo.patente} - ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.anio}) - ${vehiculo.kilometraje} km`);
  }
  
  console.log('\n=== Cargando trabajos para cada vehículo ===');
  let totalTrabajos = 0;
  
  for (const v of vehiculosCreados) {
    // 1 a 4 trabajos por vehículo
    const cantTrabajos = Math.floor(Math.random() * 4) + 1;
    const trabajosElegidos = [];
    
    for (let i = 0; i < cantTrabajos; i++) {
      const t = trabajosPosibles[Math.floor(Math.random() * trabajosPosibles.length)];
      // Evitar duplicados
      if (!trabajosElegidos.find(x => x.titulo === t.titulo)) {
        trabajosElegidos.push(t);
      }
    }
    
    for (let i = 0; i < trabajosElegidos.length; i++) {
      const t = trabajosElegidos[i];
      // Fecha aleatoria en los últimos 2 años
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 730));
      // Kilometraje en el momento del trabajo (un poco menos que el actual)
      const kmTrabajo = Math.max(0, v.kilometraje - Math.floor(Math.random() * 20000) - 1000);
      
      await db.trabajo.create({
        data: {
          vehiculoId: v.id,
          tallerId: TALLER_ID,
          titulo: t.titulo,
          descripcion: t.descripcion,
          precio: t.precio,
          estado: 'COMPLETADO',
          fecha,
          kilometraje: kmTrabajo,
        },
      });
      totalTrabajos++;
    }
  }
  
  console.log(`+ ${totalTrabajos} trabajos creados en total`);
  
  console.log('\n=== Resumen final ===');
  const totalVehiculos = await db.vehiculo.count();
  const totalTrabajosDb = await db.trabajo.count();
  console.log(`Total vehículos en DB: ${totalVehiculos}`);
  console.log(`Total trabajos en DB: ${totalTrabajosDb}`);
  console.log(`Trabajos del taller "Ejemplo": ${await db.trabajo.count({ where: { tallerId: TALLER_ID } })}`);
  
  console.log('\n=== Listado de vehículos cargados ===');
  const todos = await db.vehiculo.findMany({
    select: { patente: true, marca: true, modelo: true, anio: true, kilometraje: true, combustible: true, _count: { select: { trabajos: true } } },
    orderBy: { patente: 'asc' },
  });
  console.table(todos);
}

main()
  .catch((e) => { console.error('Error:', e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });

// Popular VehiculoTaller a partir de los trabajos existentes
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const TALLER_ID = 'cmsz7kuki0002nub9bqpjsjl0'; // Taller "Ejemplo"

(async () => {
  console.log('=== Verificando trabajos del taller Ejemplo ===');
  const trabajos = await db.trabajo.findMany({
    where: { tallerId: TALLER_ID },
    select: { id: true, vehiculoId: true, fecha: true }
  });
  console.log(`Encontrados ${trabajos.length} trabajos`);

  // Agrupar por vehiculoId
  const porVehiculo = {};
  for (const t of trabajos) {
    if (!porVehiculo[t.vehiculoId]) {
      porVehiculo[t.vehiculoId] = { primero: t.fecha, ultimo: t.fecha, total: 0 };
    }
    porVehiculo[t.vehiculoId].total++;
    if (t.fecha < porVehiculo[t.vehiculoId].primero) {
      porVehiculo[t.vehiculoId].primero = t.fecha;
    }
    if (t.fecha > porVehiculo[t.vehiculoId].ultimo) {
      porVehiculo[t.vehiculoId].ultimo = t.fecha;
    }
  }

  console.log(`\nVehículos distintos trabajados: ${Object.keys(porVehiculo).length}`);

  // Crear entradas en VehiculoTaller
  let creados = 0;
  for (const [vehiculoId, data] of Object.entries(porVehiculo)) {
    await db.vehiculoTaller.upsert({
      where: { vehiculoId_tallerId: { vehiculoId, tallerId: TALLER_ID } },
      update: {
        primero: data.primero,
        ultimo: data.ultimo,
        totalTrabajos: data.total,
      },
      create: {
        vehiculoId,
        tallerId: TALLER_ID,
        primero: data.primero,
        ultimo: data.ultimo,
        totalTrabajos: data.total,
      },
    });
    creados++;
  }
  
  console.log(`\n=== VehiculoTaller poblada: ${creados} entradas ===`);
  
  // Verificar
  const total = await db.vehiculoTaller.count({ where: { tallerId: TALLER_ID } });
  console.log(`Total en VehiculoTaller para taller Ejemplo: ${total}`);
  
  await db.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });

// Arreglar vehículos con datos nulos antes del db push
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  // Buscar vehículos con marca/modelo/anio null
  const vehiculos = await db.vehiculo.findMany({ where: { OR: [{ marca: null }, { modelo: null }, { anio: null }] }, select: { id: true, patente: true, marca: true, modelo: true, anio: true } });
  console.log(`Encontrados ${vehiculos.length} vehículos con datos nulos`);
  
  for (const v of vehiculos) {
    console.log(`- ${v.patente}: marca=${v.marca}, modelo=${v.modelo}, anio=${v.anio}`);
    await db.vehiculo.update({
      where: { id: v.id },
      data: {
        marca: v.marca || 'Desconocida',
        modelo: v.modelo || 'Desconocido',
        anio: v.anio || 2000,
      },
    });
  }
  
  console.log('Vehículos arreglados');
  await db.$disconnect();
})();

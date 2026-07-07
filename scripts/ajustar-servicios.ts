import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Eliminar Alineación y Balanceo
  const eliminado = await prisma.servicio.deleteMany({
    where: { nombre: { contains: 'Alineación' } },
  })
  console.log(`Servicio eliminado: ${eliminado.count} registro(s)`)

  // Eliminar precios de los servicios públicos (los dejamos en null)
  const actualizados = await prisma.servicio.updateMany({
    where: { precioBase: { not: null } },
    data: { precioBase: null },
  })
  console.log(`Precios quitados de: ${actualizados.count} servicio(s)`)

  const total = await prisma.servicio.count()
  console.log(`Total servicios activos: ${total}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

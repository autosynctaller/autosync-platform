import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

interface VehiculoCSV {
  marca: string
  modelo: string
  segmento: string
  periodo: string
  motorizaciones: string
  propulsion: string
  distribucion: string
  aceite: string
  intervaloFiltros: string
  puntoCritico: string
}

async function main() {
  console.log('Cargando datos técnicos del CSV...')

  const csvContent = readFileSync('/home/z/my-project/upload/base_datos_mantenimiento_argentina_completa.csv', 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as VehiculoCSV[]

  console.log(`Vehículos en CSV: ${records.length}`)

  let actualizados = 0
  let creados = 0

  for (const row of records) {
    const marca = (row as any).Marca?.trim() || (row as any).marca?.trim() || ''
    const modeloRaw = (row as any).Modelo_Familia?.trim() || (row as any).modelo?.trim() || ''
    const distribucion = (row as any).Distribucion?.trim() || ''
    const aceite = (row as any).Aceite_Sugerido?.trim() || ''
    const intervaloFiltros = (row as any).Intervalo_Filtros?.trim() || ''
    const puntoCritico = (row as any).Punto_Critico_Taller?.trim() || ''
    const motorizaciones = (row as any).Motorizaciones?.trim() || ''
    const propulsion = (row as any).Tipo_Propulsion?.trim() || ''
    const periodo = (row as any).Periodo?.trim() || ''

    if (!marca || !modeloRaw) continue

    // Procesar cada modelo (pueden ser varios separados por /)
    const modelos = modeloRaw.split('/').map(m => m.trim()).filter(Boolean)

    for (const modeloNombre of modelos) {
      // Buscar si ya existe un cronograma para esta marca+modelo
      const existentes = await prisma.cronogramaService.findMany({
        where: {
          marca: { contains: marca, mode: 'insensitive' },
          modelo: { contains: modeloNombre, mode: 'insensitive' },
        },
      })

      if (existentes.length > 0) {
        // Actualizar las notas con la información técnica del CSV
        const infoTecnica = [
          `📋 Datos técnicos:`,
          `Motor: ${motorizaciones}`,
          `Propulsión: ${propulsion}`,
          `Distribución: ${distribucion}`,
          `Aceite: ${aceite}`,
          `Filtros: ${intervaloFiltros}`,
          `Período: ${periodo}`,
          ``,
          `⚠️ Punto crítico: ${puntoCritico}`,
        ].join('\n')

        for (const cron of existentes) {
          // Solo actualizar si no tiene ya la info técnica
          if (!cron.notas?.includes('📋 Datos técnicos:')) {
            const notasActuales = cron.notas || ''
            const nuevasNotas = notasActuales
              ? `${notasActuales}\n\n${infoTecnica}`
              : infoTecnica

            await prisma.cronogramaService.update({
              where: { id: cron.id },
              data: { notas: nuevasNotas },
            })
            actualizados++
          }
        }
      } else {
        // Crear cronogramas básicos para modelos que no existen
        const items = [
          `Cambio de aceite motor (${aceite})`,
          `Filtro de aceite`,
          `Filtro de aire`,
          `Revisión de niveles`,
          `Revisión de frenos`,
          `Inspección de neumáticos`,
          `Revisión de batería`,
        ].join('\n')

        const notas = [
          `📋 Datos técnicos:`,
          `Motor: ${motorizaciones}`,
          `Propulsión: ${propulsion}`,
          `Distribución: ${distribucion}`,
          `Aceite: ${aceite}`,
          `Filtros: ${intervaloFiltros}`,
          `Período: ${periodo}`,
          ``,
          `⚠️ Punto crítico: ${puntoCritico}`,
        ].join('\n')

        // Crear services en 10k, 20k, 40k, 60k, 100k
        for (const km of [10000, 20000, 40000, 60000, 100000]) {
          await prisma.cronogramaService.create({
            data: {
              marca,
              modelo: modeloNombre,
              kilometraje: km,
              items,
              notas: km === 10000 ? notas : null, // solo el de 10k tiene las notas
            },
          }).catch(() => {})
          creados++
        }
      }
    }
  }

  const total = await prisma.cronogramaService.count()
  console.log(`\n=== Resultado ===`)
  console.log(`Cronogramas actualizados: ${actualizados}`)
  console.log(`Cronogramas nuevos creados: ${creados}`)
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

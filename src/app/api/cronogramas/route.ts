import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ADMIN_PIN = process.env.ADMIN_PIN || '1989'

function verificarPin(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-pin')
  return auth === ADMIN_PIN
}

// GET: listar cronogramas (solo admin)
// Query params:
//   marca=Toyota        -> filtra por marca
//   modelo=Corolla      -> filtra por modelo
//   km=85000            -> devuelve el cronograma sugerido para ese kilometraje
export async function GET(req: NextRequest) {
  if (!verificarPin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const marca = searchParams.get('marca')
    const modelo = searchParams.get('modelo')
    const km = searchParams.get('km')

    const where: { activo: boolean; OR?: Array<Record<string, unknown>> } = {
      activo: true,
    }

    // Búsqueda flexible por marca: si la marca del vehículo contiene
    // el nombre de alguna marca en la BD, o viceversa, hace match.
    // Ej: "Mercedes " coincide con "Mercedes-Benz"
    if (marca) {
      const marcaTrim = marca.trim().toLowerCase()
      const todasMarcas = await db.cronogramaService.findMany({
        where: { activo: true },
        select: { marca: true },
        distinct: ['marca'],
      })
      const marcasMatch = todasMarcas
        .filter((m) => {
          const mLow = m.marca.toLowerCase()
          return (
            mLow.includes(marcaTrim) ||
            marcaTrim.includes(mLow) ||
            // Normalizar: quitar guiones y comparar
            mLow.replace(/[^a-z0-9]/g, '').includes(
              marcaTrim.replace(/[^a-z0-9]/g, ''),
            ) ||
            marcaTrim.replace(/[^a-z0-9]/g, '').includes(
              mLow.replace(/[^a-z0-9]/g, ''),
            )
          )
        })
        .map((m) => m.marca)

      if (marcasMatch.length > 0) {
        where.OR = marcasMatch.map((m) => ({ marca: m }))
      } else {
        where.OR = [{ marca: marca.trim() }]
      }
    }

    // Si viene modelo, buscar el específico o el Genérico de esa marca
    // Pero primero necesitamos hacer la query y filtrar por modelo después
    const cronogramasRaw = await db.cronogramaService.findMany({
      where,
      orderBy: [{ marca: 'asc' }, { modelo: 'asc' }, { kilometraje: 'asc' }],
    })

    // Filtrar por modelo: si hay un modelo específico, usar ese;
    // si no, usar Genérico
    let cronogramas = cronogramasRaw
    if (modelo) {
      const modeloTrim = modelo.trim().toLowerCase()
      // Ver si hay algún cronograma con ese modelo exacto o parcial
      const matchEspecifico = cronogramasRaw.filter((c) => {
        const cModelo = c.modelo.toLowerCase()
        return (
          cModelo !== 'genérico' &&
          (cModelo.includes(modeloTrim) || modeloTrim.includes(cModelo))
        )
      })
      if (matchEspecifico.length > 0) {
        // Combinar: el modelo específico + el Genérico de la marca
        // (el Genérico tiene los km altos que el específico no tiene)
        const marcasEnEspecifico = Array.from(
          new Set(matchEspecifico.map((c) => c.marca)),
        )
        const genericosDeMarcas = cronogramasRaw.filter(
          (c) => c.modelo === 'Genérico' && marcasEnEspecifico.includes(c.marca),
        )
        // Combinar: específico + genérico (sin duplicar km)
        const kmEnEspecifico = new Set(matchEspecifico.map((c) => c.kilometraje))
        const genericosFaltantes = genericosDeMarcas.filter(
          (c) => !kmEnEspecifico.has(c.kilometraje),
        )
        cronogramas = [...matchEspecifico, ...genericosFaltantes].sort((a, b) => {
          if (a.kilometraje !== b.kilometraje) {
            return a.kilometraje - b.kilometraje
          }
          // Si mismo km, preferir el específico
          return a.modelo === 'Genérico' ? 1 : -1
        })
      } else {
        // Si no hay específico, usar Genérico de las marcas matcheadas
        cronogramas = cronogramasRaw.filter((c) => c.modelo === 'Genérico')
      }
    }

    // Si viene km, calcular qué service le tocaría
    let sugerido = null
    let proximo = null
    if (km) {
      const kmNum = Number(km)
      // Encontrar el service que correspondería para el km actual
      // (el último service que debería habérsele hecho)
      const pasados = cronogramas.filter((c) => c.kilometraje <= kmNum)
      sugerido = pasados.length > 0 ? pasados[pasados.length - 1] : null

      // Encontrar el próximo service (el siguiente que le tocará)
      const futuros = cronogramas.filter((c) => c.kilometraje > kmNum)
      proximo = futuros.length > 0 ? futuros[0] : null
    }

    return NextResponse.json({
      cronogramas,
      sugerido,
      proximo,
      total: cronogramas.length,
    })
  } catch (error) {
    console.error('Error al obtener cronogramas:', error)
    return NextResponse.json(
      { error: 'Error al obtener cronogramas' },
      { status: 500 },
    )
  }
}

// POST: crear nuevo cronograma (solo admin)
export async function POST(req: NextRequest) {
  if (!verificarPin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { marca, modelo, kilometraje, items, notas } = body

    if (!marca || !modelo || !kilometraje || !items) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 },
      )
    }

    const cronograma = await db.cronogramaService.create({
      data: {
        marca: marca.trim(),
        modelo: modelo.trim() || 'Genérico',
        kilometraje: Number(kilometraje),
        items: items.trim(),
        notas: notas || null,
      },
    })

    return NextResponse.json({ cronograma }, { status: 201 })
  } catch (error) {
    console.error('Error al crear cronograma:', error)
    return NextResponse.json(
      { error: 'No se pudo crear el cronograma' },
      { status: 500 },
    )
  }
}

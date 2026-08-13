import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const marca = searchParams.get('marca')
    const modelo = searchParams.get('modelo')
    const km = searchParams.get('km')

    const where: { activo: boolean; OR?: Array<Record<string, unknown>> } = { activo: true }

    if (marca) {
      const marcaTrim = marca.trim().toLowerCase()
      const todasMarcas = await db.cronogramaService.findMany({ where: { activo: true }, select: { marca: true }, distinct: ['marca'] })
      const marcasMatch = todasMarcas.filter((m) => {
        const mLow = m.marca.toLowerCase()
        return mLow.includes(marcaTrim) || marcaTrim.includes(mLow) ||
          mLow.replace(/[^a-z0-9]/g, '').includes(marcaTrim.replace(/[^a-z0-9]/g, '')) ||
          marcaTrim.replace(/[^a-z0-9]/g, '').includes(mLow.replace(/[^a-z0-9]/g, ''))
      }).map((m) => m.marca)
      where.OR = marcasMatch.length > 0 ? marcasMatch.map((m) => ({ marca: m })) : [{ marca: marca.trim() }]
    }

    const cronogramasRaw = await db.cronogramaService.findMany({ where, orderBy: [{ marca: 'asc' }, { modelo: 'asc' }, { kilometraje: 'asc' }] })

    let cronogramas = cronogramasRaw
    if (modelo) {
      const modeloTrim = modelo.trim().toLowerCase()
      const matchEspecifico = cronogramasRaw.filter((c) => {
        const cModelo = c.modelo.toLowerCase()
        return cModelo !== 'genérico' && (cModelo.includes(modeloTrim) || modeloTrim.includes(cModelo))
      })
      if (matchEspecifico.length > 0) {
        const marcasEnEsp = Array.from(new Set(matchEspecifico.map((c) => c.marca)))
        const genericos = cronogramasRaw.filter((c) => c.modelo === 'Genérico' && marcasEnEsp.includes(c.marca))
        const kmEnEsp = new Set(matchEspecifico.map((c) => c.kilometraje))
        const genericosFalt = genericos.filter((c) => !kmEnEsp.has(c.kilometraje))
        cronogramas = [...matchEspecifico, ...genericosFalt].sort((a, b) => {
          if (a.kilometraje !== b.kilometraje) return a.kilometraje - b.kilometraje
          return a.modelo === 'Genérico' ? 1 : -1
        })
      } else {
        cronogramas = cronogramasRaw.filter((c) => c.modelo === 'Genérico')
      }
    }

    let sugerido = null
    let proximo = null
    if (km) {
      const kmNum = Number(km)
      const pasados = cronogramas.filter((c) => c.kilometraje <= kmNum)
      sugerido = pasados.length > 0 ? pasados[pasados.length - 1] : null
      const futuros = cronogramas.filter((c) => c.kilometraje > kmNum)
      proximo = futuros.length > 0 ? futuros[0] : null
    }

    return NextResponse.json({ cronogramas, sugerido, proximo, total: cronogramas.length })
  } catch (error) {
    console.error('Error cronogramas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

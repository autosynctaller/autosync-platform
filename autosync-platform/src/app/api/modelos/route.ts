import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/modelos?marca=Renault
// Devuelve todas las marcas, o los modelos de una marca específica
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const marca = searchParams.get('marca')

    if (marca) {
      // Devolver modelos de esa marca
      const cronogramas = await db.cronogramaService.findMany({
        where: {
          activo: true,
          marca: { contains: marca, mode: 'insensitive' },
        },
        select: { modelo: true },
        distinct: ['modelo'],
        orderBy: { modelo: 'asc' },
      })
      const modelos = cronogramas.map(c => c.modelo).filter(m => m !== 'Genérico')
      return NextResponse.json({ modelos })
    }

    // Devolver todas las marcas
    const marcas = await db.cronogramaService.findMany({
      where: { activo: true },
      select: { marca: true },
      distinct: ['marca'],
      orderBy: { marca: 'asc' },
    })
    return NextResponse.json({ marcas: marcas.map(m => m.marca) })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ marcas: [], modelos: [] })
  }
}

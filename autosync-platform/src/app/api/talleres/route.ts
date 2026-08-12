import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/talleres - directorio público de talleres activos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ciudad = searchParams.get('ciudad')
    const q = searchParams.get('q')
    const slug = searchParams.get('slug')

    const where: Record<string, unknown> = {
      estado: 'ACTIVO',
    }

    if (slug) {
      where.slug = slug
    }

    if (ciudad) {
      where.ciudad = { contains: ciudad }
    }

    if (q) {
      where.OR = [
        { nombre: { contains: q } },
        { descripcion: { contains: q } },
        { ciudad: { contains: q } },
      ]
    }

    const talleres = await db.taller.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        slug: true,
        descripcion: true,
        logo: true,
        telefono: true,
        whatsapp: true,
        ciudad: true,
        provincia: true,
        plan: true,
        verificado: true,
        creadoEn: true,
        _count: {
          select: { trabajos: true },
        },
      },
      orderBy: [
        { plan: 'desc' }, // PREMIUM primero
        { verificado: 'desc' },
        { nombre: 'asc' },
      ],
      take: 50,
    })

    return NextResponse.json({ talleres })
  } catch (error) {
    console.error('Error al listar talleres:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

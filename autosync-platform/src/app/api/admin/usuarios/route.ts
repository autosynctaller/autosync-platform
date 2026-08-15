import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    const where = q ? { OR: [{ email: { contains: q } }, { nombre: { contains: q } }] } : {}

    const usuarios = await db.user.findMany({
      where,
      select: {
        id: true, email: true, nombre: true, rol: true, telefono: true, creadoEn: true,
        taller: { select: { id: true, nombre: true, plan: true, estado: true } },
        _count: { select: { vehiculos: true } },
      },
      orderBy: { creadoEn: 'desc' },
      take: 200,
    })

    return NextResponse.json({ usuarios, total: usuarios.length })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ usuarios: [], total: 0 })
  }
}

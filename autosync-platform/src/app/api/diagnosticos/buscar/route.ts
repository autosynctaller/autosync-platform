import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''
    if (q.length < 2) return NextResponse.json({ error: 'Mínimo 2 caracteres' }, { status: 400 })

    const diagnosticos = await db.diagnostico.findMany({
      where: { tallerId: user.taller.id, OR: [
        { titulo: { contains: q } }, { sintoma: { contains: q } },
        { diagnostico: { contains: q } }, { solucion: { contains: q } },
      ] },
      include: { vehiculo: { select: { marca: true, modelo: true, patente: true } } },
      orderBy: { fecha: 'desc' }, take: 50,
    })

    return NextResponse.json({ resultados: diagnosticos, total: diagnosticos.length })
  } catch { return NextResponse.json({ resultados: [] }) }
}

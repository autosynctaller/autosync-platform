import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const [talleres, vehiculos, usuarios, anuncios, trabajos] = await Promise.all([
      db.taller.count(),
      db.vehiculo.count(),
      db.user.count(),
      db.anuncio.count(),
      db.trabajo.count(),
    ])

    const talleresPorPlan = await db.taller.groupBy({ by: ['plan'], _count: true })
    const vehiculosVerificados = await db.vehiculo.count({ where: { verificado: true } })
    const anunciosActivos = await db.anuncio.count({ where: { estado: 'ACTIVO' } })

    return NextResponse.json({
      totales: { talleres, vehiculos, usuarios, anuncios, trabajos },
      talleresPorPlan,
      vehiculosVerificados,
      anunciosActivos,
    })
  } catch (error) {
    console.error('Error stats:', error)
    return NextResponse.json({ totales: { talleres: 0, vehiculos: 0, usuarios: 0, anuncios: 0, trabajos: 0 } })
  }
}

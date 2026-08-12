import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const tallerId = user.taller.id
    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

    const [vehiculos, trabajos, trabajosMes] = await Promise.all([
      db.vehiculoTaller.count({ where: { tallerId } }),
      db.trabajo.count({ where: { tallerId } }),
      db.trabajo.count({ where: { tallerId, fecha: { gte: inicioMes } } }),
    ])

    return NextResponse.json({ totales: { vehiculos, trabajos, trabajosMes } })
  } catch { return NextResponse.json({ totales: { vehiculos: 0, trabajos: 0, trabajosMes: 0 } }) }
}

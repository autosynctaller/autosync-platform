import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/vehiculos - listar vehículos
// - Taller: vehículos en los que trabajó
// - Dueño: vehículos que reclamó
// - Super admin: todos
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Debés iniciar sesión' }, { status: 401 })
    }

    let vehiculos

    if (user.rol === 'DUENO') {
      // Vehículos que reclamó
      vehiculos = await db.vehiculo.findMany({
        where: { ownerId: user.id },
        include: {
          _count: { select: { trabajos: true } },
        },
        orderBy: { actualizadoEn: 'desc' },
      })
    } else if (user.rol === 'TALLER' && user.taller) {
      // Vehículos en los que trabajó este taller
      vehiculos = await db.vehiculoTaller.findMany({
        where: { tallerId: user.taller.id },
        include: {
          vehiculo: {
            include: {
              _count: { select: { trabajos: true } },
            },
          },
        },
        orderBy: { ultimo: 'desc' },
      })

      // Transformar para devolver vehículos directamente
      vehiculos = vehiculos.map((vt: { vehiculo: Record<string, unknown>; totalTrabajos: number; ultimo: Date }) => ({
        ...vt.vehiculo,
        totalTrabajosTaller: vt.totalTrabajos,
        ultimoTrabajo: vt.ultimo,
      }))
    } else if (user.rol === 'SUPER_ADMIN') {
      vehiculos = await db.vehiculo.findMany({
        include: {
          owner: { select: { nombre: true, email: true } },
          _count: { select: { trabajos: true } },
        },
        orderBy: { creadoEn: 'desc' },
        take: 100,
      })
    }

    return NextResponse.json({ vehiculos })
  } catch (error) {
    console.error('Error al listar vehículos:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

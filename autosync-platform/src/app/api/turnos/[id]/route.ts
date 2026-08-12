import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PATCH /api/turnos/[id] - confirmar/rechazar/cancelar/completar turno
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { estado, notaTaller } = body

    const turno = await db.turno.findUnique({ where: { id } })
    if (!turno || turno.tallerId !== user.taller.id) {
      return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })
    }

    const actualizado = await db.turno.update({
      where: { id },
      data: {
        estado: estado || turno.estado,
        notaTaller: notaTaller || null,
        respondidoEn: new Date(),
      },
    })

    return NextResponse.json({ turno: actualizado })
  } catch (error) {
    console.error('Error al actualizar turno:', error)
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }
}

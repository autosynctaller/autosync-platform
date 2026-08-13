import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PATCH /api/vehiculos/[id]/nota - el dueño actualiza su nota rápida
// Esto notifica a todos los talleres que trabajaron en el vehículo
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id: vehiculoId } = await params
    const body = await req.json()
    const { notas } = body

    const vehiculo = await db.vehiculo.findUnique({ where: { id: vehiculoId } })
    if (!vehiculo) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    // Solo el dueño o el taller que trabajó en el vehículo pueden actualizar
    const esDueno = vehiculo.ownerId === user.id
    if (!esDueno) {
      return NextResponse.json({ error: 'Solo el dueño puede actualizar las notas' }, { status: 403 })
    }

    // Actualizar notas
    await db.vehiculo.update({ where: { id: vehiculoId }, data: { notas: notas || null } })

    // Crear/actualizar registro de notificación de nota
    const existente = await db.notificacionNota.findFirst({ where: { vehiculoId } })
    if (existente) {
      await db.notificacionNota.update({ where: { id: existente.id }, data: { nota: notas || '', actualizadoEn: new Date() } })
    } else {
      await db.notificacionNota.create({ data: { vehiculoId, nota: notas || '', actualizadoEn: new Date() } })
    }

    // Notificar a todos los talleres que trabajaron en este vehículo
    const talleres = await db.vehiculoTaller.findMany({
      where: { vehiculoId },
      include: { taller: { select: { userId: true, nombre: true } } },
    })

    for (const vt of talleres) {
      await db.notificacion.create({
        data: {
          userId: vt.taller.userId,
          tipo: 'NOTA_CLIENTE' as never,
          titulo: `Nota nueva en ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.patente})`,
          mensaje: notas ? `💬 "${notas.slice(0, 100)}"` : 'El dueño borró las notas',
          data: { vehiculoId },
        },
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error nota:', error)
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PATCH /api/presupuestos/[id] - actualizar estado (enviar, aprobar, rechazar)
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
    const { estado } = body

    const presupuesto = await db.presupuesto.findUnique({ where: { id } })
    if (!presupuesto || presupuesto.tallerId !== user.taller.id) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    const actualizado = await db.presupuesto.update({
      where: { id },
      data: { estado: estado || presupuesto.estado },
    })

    return NextResponse.json({ presupuesto: actualizado })
  } catch (error) {
    console.error('Error actualizar presupuesto:', error)
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }
}

// DELETE /api/presupuestos/[id] - eliminar
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const presupuesto = await db.presupuesto.findUnique({ where: { id } })
    if (!presupuesto || presupuesto.tallerId !== user.taller.id) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    await db.presupuesto.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 })
  }
}

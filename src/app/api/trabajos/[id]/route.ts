import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ADMIN_PIN = process.env.ADMIN_PIN || '1989'

function verificarPin(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-pin')
  return auth === ADMIN_PIN
}

// PATCH: actualizar un trabajo (solo admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verificarPin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()

    const trabajoExistente = await db.trabajo.findUnique({ where: { id } })
    if (!trabajoExistente) {
      return NextResponse.json(
        { error: 'Trabajo no encontrado' },
        { status: 404 },
      )
    }

    const datos: Record<string, unknown> = {}
    if (body.titulo !== undefined) datos.titulo = body.titulo
    if (body.descripcion !== undefined) datos.descripcion = body.descripcion
    if (body.precio !== undefined) datos.precio = Number(body.precio)
    if (body.estado !== undefined) datos.estado = body.estado
    if (body.proximo !== undefined) datos.proximo = body.proximo || null
    if (body.kilometraje !== undefined) {
      datos.kilometraje = body.kilometraje ? Number(body.kilometraje) : null
    }
    if (body.fecha !== undefined) {
      const parsed = new Date(body.fecha)
      if (!isNaN(parsed.getTime())) {
        datos.fecha = parsed
      }
    }

    if (Object.keys(datos).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 },
      )
    }

    const trabajo = await db.trabajo.update({
      where: { id },
      data: datos,
      include: { servicio: true },
    })

    return NextResponse.json({ trabajo })
  } catch (error) {
    console.error('Error al actualizar trabajo:', error)
    return NextResponse.json(
      { error: 'No se pudo actualizar el trabajo' },
      { status: 500 },
    )
  }
}

// DELETE: eliminar un trabajo (solo admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verificarPin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params

    const trabajo = await db.trabajo.findUnique({ where: { id } })
    if (!trabajo) {
      return NextResponse.json(
        { error: 'Trabajo no encontrado' },
        { status: 404 },
      )
    }

    await db.trabajo.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error al borrar trabajo:', error)
    return NextResponse.json(
      { error: 'No se pudo borrar el trabajo' },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ADMIN_PIN = process.env.ADMIN_PIN || '1989'

function verificarPin(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-pin')
  return auth === ADMIN_PIN
}

// POST: crear un trabajo asociado a un vehículo (solo admin)
export async function POST(req: NextRequest) {
  if (!verificarPin(req)) {
    return NextResponse.json(
      { error: 'No autorizado. PIN inválido.' },
      { status: 401 },
    )
  }

  try {
    const body = await req.json()
    const {
      vehiculoId,
      servicioId,
      titulo,
      descripcion,
      precio,
      estado,
      proximo,
      fecha,
      kilometraje,
    } = body

    if (!vehiculoId || !titulo || !descripcion || precio == null) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios del trabajo' },
        { status: 400 },
      )
    }

    const vehiculo = await db.vehiculo.findUnique({
      where: { id: vehiculoId },
    })
    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo inexistente' },
        { status: 404 },
      )
    }

    // Construir el objeto de fecha: si viene, usarla; si no, ahora
    let fechaTrabajo: Date = new Date()
    if (fecha) {
      const parsed = new Date(fecha)
      if (!isNaN(parsed.getTime())) {
        fechaTrabajo = parsed
      }
    }

    const trabajo = await db.trabajo.create({
      data: {
        vehiculoId,
        servicioId: servicioId || null,
        titulo,
        descripcion,
        precio: Number(precio),
        estado: estado || 'Completado',
        proximo: proximo || null,
        fecha: fechaTrabajo,
        kilometraje: kilometraje ? Number(kilometraje) : null,
      },
      include: { servicio: true },
    })

    // Si el trabajo tiene kilometraje, actualizar el kilometraje actual del vehículo
    if (kilometraje) {
      const km = Number(kilometraje)
      const vehiculoActualizado = await db.vehiculo.findUnique({
        where: { id: vehiculoId },
      })
      if (vehiculoActualizado && (vehiculoActualizado.kilometraje == null || km > vehiculoActualizado.kilometraje)) {
        await db.vehiculo.update({
          where: { id: vehiculoId },
          data: { kilometraje: km },
        })
      }
    }

    return NextResponse.json({ trabajo }, { status: 201 })
  } catch (error) {
    console.error('Error al crear trabajo:', error)
    return NextResponse.json(
      { error: 'No se pudo registrar el trabajo' },
      { status: 500 },
    )
  }
}

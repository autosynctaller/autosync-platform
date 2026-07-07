import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: detalle de un vehículo con sus trabajos
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const vehiculo = await db.vehiculo.findUnique({
      where: { id },
      include: {
        cliente: true,
        trabajos: {
          orderBy: { fecha: 'desc' },
          include: { servicio: true },
        },
      },
    })

    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 },
      )
    }

    return NextResponse.json({ vehiculo })
  } catch (error) {
    console.error('Error al obtener vehículo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

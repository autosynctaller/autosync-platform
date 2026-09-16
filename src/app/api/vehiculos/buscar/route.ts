import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/vehiculos/buscar?patente=ABC123
// Búsqueda pública: dice si el vehículo tiene historial, sin mostrar detalles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const patente = searchParams.get('patente')?.toUpperCase().trim().replace(/[^A-Z0-9]/g, '')

    if (!patente || patente.length < 6) {
      return NextResponse.json({ error: 'Patente inválida' }, { status: 400 })
    }

    const vehiculo = await db.vehiculo.findUnique({
      where: { patente },
      select: {
        id: true,
        marca: true,
        modelo: true,
        anio: true,
        verificado: true,
        _count: {
          select: {
            trabajos: true,
            diagnosticos: true,
          },
        },
      },
    })

    if (!vehiculo) {
      return NextResponse.json({
        encontrado: false,
        mensaje: 'Este vehículo no tiene historial digital en AutoSync',
      })
    }

    // Datos públicos básicos
    const user = await getCurrentUser()
    const esDueno = user?.id === (await db.vehiculo.findUnique({ where: { patente }, select: { ownerId: true } }))?.ownerId

    return NextResponse.json({
      encontrado: true,
      vehiculo: {
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio,
        verificado: vehiculo.verificado,
        totalTrabajos: vehiculo._count.trabajos,
        totalDiagnosticos: vehiculo._count.diagnosticos,
        tieneHistorial: vehiculo._count.trabajos > 0,
      },
      mensaje: vehiculo._count.trabajos > 0
        ? `Este vehículo tiene ${vehiculo._count.trabajos} trabajo(s) registrado(s) en su historial digital`
        : 'Este vehículo está registrado pero aún sin trabajos cargados',
      // Si es el dueño, puede ver el detalle completo
      puedeVerDetalle: esDueno,
    })
  } catch (error) {
    console.error('Error al buscar vehículo:', error)
    return NextResponse.json({ error: 'Error al buscar' }, { status: 500 })
  }
}

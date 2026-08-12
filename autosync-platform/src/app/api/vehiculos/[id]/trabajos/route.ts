import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST /api/vehiculos/[id]/trabajos
// Un taller carga un trabajo al vehículo
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'Solo los talleres pueden cargar trabajos' }, { status: 403 })
    }

    const { id: vehiculoId } = await params
    const tallerId = user.taller.id

    const vehiculo = await db.vehiculo.findUnique({ where: { id: vehiculoId } })
    if (!vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    const body = await req.json()
    const {
      servicioId,
      titulo,
      descripcion,
      precio,
      estado,
      fecha,
      kilometraje,
      proximaRevision,
      recordatorio,
      notasInternas,
    } = body

    if (!titulo || !descripcion || precio == null) {
      return NextResponse.json({ error: 'Título, descripción y precio son obligatorios' }, { status: 400 })
    }

    // Crear el trabajo
    const trabajo = await db.trabajo.create({
      data: {
        vehiculoId,
        tallerId,
        servicioId: servicioId || null,
        titulo,
        descripcion,
        precio: Number(precio),
        estado: estado || 'COMPLETADO',
        fecha: fecha ? new Date(fecha) : new Date(),
        kilometraje: kilometraje ? Number(kilometraje) : null,
        proximaRevision: proximaRevision || null,
        recordatorio: recordatorio ? new Date(recordatorio) : null,
        notasInternas: notasInternas || null,
      },
      include: { fotos: true },
    })

    // Actualizar km del vehículo si el trabajo tiene km mayor
    if (kilometraje) {
      const km = Number(kilometraje)
      if (!vehiculo.kilometraje || km > vehiculo.kilometraje) {
        await db.vehiculo.update({
          where: { id: vehiculoId },
          data: { kilometraje: km },
        })
      }
    }

    // Actualizar o crear relación VehiculoTaller
    const existente = await db.vehiculoTaller.findUnique({
      where: { vehiculoId_tallerId: { vehiculoId, tallerId } },
    })

    if (existente) {
      await db.vehiculoTaller.update({
        where: { id: existente.id },
        data: {
          ultimo: new Date(),
          totalTrabajos: { increment: 1 },
        },
      })
    } else {
      await db.vehiculoTaller.create({
        data: { vehiculoId, tallerId, totalTrabajos: 1 },
      })
    }

    // Notificar al dueño si el vehículo tiene dueño
    if (vehiculo.ownerId) {
      await db.notificacion.create({
        data: {
          userId: vehiculo.ownerId,
          tipo: 'TRABAJO_CARGADO',
          titulo: `Nuevo trabajo en tu ${vehiculo.marca} ${vehiculo.modelo}`,
          mensaje: `${user.taller.nombre} cargó: ${titulo}`,
          data: { vehiculoId, trabajoId: trabajo.id, tallerId },
        },
      })
    }

    return NextResponse.json({ trabajo }, { status: 201 })
  } catch (error) {
    console.error('Error al crear trabajo:', error)
    return NextResponse.json({ error: 'No se pudo cargar el trabajo' }, { status: 500 })
  }
}

// GET /api/vehiculos/[id]/trabajos
// Lista los trabajos (con reglas de visibilidad)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Debés iniciar sesión' }, { status: 401 })
    }

    const { id: vehiculoId } = await params
    const vehiculo = await db.vehiculo.findUnique({ where: { id: vehiculoId } })

    if (!vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    const esDueno = vehiculo.ownerId === user.id
    const esSuperAdmin = user.rol === 'SUPER_ADMIN'

    let where: Record<string, unknown> = { vehiculoId }

    // Si es taller, solo ver sus trabajos (salvo que tenga acceso aprobado)
    if (user.rol === 'TALLER' && !esDueno && !esSuperAdmin) {
      const acceso = await db.accesoTallerVehiculo.findUnique({
        where: {
          tallerId_vehiculoId: {
            tallerId: user.taller!.id,
            vehiculoId,
          },
        },
      })

      if (!acceso || acceso.estado !== 'APROBADO' || !acceso.puedeVerTrabajosDeOtros) {
        where = { vehiculoId, tallerId: user.taller!.id }
      }
    }

    const trabajos = await db.trabajo.findMany({
      where,
      include: {
        taller: { select: { id: true, nombre: true, slug: true } },
        servicio: { select: { nombre: true, categoria: true } },
        fotos: esDueno || esSuperAdmin ? true : { where: { tallerId: user.taller?.id } },
      },
      orderBy: { fecha: 'desc' },
    })

    return NextResponse.json({ trabajos })
  } catch (error) {
    console.error('Error al obtener trabajos:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

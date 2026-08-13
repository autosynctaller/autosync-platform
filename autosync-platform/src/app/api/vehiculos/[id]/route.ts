import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/vehiculos/[id] - obtener detalle del vehículo
// Reglas de visibilidad:
// - Dueño: ve TODO (todos los trabajos de todos los talleres)
// - Taller: ve solo SUS trabajos + datos básicos del vehículo
// - Sin login: no puede ver detalle
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Debés iniciar sesión' }, { status: 401 })
    }

    const { id } = await params
    const vehiculo = await db.vehiculo.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, nombre: true, telefono: true },
        },
        talleres: {
          include: { taller: { select: { id: true, nombre: true, slug: true } } },
        },
      },
    })

    if (!vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    const esDueno = vehiculo.ownerId === user.id
    const esSuperAdmin = user.rol === 'SUPER_ADMIN'

    // Si es dueño o super admin, ver todos los trabajos
    if (esDueno || esSuperAdmin) {
      const trabajos = await db.trabajo.findMany({
        where: { vehiculoId: id },
        include: {
          taller: { select: { id: true, nombre: true, slug: true } },
          servicio: { select: { nombre: true, categoria: true } },
          fotos: true,
        },
        orderBy: { fecha: 'desc' },
      })

      const diagnosticos = await db.diagnostico.findMany({
        where: { vehiculoId: id },
        include: { taller: { select: { id: true, nombre: true } } },
        orderBy: { fecha: 'desc' },
      })

      const documentos = await db.documentoVehiculo.findMany({
        where: { vehiculoId: id },
        orderBy: { creadoEn: 'desc' },
      })

      return NextResponse.json({
        vehiculo: {
          ...vehiculo,
          trabajos,
          diagnosticos,
          documentos,
          permisos: { verTodo: true },
        },
      })
    }

    // Si es taller, ver solo sus trabajos
    if (user.rol === 'TALLER' && user.taller) {
      const tallerId = user.taller.id

      // Verificar si tiene acceso especial (aprobado por el dueño)
      const acceso = await db.accesoTallerVehiculo.findUnique({
        where: { tallerId_vehiculoId: { tallerId, vehiculoId: id } },
      })

      const tieneAccesoCompleto = acceso?.estado === 'APROBADO' && acceso.puedeVerTrabajosDeOtros

      // Si tiene acceso completo, ver todos los trabajos
      const whereTrabajos = tieneAccesoCompleto
        ? { vehiculoId: id }
        : { vehiculoId: id, tallerId }

      const trabajos = await db.trabajo.findMany({
        where: whereTrabajos,
        include: {
          taller: { select: { id: true, nombre: true, slug: true } },
          servicio: { select: { nombre: true, categoria: true } },
          fotos: tieneAccesoCompleto ? true : { where: { tallerId } },
        },
        orderBy: { fecha: 'desc' },
      })

      // Buscar si hay una nota del dueño (con timestamp)
      const notaNotif = await db.notificacionNota.findFirst({ where: { vehiculoId: id } })

      return NextResponse.json({
        vehiculo: {
          id: vehiculo.id,
          patente: vehiculo.patente,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          anio: vehiculo.anio,
          color: vehiculo.color,
          kilometraje: vehiculo.kilometraje,
          tipo: vehiculo.tipo,
          combustible: vehiculo.combustible,
          vtvVencimiento: vehiculo.vtvVencimiento,
          gncVencimiento: vehiculo.gncVencimiento,
          verificado: vehiculo.verificado,
          notas: vehiculo.notas,
          notaActualizadaEn: notaNotif?.actualizadoEn || null,
          trabajos,
          permisos: {
            verTodo: tieneAccesoCompleto,
            puedeCargarTrabajos: true,
          },
        },
      })
    }

    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  } catch (error) {
    console.error('Error al obtener vehículo:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PATCH /api/vehiculos/[id] - actualizar datos (solo dueño o super admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Debés iniciar sesión' }, { status: 401 })
    }

    const { id } = await params
    const vehiculo = await db.vehiculo.findUnique({ where: { id } })

    if (!vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    const esDueno = vehiculo.ownerId === user.id
    const esSuperAdmin = user.rol === 'SUPER_ADMIN'

    if (!esDueno && !esSuperAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const datosPermitidos: Record<string, unknown> = {}

    // Campos que el dueño puede editar
    const campos = ['color', 'kilometraje', 'vin', 'numeroMotor', 'tipo', 'combustible', 'notas', 'vtvVencimiento', 'gncVencimiento']
    for (const campo of campos) {
      if (body[campo] !== undefined) {
        if (campo === 'kilometraje') {
          const kmNuevo = Number(body[campo])
          // El dueño solo puede AUMENTAR el km
          if (vehiculo.kilometraje && kmNuevo < vehiculo.kilometraje) {
            return NextResponse.json(
              { error: `No podés reducir el kilometraje. Actual: ${vehiculo.kilometraje.toLocaleString('es-AR')} km` },
              { status: 400 },
            )
          }
          datosPermitidos[campo] = kmNuevo
        } else if (campo === 'vtvVencimiento' || campo === 'gncVencimiento') {
          datosPermitidos[campo] = body[campo] ? new Date(body[campo]) : null
        } else {
          datosPermitidos[campo] = body[campo] || null
        }
      }
    }

    // Si el dueño actualiza notas, marcar timestamp
    if (body.notas !== undefined) {
      // Trigger para notificar al taller (se puede implementar después)
    }

    const actualizado = await db.vehiculo.update({
      where: { id },
      data: datosPermitidos,
    })

    return NextResponse.json({ vehiculo: actualizado })
  } catch (error) {
    console.error('Error al actualizar vehículo:', error)
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }
}

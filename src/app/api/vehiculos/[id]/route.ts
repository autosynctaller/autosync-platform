import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ADMIN_PIN = process.env.ADMIN_PIN || '1989'

function verificarPin(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-pin')
  return auth === ADMIN_PIN
}

// GET: detalle de un vehículo con sus trabajos y fotos
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
        fotos: {
          orderBy: { createdAt: 'desc' },
        },
        documentos: {
          orderBy: { createdAt: 'desc' },
        },
        diagnosticos: {
          orderBy: { fecha: 'desc' },
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

// PATCH: actualizar vehículo
// - Admin (con header x-admin-pin): puede editar todos los campos
// - Cliente (con body cliente=true): solo puede editar color, kilometraje, notas
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const esAdmin = verificarPin(req)
    const esCliente = body.cliente === true

    if (!esAdmin && !esCliente) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 },
      )
    }

    const vehiculo = await db.vehiculo.findUnique({ where: { id } })
    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 },
      )
    }

    // Campos que el cliente puede editar (limitados)
    const datosCliente: Record<string, unknown> = {}
    if (esCliente && !esAdmin) {
      if (body.color !== undefined) datosCliente.color = body.color || null
      if (body.kilometraje !== undefined) {
        const kmNuevo = body.kilometraje ? Number(body.kilometraje) : null
        // Validación: el cliente solo puede AUMENTAR el kilometraje, nunca reducirlo
        // (para evitar inconsistencias en garantías y registros)
        if (kmNuevo !== null && vehiculo.kilometraje !== null && kmNuevo < vehiculo.kilometraje) {
          return NextResponse.json(
            {
              error: `No podés reducir el kilometraje. El actual es ${vehiculo.kilometraje.toLocaleString('es-AR')} km y solo podés aumentarlo.`,
            },
            { status: 400 },
          )
        }
        datosCliente.kilometraje = kmNuevo
      }
      if (body.notas !== undefined) {
        datosCliente.notas = body.notas || null
        // Marcar que el cliente actualizó sus notas (para avisar al taller)
        datosCliente.notasActualizadasEn = new Date()
      }
      if (body.vtvVencimiento !== undefined) {
        datosCliente.vtvVencimiento = body.vtvVencimiento
          ? new Date(body.vtvVencimiento)
          : null
      }
      if (body.gncVencimiento !== undefined) {
        datosCliente.gncVencimiento = body.gncVencimiento
          ? new Date(body.gncVencimiento)
          : null
      }

      if (Object.keys(datosCliente).length === 0) {
        return NextResponse.json(
          { error: 'No hay campos para actualizar' },
          { status: 400 },
        )
      }

      const actualizado = await db.vehiculo.update({
        where: { id },
        data: datosCliente,
      })
      return NextResponse.json({ vehiculo: actualizado })
    }

    // Admin puede editar todo
    const datosAdmin: Record<string, unknown> = {}
    const camposPermitidos = [
      'marca',
      'modelo',
      'anio',
      'color',
      'kilometraje',
      'tipo',
      'combustible',
      'notas',
      'notasInternas',
      'vtvVencimiento',
      'gncVencimiento',
    ]
    for (const campo of camposPermitidos) {
      if (body[campo] !== undefined) {
        if (campo === 'anio' || campo === 'kilometraje') {
          datosAdmin[campo] = body[campo] ? Number(body[campo]) : null
        } else if (campo === 'vtvVencimiento' || campo === 'gncVencimiento') {
          datosAdmin[campo] = body[campo] ? new Date(body[campo]) : null
        } else {
          datosAdmin[campo] = body[campo] || null
        }
      }
    }

    // Admin puede marcar las notas del cliente como ya revisadas
    if (body.marcarNotasRevisadas === true) {
      datosAdmin.notasActualizadasEn = null
    }

    // Datos del cliente (titular)
    const datosClienteUpdate: Record<string, unknown> = {}
    if (body.cliente_nombre !== undefined)
      datosClienteUpdate.nombre = body.cliente_nombre
    if (body.cliente_telefono !== undefined)
      datosClienteUpdate.telefono = body.cliente_telefono
    if (body.cliente_email !== undefined)
      datosClienteUpdate.email = body.cliente_email || null
    if (body.cliente_direccion !== undefined)
      datosClienteUpdate.direccion = body.cliente_direccion || null

    if (Object.keys(datosAdmin).length > 0) {
      await db.vehiculo.update({ where: { id }, data: datosAdmin })
    }
    if (Object.keys(datosClienteUpdate).length > 0 && vehiculo.clienteId) {
      await db.cliente.update({
        where: { id: vehiculo.clienteId },
        data: datosClienteUpdate,
      })
    }

    const actualizado = await db.vehiculo.findUnique({
      where: { id },
      include: { cliente: true },
    })
    return NextResponse.json({ vehiculo: actualizado })
  } catch (error) {
    console.error('Error al actualizar vehículo:', error)
    return NextResponse.json(
      { error: 'No se pudo actualizar el vehículo' },
      { status: 500 },
    )
  }
}

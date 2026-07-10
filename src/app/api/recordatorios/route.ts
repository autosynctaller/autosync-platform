import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ADMIN_PIN = process.env.ADMIN_PIN || '1989'

function verificarPin(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-pin')
  return auth === ADMIN_PIN
}

// GET: listar recordatorios pendientes (trabajos + VTV + GNC)
export async function GET(req: NextRequest) {
  if (!verificarPin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const hoy = new Date()

    // Buscar todos los trabajos con recordatorio configurado
    const trabajos = await db.trabajo.findMany({
      where: {
        recordatorio: { not: null },
      },
      include: {
        vehiculo: {
          include: { cliente: true },
        },
        servicio: true,
      },
      orderBy: { recordatorio: 'asc' },
    })

    type Recordatorio = {
      id: string
      tipo: 'trabajo' | 'vtv' | 'gnc'
      tituloTrabajo: string
      proximoTexto: string | null
      fechaTrabajo: string
      fechaRecordatorio: Date
      diasRestantes: number
      estado: 'vencido' | 'hoy' | 'proximo' | 'futuro'
      vehiculo: {
        id: string
        marca: string
        modelo: string
        patente: string
        kilometraje: number | null
      }
      cliente: {
        nombre: string
        telefono: string
        email: string | null
      }
    }

    const recordatorios: Recordatorio[] = trabajos.map((t) => {
      const fechaRecordatorio = t.recordatorio!
      const diasRestantes = Math.ceil(
        (fechaRecordatorio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      )

      let estado: 'vencido' | 'hoy' | 'proximo' | 'futuro'
      if (diasRestantes < 0) estado = 'vencido'
      else if (diasRestantes === 0) estado = 'hoy'
      else if (diasRestantes <= 30) estado = 'proximo'
      else estado = 'futuro'

      return {
        id: t.id,
        tipo: 'trabajo' as const,
        tituloTrabajo: t.titulo,
        proximoTexto: t.proximo,
        fechaTrabajo: t.fecha,
        fechaRecordatorio,
        diasRestantes,
        estado,
        vehiculo: {
          id: t.vehiculo.id,
          marca: t.vehiculo.marca,
          modelo: t.vehiculo.modelo,
          patente: t.vehiculo.patente,
          kilometraje: t.vehiculo.kilometraje,
        },
        cliente: {
          nombre: t.vehiculo.cliente.nombre,
          telefono: t.vehiculo.cliente.telefono,
          email: t.vehiculo.cliente.email,
        },
      }
    })

    // Buscar vehículos con VTV por vencer o vencida
    const vehiculosConVtv = await db.vehiculo.findMany({
      where: { vtvVencimiento: { not: null } },
      include: { cliente: true },
    })

    vehiculosConVtv.forEach((v) => {
      const fecha = v.vtvVencimiento!
      const diasRestantes = Math.ceil(
        (fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      )
      // Solo incluir si vence en menos de 60 días o ya venció
      if (diasRestantes > 60) return

      let estado: 'vencido' | 'hoy' | 'proximo' | 'futuro'
      if (diasRestantes < 0) estado = 'vencido'
      else if (diasRestantes === 0) estado = 'hoy'
      else if (diasRestantes <= 30) estado = 'proximo'
      else estado = 'futuro'

      recordatorios.push({
        id: `vtv-${v.id}`,
        tipo: 'vtv',
        tituloTrabajo: 'Vencimiento de VTV',
        proximoTexto: 'Recordá realizar la Verificación Técnica Vehicular',
        fechaTrabajo: v.createdAt,
        fechaRecordatorio: fecha,
        diasRestantes,
        estado,
        vehiculo: {
          id: v.id,
          marca: v.marca,
          modelo: v.modelo,
          patente: v.patente,
          kilometraje: v.kilometraje,
        },
        cliente: {
          nombre: v.cliente.nombre,
          telefono: v.cliente.telefono,
          email: v.cliente.email,
        },
      })
    })

    // Buscar vehículos con GNC por vencer o vencido
    const vehiculosConGnc = await db.vehiculo.findMany({
      where: { gncVencimiento: { not: null } },
      include: { cliente: true },
    })

    vehiculosConGnc.forEach((v) => {
      const fecha = v.gncVencimiento!
      const diasRestantes = Math.ceil(
        (fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      )
      if (diasRestantes > 60) return

      let estado: 'vencido' | 'hoy' | 'proximo' | 'futuro'
      if (diasRestantes < 0) estado = 'vencido'
      else if (diasRestantes === 0) estado = 'hoy'
      else if (diasRestantes <= 30) estado = 'proximo'
      else estado = 'futuro'

      recordatorios.push({
        id: `gnc-${v.id}`,
        tipo: 'gnc',
        tituloTrabajo: 'Vencimiento de obleta GNC',
        proximoTexto: 'Recordá renovar la obleta de GNC',
        fechaTrabajo: v.createdAt,
        fechaRecordatorio: fecha,
        diasRestantes,
        estado,
        vehiculo: {
          id: v.id,
          marca: v.marca,
          modelo: v.modelo,
          patente: v.patente,
          kilometraje: v.kilometraje,
        },
        cliente: {
          nombre: v.cliente.nombre,
          telefono: v.cliente.telefono,
          email: v.cliente.email,
        },
      })
    })

    // Ordenar: vencidos primero, luego hoy, luego próximos, después futuros
    const ordenEstados = { vencido: 0, hoy: 1, proximo: 2, futuro: 3 }
    recordatorios.sort(
      (a, b) =>
        ordenEstados[a.estado] - ordenEstados[b.estado] ||
        a.diasRestantes - b.diasRestantes,
    )

    return NextResponse.json({ recordatorios, total: recordatorios.length })
  } catch (error) {
    console.error('Error al obtener recordatorios:', error)
    return NextResponse.json(
      { error: 'Error al obtener recordatorios' },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ADMIN_PIN = process.env.ADMIN_PIN || '1989'

function verificarPin(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-pin')
  return auth === ADMIN_PIN
}

// GET: listar recordatorios pendientes (no enviados aún o vencidos)
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

    // Formatear para el panel
    const recordatorios = trabajos.map((t) => {
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

    return NextResponse.json({ recordatorios, total: recordatorios.length })
  } catch (error) {
    console.error('Error al obtener recordatorios:', error)
    return NextResponse.json(
      { error: 'Error al obtener recordatorios' },
      { status: 500 },
    )
  }
}

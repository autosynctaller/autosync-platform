import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/turnos - listar turnos del taller
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const turnos = await db.turno.findMany({
      where: { tallerId: user.taller.id },
      orderBy: { fechaHora: 'asc' },
      take: 50,
    })

    return NextResponse.json({ turnos })
  } catch (error) {
    console.error('Error turnos:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/turnos - solicitar turno (público, no requiere login)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tallerId, nombreCliente, telefonoCliente, emailCliente, vehiculoPatente, vehiculoMarca, vehiculoModelo, fechaHora, motivo, descripcion } = body

    if (!tallerId || !nombreCliente || !telefonoCliente || !fechaHora || !motivo) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    // Verificar que el taller existe y ofrece turnos
    const taller = await db.taller.findUnique({ where: { id: tallerId } })
    if (!taller || taller.estado !== 'ACTIVO' || !taller.ofreceTurnos) {
      return NextResponse.json({ error: 'Este taller no ofrece turnos online' }, { status: 400 })
    }

    const turno = await db.turno.create({
      data: {
        tallerId,
        nombreCliente,
        telefonoCliente,
        emailCliente: emailCliente || null,
        vehiculoPatente: vehiculoPatente || null,
        vehiculoMarca: vehiculoMarca || null,
        vehiculoModelo: vehiculoModelo || null,
        fechaHora: new Date(fechaHora),
        motivo,
        descripcion: descripcion || null,
        estado: 'SOLICITADO',
      },
    })

    // Notificar al taller
    await db.notificacion.create({
      data: {
        userId: taller.userId,
        tipo: 'TURNO_SOLICITADO' as never,
        titulo: `Nuevo turno solicitado`,
        mensaje: `${nombreCliente} solicitó turno para ${motivo} el ${new Date(fechaHora).toLocaleString('es-AR')}`,
        data: { turnoId: turno.id },
      },
    }).catch(() => {})

    return NextResponse.json({ turno }, { status: 201 })
  } catch (error) {
    console.error('Error al crear turno:', error)
    return NextResponse.json({ error: 'No se pudo solicitar el turno' }, { status: 500 })
  }
}

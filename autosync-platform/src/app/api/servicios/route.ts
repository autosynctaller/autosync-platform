import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/servicios - listar servicios del taller actual
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const servicios = await db.servicio.findMany({
      where: { tallerId: user.taller.id, activo: true },
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({ servicios })
  } catch (error) {
    console.error('Error al listar servicios:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/servicios - crear servicio del taller
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { nombre, descripcion, categoria } = body

    if (!nombre) {
      return NextResponse.json({ error: 'Nombre es obligatorio' }, { status: 400 })
    }

    const servicio = await db.servicio.create({
      data: {
        tallerId: user.taller.id,
        nombre,
        descripcion: descripcion || null,
        categoria: categoria || null,
      },
    })

    return NextResponse.json({ servicio }, { status: 201 })
  } catch (error) {
    console.error('Error al crear servicio:', error)
    return NextResponse.json({ error: 'No se pudo crear' }, { status: 500 })
  }
}

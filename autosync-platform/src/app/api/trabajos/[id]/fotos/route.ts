import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST /api/trabajos/[id]/fotos - agregar foto a un trabajo
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: trabajoId } = await params
    const body = await req.json()
    const { url, descripcion, categoria, esPrivada } = body

    if (!url) {
      return NextResponse.json({ error: 'URL es obligatoria' }, { status: 400 })
    }

    const trabajo = await db.trabajo.findUnique({ where: { id: trabajoId } })
    if (!trabajo || trabajo.tallerId !== user.taller.id) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 })
    }

    const foto = await db.fotoTrabajo.create({
      data: {
        trabajoId,
        tallerId: user.taller.id,
        url,
        descripcion: descripcion || null,
        categoria: categoria || 'DETALLE',
        esPrivada: esPrivada || false,
      },
    })

    return NextResponse.json({ foto }, { status: 201 })
  } catch (error) {
    console.error('Error al agregar foto:', error)
    return NextResponse.json({ error: 'No se pudo agregar' }, { status: 500 })
  }
}

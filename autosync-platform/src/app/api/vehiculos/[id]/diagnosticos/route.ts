import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST /api/vehiculos/[id]/diagnosticos - crear diagnóstico
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: vehiculoId } = await params
    const body = await req.json()
    const { titulo, sintoma, pruebasRealizadas, resultadoPrueba, diagnostico, solucion, resultadoFinal, estado, kilometraje, fecha } = body

    if (!titulo || !sintoma) {
      return NextResponse.json({ error: 'Título y síntoma son obligatorios' }, { status: 400 })
    }

    const diag = await db.diagnostico.create({
      data: {
        vehiculoId,
        tallerId: user.taller.id,
        titulo,
        sintoma,
        pruebasRealizadas: pruebasRealizadas || null,
        resultadoPrueba: resultadoPrueba || null,
        diagnostico: diagnostico || null,
        solucion: solucion || null,
        resultadoFinal: resultadoFinal || null,
        estado: estado || 'EN_DIAGNOSTICO',
        kilometraje: kilometraje ? Number(kilometraje) : null,
        fecha: fecha ? new Date(fecha) : new Date(),
      },
    })

    return NextResponse.json({ diagnostico: diag }, { status: 201 })
  } catch (error) {
    console.error('Error al crear diagnóstico:', error)
    return NextResponse.json({ error: 'No se pudo crear' }, { status: 500 })
  }
}

// GET /api/vehiculos/[id]/diagnosticos - listar diagnósticos
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id: vehiculoId } = await params
    const vehiculo = await db.vehiculo.findUnique({ where: { id: vehiculoId } })
    if (!vehiculo) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const esDueno = vehiculo.ownerId === user.id
    const esSuperAdmin = user.rol === 'SUPER_ADMIN'

    let where: Record<string, unknown> = { vehiculoId }
    // Taller solo ve sus diagnósticos
    if (user.rol === 'TALLER' && !esDueno && !esSuperAdmin) {
      where = { vehiculoId, tallerId: user.taller!.id }
    }

    const diagnosticos = await db.diagnostico.findMany({
      where,
      include: { taller: { select: { nombre: true, slug: true } } },
      orderBy: { fecha: 'desc' },
    })

    return NextResponse.json({ diagnosticos })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

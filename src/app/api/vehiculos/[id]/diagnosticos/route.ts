import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ADMIN_PIN = process.env.ADMIN_PIN || '1989'

function verificarPin(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-pin')
  return auth === ADMIN_PIN
}

// GET: listar diagnósticos de un vehículo
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verificarPin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const vehiculo = await db.vehiculo.findUnique({ where: { id } })
    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 },
      )
    }

    const diagnosticos = await db.diagnostico.findMany({
      where: { vehiculoId: id },
      orderBy: { fecha: 'desc' },
    })

    return NextResponse.json({ diagnosticos })
  } catch (error) {
    console.error('Error al obtener diagnósticos:', error)
    return NextResponse.json(
      { error: 'Error al obtener diagnósticos' },
      { status: 500 },
    )
  }
}

// POST: crear nuevo diagnóstico
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verificarPin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()

    const {
      titulo,
      sintoma,
      pruebasRealizadas,
      resultadoPrueba,
      diagnostico,
      solucion,
      resultadoFinal,
      estado,
      kilometraje,
      fecha,
    } = body

    if (!titulo || !sintoma) {
      return NextResponse.json(
        { error: 'Título y síntoma son obligatorios' },
        { status: 400 },
      )
    }

    const vehiculo = await db.vehiculo.findUnique({ where: { id } })
    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 },
      )
    }

    let fechaDiag: Date = new Date()
    if (fecha) {
      const parsed = new Date(fecha)
      if (!isNaN(parsed.getTime())) fechaDiag = parsed
    }

    const nuevoDiag = await db.diagnostico.create({
      data: {
        vehiculoId: id,
        titulo,
        sintoma,
        pruebasRealizadas: pruebasRealizadas || null,
        resultadoPrueba: resultadoPrueba || null,
        diagnostico: diagnostico || null,
        solucion: solucion || null,
        resultadoFinal: resultadoFinal || null,
        estado: estado || 'En diagnóstico',
        kilometraje: kilometraje ? Number(kilometraje) : null,
        fecha: fechaDiag,
      },
    })

    return NextResponse.json({ diagnostico: nuevoDiag }, { status: 201 })
  } catch (error) {
    console.error('Error al crear diagnóstico:', error)
    return NextResponse.json(
      { error: 'No se pudo crear el diagnóstico' },
      { status: 500 },
    )
  }
}

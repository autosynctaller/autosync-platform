import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ADMIN_PIN = process.env.ADMIN_PIN || '1989'

function verificarPin(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-pin')
  return auth === ADMIN_PIN
}

// GET: buscar síntomas en todos los vehículos
// Query params:
//   q=texto_a_buscar   -> texto a buscar (en título, síntoma, diagnóstico, solución)
//   marca=Toyota       -> filtrar por marca (opcional)
//   estado=Resuelto    -> filtrar por estado (opcional)
export async function GET(req: NextRequest) {
  if (!verificarPin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''
    const marca = searchParams.get('marca')
    const estado = searchParams.get('estado')

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Ingresá al menos 2 caracteres para buscar' },
        { status: 400 },
      )
    }

    // Búsqueda case-insensitive en SQLite con LIKE
    const query = `%${q}%`

    const where: {
      OR: Array<Record<string, unknown>>
      vehiculo?: { marca?: string }
      estado?: string
    } = {
      OR: [
        { titulo: { contains: q } },
        { sintoma: { contains: q } },
        { pruebasRealizadas: { contains: q } },
        { resultadoPrueba: { contains: q } },
        { diagnostico: { contains: q } },
        { solucion: { contains: q } },
        { resultadoFinal: { contains: q } },
      ],
    }

    if (marca) {
      where.vehiculo = { marca }
    }
    if (estado) {
      where.estado = estado
    }

    const diagnosticos = await db.diagnostico.findMany({
      where,
      include: {
        vehiculo: {
          include: { cliente: true },
        },
      },
      orderBy: { fecha: 'desc' },
      take: 50, // máximo 50 resultados
    })

    // Marcar en qué campo se encontró el término (para mostrar en la UI)
    const resultados = diagnosticos.map((d) => {
      const qLower = q.toLowerCase()
      const camposEncontrados: string[] = []
      if (d.titulo.toLowerCase().includes(qLower)) camposEncontrados.push('título')
      if (d.sintoma.toLowerCase().includes(qLower)) camposEncontrados.push('síntoma')
      if (d.pruebasRealizadas?.toLowerCase().includes(qLower)) camposEncontrados.push('pruebas')
      if (d.resultadoPrueba?.toLowerCase().includes(qLower)) camposEncontrados.push('resultado')
      if (d.diagnostico?.toLowerCase().includes(qLower)) camposEncontrados.push('diagnóstico')
      if (d.solucion?.toLowerCase().includes(qLower)) camposEncontrados.push('solución')
      if (d.resultadoFinal?.toLowerCase().includes(qLower)) camposEncontrados.push('resultado final')

      return {
        id: d.id,
        titulo: d.titulo,
        sintoma: d.sintoma,
        diagnostico: d.diagnostico,
        solucion: d.solucion,
        resultadoFinal: d.resultadoFinal,
        estado: d.estado,
        fecha: d.fecha,
        kilometraje: d.kilometraje,
        vehiculo: {
          id: d.vehiculo.id,
          marca: d.vehiculo.marca,
          modelo: d.vehiculo.modelo,
          patente: d.vehiculo.patente,
          anio: d.vehiculo.anio,
        },
        cliente: {
          nombre: d.vehiculo.cliente.nombre,
        },
        camposEncontrados,
      }
    })

    return NextResponse.json({
      resultados,
      total: resultados.length,
      query: q,
    })
  } catch (error) {
    console.error('Error al buscar síntomas:', error)
    return NextResponse.json(
      { error: 'Error en la búsqueda' },
      { status: 500 },
    )
  }
}

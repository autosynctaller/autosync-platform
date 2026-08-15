import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/modelos/datos?marca=Renault&modelo=Duster
// Devuelve los datos técnicos (motor, aceite, distribución, etc.)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const marca = searchParams.get('marca')
    const modelo = searchParams.get('modelo')

    if (!marca || !modelo) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const cronograma = await db.cronogramaService.findFirst({
      where: {
        activo: true,
        marca: { contains: marca, mode: 'insensitive' },
        modelo: { contains: modelo, mode: 'insensitive' },
        notas: { contains: 'Datos técnicos' },
      },
      orderBy: { kilometraje: 'asc' },
    })

    if (!cronograma?.notas) {
      return NextResponse.json({ datos: null })
    }

    // Parsear los datos técnicos de las notas
    const notas = cronograma.notas
    const datos: Record<string, string> = {}
    
    const lineas = notas.split('\n')
    for (const linea of lineas) {
      if (linea.startsWith('Motor:')) datos.motor = linea.replace('Motor:', '').trim()
      if (linea.startsWith('Propulsión:')) datos.propulsion = linea.replace('Propulsión:', '').trim()
      if (linea.startsWith('Distribución:')) datos.distribucion = linea.replace('Distribución:', '').trim()
      if (linea.startsWith('Aceite:')) datos.aceite = linea.replace('Aceite:', '').trim()
      if (linea.startsWith('Filtros:')) datos.filtros = linea.replace('Filtros:', '').trim()
      if (linea.startsWith('Período:')) datos.periodo = linea.replace('Período:', '').trim()
      if (linea.startsWith('⚠️ Punto crítico:')) datos.puntoCritico = linea.replace('⚠️ Punto crítico:', '').trim()
    }

    return NextResponse.json({ datos })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ datos: null })
  }
}

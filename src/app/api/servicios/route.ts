import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const servicios = await db.servicio.findMany({
      where: { activo: true },
      orderBy: [{ destacado: 'desc' }, { nombre: 'asc' }],
    })
    return NextResponse.json({ servicios })
  } catch (error) {
    console.error('Error al obtener servicios:', error)
    return NextResponse.json(
      { error: 'No se pudieron obtener los servicios' },
      { status: 500 },
    )
  }
}

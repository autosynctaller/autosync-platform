import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const vehiculos = await db.vehiculo.findMany({ include: { owner: { select: { nombre: true, email: true } }, _count: { select: { trabajos: true } } }, orderBy: { creadoEn: 'desc' }, take: 200 })
    return NextResponse.json({ vehiculos })
  } catch { return NextResponse.json({ vehiculos: [] }) }
}

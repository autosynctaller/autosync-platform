import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    if (q.length < 2) return NextResponse.json({ usuarios: [] })
    const usuarios = await db.user.findMany({ where: { OR: [{ email: { contains: q } }, { nombre: { contains: q } }] }, select: { id: true, email: true, nombre: true, rol: true, creadoEn: true }, take: 20 })
    return NextResponse.json({ usuarios })
  } catch { return NextResponse.json({ usuarios: [] }) }
}

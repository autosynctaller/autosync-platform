import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  const taller = await db.taller.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, nombre: true, telefono: true, creadoEn: true } },
      _count: { select: { trabajos: true, servicios: true, turnos: true, productos: true } },
    },
  })
  if (!taller) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ taller })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const datos: Record<string, unknown> = {}
  for (const c of ['nombre', 'descripcion', 'telefono', 'whatsapp', 'email', 'direccion', 'ciudad', 'provincia', 'plan', 'estado', 'verificado', 'ofreceTurnos']) {
    if (body[c] !== undefined) datos[c] = body[c]
  }
  const taller = await db.taller.update({ where: { id }, data: datos })
  return NextResponse.json({ taller })
}

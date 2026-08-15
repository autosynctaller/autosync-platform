import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  const vehiculo = await db.vehiculo.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, nombre: true, email: true, telefono: true } },
      trabajos: { include: { taller: { select: { nombre: true } } }, orderBy: { fecha: 'desc' }, take: 20 },
      talleres: { include: { taller: { select: { id: true, nombre: true, slug: true } } } },
      _count: { select: { trabajos: true, diagnosticos: true, documentos: true } },
    },
  })
  if (!vehiculo) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ vehiculo })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  await db.vehiculo.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  const anuncio = await db.anuncio.findUnique({
    where: { id },
    include: { anunciante: true, _count: { select: { clicks_tracking: true } } },
  })
  if (!anuncio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ anuncio })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const datos: Record<string, unknown> = {}
  for (const c of ['titulo', 'descripcion', 'imagen', 'url', 'cta', 'tipo', 'estado', 'Prioridad', 'soloCiudad', 'soloMarca', 'inicio', 'fin']) {
    if (body[c] !== undefined) {
      if (c === 'inicio' || c === 'fin') datos[c] = body[c] ? new Date(body[c]) : null
      else datos[c] = body[c]
    }
  }
  const anuncio = await db.anuncio.update({ where: { id }, data: datos })
  return NextResponse.json({ anuncio })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  await db.anuncio.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

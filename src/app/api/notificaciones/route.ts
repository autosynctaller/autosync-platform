import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/notificaciones - listar notificaciones del usuario
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const notificaciones = await db.notificacion.findMany({
      where: { userId: user.id },
      orderBy: { creadoEn: 'desc' },
      take: 20,
    })

    const noLeidas = await db.notificacion.count({
      where: { userId: user.id, leida: false },
    })

    return NextResponse.json({ notificaciones, noLeidas })
  } catch (error) {
    console.error('Error notif:', error)
    return NextResponse.json({ notificaciones: [], noLeidas: 0 })
  }
}

// PATCH /api/notificaciones - marcar todas como leídas
export async function PATCH() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    await db.notificacion.updateMany({
      where: { userId: user.id, leida: false },
      data: { leida: true },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

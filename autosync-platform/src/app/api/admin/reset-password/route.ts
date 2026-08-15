import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hashPassword } from '@/lib/auth'
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const body = await req.json()
    const { email, nuevaPassword } = body
    if (!email || !nuevaPassword) return NextResponse.json({ error: 'Email y nueva contraseña son obligatorios' }, { status: 400 })
    const usuario = await db.user.findUnique({ where: { email } })
    if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    const hash = await hashPassword(nuevaPassword)
    await db.user.update({ where: { id: usuario.id }, data: { password: hash } })
    return NextResponse.json({ ok: true, mensaje: `Contraseña actualizada para ${email}` })
  } catch { return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 }) }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 })
    }

    // Buscar case-insensitive
    const user = await db.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      include: { taller: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
    }

    const token = createToken({ userId: user.id, email: user.email, rol: user.rol })
    await setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: user.id, email: user.email, nombre: user.nombre, rol: user.rol,
        taller: user.taller ? { id: user.taller.id, nombre: user.taller.nombre, slug: user.taller.slug, plan: user.taller.plan, estado: user.taller.estado } : null,
      },
    })
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json({ error: 'No se pudo iniciar sesión' }, { status: 500 })
  }
}

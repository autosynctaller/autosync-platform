import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// GET: obtener usuario actual (basado en cookie JWT)
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        telefono: user.telefono,
        taller: user.taller
          ? {
              id: user.taller.id,
              nombre: user.taller.nombre,
              slug: user.taller.slug,
              plan: user.taller.plan,
              estado: user.taller.estado,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

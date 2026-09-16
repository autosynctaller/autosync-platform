import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createToken, setAuthCookie, uniqueSlug } from '@/lib/auth'

// POST: registrar nuevo usuario (dueño o taller)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, nombre, telefono, rol, tallerData } = body

    // Validaciones básicas
    if (!email || !password || !nombre) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios (email, password, nombre)' },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 },
      )
    }

    // Verificar si el email ya existe
    const existente = await db.user.findUnique({ where: { email } })
    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 409 },
      )
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password)

    // Crear usuario
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        telefono: telefono || null,
        rol: rol || 'DUENO',
      },
    })

    // Si es taller, crear el perfil del taller
    if (rol === 'TALLER' && tallerData) {
      const slug = await uniqueSlug(tallerData.nombre || nombre)
      await db.taller.create({
        data: {
          userId: user.id,
          nombre: tallerData.nombre || nombre,
          slug,
          descripcion: tallerData.descripcion || null,
          telefono: tallerData.telefono || telefono || '',
          whatsapp: tallerData.whatsapp || null,
          email: tallerData.email || email,
          direccion: tallerData.direccion || null,
          ciudad: tallerData.ciudad || null,
          provincia: tallerData.provincia || null,
          estado: 'ACTIVO', // por ahora auto-aprobado
        },
      })
    }

    // Crear token JWT y setear cookie
    const token = createToken({
      userId: user.id,
      email: user.email,
      rol: user.rol,
    })
    await setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error al registrar:', error)
    return NextResponse.json(
      { error: 'No se pudo registrar el usuario' },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PIN = process.env.ADMIN_PIN || '1234'

// POST: verificar PIN de admin -> devuelve un token simple (mismo PIN para esta demo)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pin } = body

    if (!pin) {
      return NextResponse.json(
        { error: 'Debe ingresar un PIN' },
        { status: 400 },
      )
    }

    if (pin === ADMIN_PIN) {
      return NextResponse.json({ ok: true, token: ADMIN_PIN })
    }

    return NextResponse.json(
      { error: 'PIN incorrecto' },
      { status: 401 },
    )
  } catch (error) {
    console.error('Error en login admin:', error)
    return NextResponse.json(
      { error: 'Error al validar credenciales' },
      { status: 500 },
    )
  }
}

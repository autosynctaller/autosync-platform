import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PATCH /api/talleres/perfil - editar perfil del taller
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const datos: Record<string, unknown> = {}
    const campos = ['nombre', 'descripcion', 'telefono', 'whatsapp', 'email', 'direccion', 'ciudad', 'provincia', 'ofreceTurnos', 'horarioApertura', 'horarioCierre', 'diasLaborables', 'duracionTurnoMin']
    for (const c of campos) {
      if (body[c] !== undefined) datos[c] = body[c]
    }

    const taller = await db.taller.update({
      where: { id: user.taller.id },
      data: datos,
    })

    return NextResponse.json({ taller })
  } catch (error) {
    console.error('Error perfil:', error)
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }
}

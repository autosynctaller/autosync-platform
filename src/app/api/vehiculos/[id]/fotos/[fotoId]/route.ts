import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { unlink } from 'fs/promises'
import path from 'path'

const ADMIN_PIN = process.env.ADMIN_PIN || '1989'

function verificarPin(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-pin')
  return auth === ADMIN_PIN
}

// DELETE: eliminar una foto (solo admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fotoId: string }> },
) {
  if (!verificarPin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id, fotoId } = await params

    const foto = await db.fotoVehiculo.findFirst({
      where: { id: fotoId, vehiculoId: id },
    })

    if (!foto) {
      return NextResponse.json(
        { error: 'Foto no encontrada' },
        { status: 404 },
      )
    }

    // Borrar archivo del disco
    const ruta = path.join(process.cwd(), 'public', foto.url)
    try {
      await unlink(ruta)
    } catch (e) {
      // silencioso: el archivo puede no existir
      console.warn('No se pudo borrar el archivo:', ruta)
    }

    await db.fotoVehiculo.delete({ where: { id: fotoId } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error al borrar foto:', error)
    return NextResponse.json(
      { error: 'No se pudo borrar la foto' },
      { status: 500 },
    )
  }
}

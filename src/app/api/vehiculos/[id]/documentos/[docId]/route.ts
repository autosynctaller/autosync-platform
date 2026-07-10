import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { unlink } from 'fs/promises'
import path from 'path'

const ADMIN_PIN = process.env.ADMIN_PIN || '1989'

function verificarPin(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-pin')
  return auth === ADMIN_PIN
}

// DELETE: eliminar un documento (solo admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  if (!verificarPin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id, docId } = await params

    const doc = await db.documentoVehiculo.findFirst({
      where: { id: docId, vehiculoId: id },
    })

    if (!doc) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 },
      )
    }

    // Borrar archivo del disco
    const ruta = path.join(process.cwd(), 'public', doc.url)
    try {
      await unlink(ruta)
    } catch (e) {
      console.warn('No se pudo borrar el archivo:', ruta)
    }

    await db.documentoVehiculo.delete({ where: { id: docId } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error al borrar documento:', error)
    return NextResponse.json(
      { error: 'No se pudo borrar el documento' },
      { status: 500 },
    )
  }
}

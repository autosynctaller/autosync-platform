import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PATCH /api/stock/productos/[id] - actualizar producto
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const producto = await db.producto.findUnique({ where: { id } })
    if (!producto || producto.tallerId !== user.taller.id) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    const body = await req.json()
    const datos: Record<string, unknown> = {}
    const campos = ['nombre', 'codigo', 'categoria', 'marca', 'descripcion', 'stockMinimo', 'precioCompra', 'precioVenta', 'ubicacion', 'activo']
    for (const c of campos) {
      if (body[c] !== undefined) {
        if (['stockMinimo'].includes(c)) datos[c] = Number(body[c])
        else if (['precioCompra', 'precioVenta'].includes(c)) datos[c] = body[c] ? Number(body[c]) : null
        else datos[c] = body[c]
      }
    }

    const actualizado = await db.producto.update({ where: { id }, data: datos })
    return NextResponse.json({ producto: actualizado })
  } catch (error) {
    console.error('Error actualizar producto:', error)
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }
}

// DELETE /api/stock/productos/[id] - eliminar (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const producto = await db.producto.findUnique({ where: { id } })
    if (!producto || producto.tallerId !== user.taller.id) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    await db.producto.update({ where: { id }, data: { activo: false } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 })
  }
}

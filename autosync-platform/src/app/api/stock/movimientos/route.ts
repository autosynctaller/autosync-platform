import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST /api/stock/movimientos - registrar movimiento de stock
// Body: { productoId, tipo, cantidad, motivo, precio }
// tipo: COMPRA (entrada), USO (salida), AJUSTE (±), VENTA (salida), PERDIDA (salida)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { productoId, tipo, cantidad, motivo, precio } = body

    if (!productoId || !tipo || !cantidad) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const producto = await db.producto.findUnique({ where: { id: productoId } })
    if (!producto || producto.tallerId !== user.taller.id) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Calcular cantidad con signo
    let cantidadFinal = Number(cantidad)
    if (['USO', 'VENTA', 'PERDIDA'].includes(tipo)) {
      cantidadFinal = -Math.abs(cantidadFinal)
    }

    // Crear movimiento
    const movimiento = await db.movimientoStock.create({
      data: {
        productoId,
        tallerId: user.taller.id,
        tipo,
        cantidad: cantidadFinal,
        motivo: motivo || null,
        precio: precio ? Number(precio) : null,
      },
    })

    // Actualizar stock del producto
    const nuevoStock = producto.cantidad + cantidadFinal
    if (nuevoStock < 0) {
      return NextResponse.json({ error: 'No hay suficiente stock disponible' }, { status: 400 })
    }

    await db.producto.update({
      where: { id: productoId },
      data: { cantidad: nuevoStock },
    })

    return NextResponse.json({ movimiento, nuevoStock }, { status: 201 })
  } catch (error) {
    console.error('Error movimiento:', error)
    return NextResponse.json({ error: 'No se pudo registrar' }, { status: 500 })
  }
}

// GET /api/stock/movimientos?productoId=X - historial de movimientos
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const productoId = searchParams.get('productoId')

    const where: Record<string, unknown> = { tallerId: user.taller.id }
    if (productoId) where.productoId = productoId

    const movimientos = await db.movimientoStock.findMany({
      where,
      include: { producto: { select: { nombre: true } } },
      orderBy: { creadoEn: 'desc' },
      take: 50,
    })

    return NextResponse.json({ movimientos })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

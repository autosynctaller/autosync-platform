import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/stock/productos - listar productos del taller
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const categoria = searchParams.get('categoria')
    const bajoStock = searchParams.get('bajoStock') === '1'

    const where: Record<string, unknown> = {
      tallerId: user.taller.id,
      activo: true,
    }
    if (categoria) where.categoria = categoria
    if (bajoStock) where.cantidad = { lte: user.taller.stockMinimoAlerta }

    const productos = await db.producto.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { movimientos: true } } },
    })

    // Marcar productos con stock bajo
    const productosConAlerta = productos.map(p => ({
      ...p,
      stockBajo: p.cantidad <= p.stockMinimo,
    }))

    return NextResponse.json({ productos: productosConAlerta })
  } catch (error) {
    console.error('Error stock:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/stock/productos - crear producto
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar plan premium
    if (user.taller.plan !== 'PREMIUM') {
      return NextResponse.json({ error: 'Función disponible solo en plan Premium' }, { status: 403 })
    }

    const body = await req.json()
    const { nombre, codigo, categoria, marca, descripcion, cantidad, stockMinimo, precioCompra, precioVenta, ubicacion } = body

    if (!nombre) {
      return NextResponse.json({ error: 'Nombre es obligatorio' }, { status: 400 })
    }

    const producto = await db.producto.create({
      data: {
        tallerId: user.taller.id,
        nombre,
        codigo: codigo || null,
        categoria: categoria || null,
        marca: marca || null,
        descripcion: descripcion || null,
        cantidad: Number(cantidad) || 0,
        stockMinimo: Number(stockMinimo) || 5,
        precioCompra: precioCompra ? Number(precioCompra) : null,
        precioVenta: precioVenta ? Number(precioVenta) : null,
        ubicacion: ubicacion || null,
      },
    })

    // Si hay cantidad inicial, registrar movimiento
    if (cantidad && Number(cantidad) > 0) {
      await db.movimientoStock.create({
        data: {
          productoId: producto.id,
          tallerId: user.taller.id,
          tipo: 'COMPRA',
          cantidad: Number(cantidad),
          motivo: 'Stock inicial',
          precio: precioCompra ? Number(precioCompra) : null,
        },
      })
    }

    return NextResponse.json({ producto }, { status: 201 })
  } catch (error) {
    console.error('Error crear producto:', error)
    return NextResponse.json({ error: 'No se pudo crear' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/presupuestos - listar presupuestos del taller
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (user.taller.plan !== 'PREMIUM') {
      return NextResponse.json({ error: 'Disponible solo en plan Premium' }, { status: 403 })
    }

    const presupuestos = await db.presupuesto.findMany({
      where: { tallerId: user.taller.id },
      orderBy: { creadoEn: 'desc' },
      take: 50,
    })

    return NextResponse.json({ presupuestos })
  } catch (error) {
    console.error('Error presupuestos:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/presupuestos - crear presupuesto
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (user.taller.plan !== 'PREMIUM') {
      return NextResponse.json({ error: 'Disponible solo en plan Premium' }, { status: 403 })
    }

    const body = await req.json()
    const { clienteNombre, clienteTelefono, clienteEmail, vehiculoPatente, vehiculoMarca, vehiculoModelo, items, descuento, notas, validez } = body

    if (!clienteNombre || !clienteTelefono || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Faltan datos: cliente, items' }, { status: 400 })
    }

    // Calcular totales
    let subtotal = 0
    for (const item of items) {
      const st = (Number(item.cantidad) || 0) * (Number(item.precioUnitario) || 0)
      item.subtotal = st
      subtotal += st
    }
    const desc = Number(descuento) || 0
    const total = subtotal - desc

    const presupuesto = await db.presupuesto.create({
      data: {
        tallerId: user.taller.id,
        clienteNombre,
        clienteTelefono,
        clienteEmail: clienteEmail || null,
        vehiculoPatente: vehiculoPatente || null,
        vehiculoMarca: vehiculoMarca || null,
        vehiculoModelo: vehiculoModelo || null,
        items: items as any,
        subtotal,
        descuento: desc,
        total,
        notas: notas || null,
        validez: Number(validez) || 15,
        estado: 'BORRADOR',
      },
    })

    return NextResponse.json({ presupuesto }, { status: 201 })
  } catch (error) {
    console.error('Error crear presupuesto:', error)
    return NextResponse.json({ error: 'No se pudo crear' }, { status: 500 })
  }
}

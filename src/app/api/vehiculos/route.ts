import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Normaliza una patente: AAA123 o AA123BB en mayúsculas sin espacios ni guiones
function normalizarPatente(p: string): string {
  return p
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]/g, '')
}

// GET: buscar vehículo por patente (público) o listar todos (admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const patente = searchParams.get('patente')
    const admin = searchParams.get('admin') === '1'

    if (admin) {
      const vehiculos = await db.vehiculo.findMany({
        include: {
          cliente: true,
          _count: { select: { trabajos: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ vehiculos })
    }

    if (patente) {
      const p = normalizarPatente(patente)
      const vehiculo = await db.vehiculo.findUnique({
        where: { patente: p },
        include: {
          cliente: true,
          trabajos: {
            orderBy: { fecha: 'desc' },
            include: { servicio: true },
          },
          fotos: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!vehiculo) {
        return NextResponse.json(
          { error: 'No encontramos un vehículo con esa patente' },
          { status: 404 },
        )
      }
      return NextResponse.json({ vehiculo })
    }

    return NextResponse.json(
      { error: 'Parámetros insuficientes' },
      { status: 400 },
    )
  } catch (error) {
    console.error('Error al buscar vehículo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

// POST: registrar nuevo vehículo + cliente (público)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      nombre,
      telefono,
      email,
      direccion,
      marca,
      modelo,
      anio,
      patente,
      color,
      kilometraje,
      tipo,
      combustible,
      notas,
    } = body

    // Validaciones mínimas
    if (!nombre || !telefono || !marca || !modelo || !anio || !patente) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios' },
        { status: 400 },
      )
    }

    const p = normalizarPatente(patente)
    if (p.length < 6 || p.length > 7) {
      return NextResponse.json(
        { error: 'La patente ingresada no es válida' },
        { status: 400 },
      )
    }

    const existente = await db.vehiculo.findUnique({ where: { patente: p } })
    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe un vehículo registrado con esa patente' },
        { status: 409 },
      )
    }

    // Buscar o crear cliente por teléfono
    let cliente = await db.cliente.findFirst({ where: { telefono } })
    if (!cliente) {
      cliente = await db.cliente.create({
        data: {
          nombre,
          telefono,
          email: email || null,
          direccion: direccion || null,
        },
      })
    }

    const vehiculo = await db.vehiculo.create({
      data: {
        marca,
        modelo,
        anio: Number(anio),
        patente: p,
        color: color || null,
        kilometraje: kilometraje ? Number(kilometraje) : null,
        tipo: tipo || 'Auto',
        combustible: combustible || null,
        notas: notas || null,
        clienteId: cliente.id,
      },
      include: { cliente: true },
    })

    return NextResponse.json({ vehiculo }, { status: 201 })
  } catch (error) {
    console.error('Error al registrar vehículo:', error)
    return NextResponse.json(
      { error: 'No se pudo registrar el vehículo' },
      { status: 500 },
    )
  }
}

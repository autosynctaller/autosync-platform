import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const ADMIN_PIN = process.env.ADMIN_PIN || '1989'

function verificarPin(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-pin')
  return auth === ADMIN_PIN
}

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_FOTOS = 8 // máximo de fotos por vehículo
const EXTENSIONES_PERMITIDAS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

// POST: subir una foto para un vehículo (solo admin)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verificarPin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params

    const vehiculo = await db.vehiculo.findUnique({ where: { id } })
    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo inexistente' },
        { status: 404 },
      )
    }

    const cantidadFotos = await db.fotoVehiculo.count({
      where: { vehiculoId: id },
    })
    if (cantidadFotos >= MAX_FOTOS) {
      return NextResponse.json(
        { error: `Máximo ${MAX_FOTOS} fotos por vehículo` },
        { status: 400 },
      )
    }

    const formData = await req.formData()
    const file = formData.get('foto') as File | null
    const descripcion = (formData.get('descripcion') as string | null) || ''
    const esPrivada = formData.get('esPrivada') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió la foto' },
        { status: 400 },
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'La foto supera los 5 MB' },
        { status: 400 },
      )
    }

    const ext = path.extname(file.name || '').toLowerCase() || '.jpg'
    if (!EXTENSIONES_PERMITIDAS.includes(ext)) {
      return NextResponse.json(
        {
          error: `Extensión no permitida. Usá: ${EXTENSIONES_PERMITIDAS.join(', ')}`,
        },
        { status: 400 },
      )
    }

    const nombreArchivo = `${id}-${randomUUID()}${ext}`
    const rutaCarpeta = path.join(process.cwd(), 'public', 'uploads', 'vehiculos')
    await mkdir(rutaCarpeta, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(rutaCarpeta, nombreArchivo), buffer)

    const url = `/uploads/vehiculos/${nombreArchivo}`

    const foto = await db.fotoVehiculo.create({
      data: {
        vehiculoId: id,
        url,
        descripcion: descripcion || null,
        esPrivada,
      },
    })

    return NextResponse.json({ foto }, { status: 201 })
  } catch (error) {
    console.error('Error al subir foto:', error)
    return NextResponse.json(
      { error: 'No se pudo subir la foto' },
      { status: 500 },
    )
  }
}

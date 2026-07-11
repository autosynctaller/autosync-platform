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
const MAX_FOTOS_POR_CATEGORIA = 8 // máximo de fotos por categoría (hasta 32 totales)
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

    const formData = await req.formData()
    const file = formData.get('foto') as File | null
    const descripcion = (formData.get('descripcion') as string | null) || ''
    const esPrivada = formData.get('esPrivada') === 'true'
    const categoriaRaw = (formData.get('categoria') as string | null) || 'general'
    const categoriasValidas = ['general', 'dano', 'repuesto', 'trabajo_terminado']
    const categoria = categoriasValidas.includes(categoriaRaw) ? categoriaRaw : 'general'

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió la foto' },
        { status: 400 },
      )
    }

    // Validar límite por categoría (8 fotos por categoría, no total)
    const cantidadEnCategoria = await db.fotoVehiculo.count({
      where: { vehiculoId: id, categoria },
    })
    if (cantidadEnCategoria >= MAX_FOTOS_POR_CATEGORIA) {
      const nombresCategorias: Record<string, string> = {
        general: 'general',
        dano: 'de daños',
        repuesto: 'de repuestos',
        trabajo_terminado: 'de trabajo terminado',
      }
      return NextResponse.json(
        {
          error: `Máximo ${MAX_FOTOS_POR_CATEGORIA} fotos en la categoría ${nombresCategorias[categoria]}. Eliminá alguna para subir otra.`,
        },
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
        categoria,
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

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

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_DOCS = 20 // máximo de documentos por vehículo
const EXTENSIONES_PERMITIDAS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp']
const MIME_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]

// POST: subir un documento para un vehículo (solo admin)
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

    const cantidadDocs = await db.documentoVehiculo.count({
      where: { vehiculoId: id },
    })
    if (cantidadDocs >= MAX_DOCS) {
      return NextResponse.json(
        { error: `Máximo ${MAX_DOCS} documentos por vehículo` },
        { status: 400 },
      )
    }

    const formData = await req.formData()
    const file = formData.get('documento') as File | null
    const descripcion = (formData.get('descripcion') as string | null) || ''

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió el archivo' },
        { status: 400 },
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'El archivo supera los 10 MB' },
        { status: 400 },
      )
    }

    const ext = path.extname(file.name || '').toLowerCase() || '.pdf'
    if (!EXTENSIONES_PERMITIDAS.includes(ext)) {
      return NextResponse.json(
        {
          error: `Extensión no permitida. Usá: ${EXTENSIONES_PERMITIDAS.join(', ')}`,
        },
        { status: 400 },
      )
    }

    if (file.type && !MIME_PERMITIDOS.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido' },
        { status: 400 },
      )
    }

    const nombreArchivo = `${id}-${randomUUID()}${ext}`
    const rutaCarpeta = path.join(
      process.cwd(),
      'public',
      'uploads',
      'documentos',
    )
    await mkdir(rutaCarpeta, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(rutaCarpeta, nombreArchivo), buffer)

    const url = `/uploads/documentos/${nombreArchivo}`

    const documento = await db.documentoVehiculo.create({
      data: {
        vehiculoId: id,
        url,
        nombre: file.name || `documento${ext}`,
        tipo: file.type || 'application/octet-stream',
        tamaño: file.size,
        descripcion: descripcion || null,
      },
    })

    return NextResponse.json({ documento }, { status: 201 })
  } catch (error) {
    console.error('Error al subir documento:', error)
    return NextResponse.json(
      { error: 'No se pudo subir el documento' },
      { status: 500 },
    )
  }
}

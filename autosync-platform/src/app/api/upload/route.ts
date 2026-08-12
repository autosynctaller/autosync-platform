import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { getCurrentUser } from '@/lib/auth'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const EXTENSIONES = ['.jpg', '.jpeg', '.png', '.webp']

// POST /api/upload - subir imagen (solo talleres autenticados)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('foto') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se recibió la foto' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'La foto supera los 5 MB' }, { status: 400 })
    }

    const ext = path.extname(file.name || '').toLowerCase() || '.jpg'
    if (!EXTENSIONES.includes(ext)) {
      return NextResponse.json({ error: 'Extensión no permitida' }, { status: 400 })
    }

    const nombreArchivo = `${randomUUID()}${ext}`
    const rutaCarpeta = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(rutaCarpeta, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(rutaCarpeta, nombreArchivo), buffer)

    return NextResponse.json({ url: `/uploads/${nombreArchivo}` }, { status: 201 })
  } catch (error) {
    console.error('Error al subir imagen:', error)
    return NextResponse.json({ error: 'No se pudo subir' }, { status: 500 })
  }
}

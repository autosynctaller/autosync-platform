import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/anuncios?tipo=BANNER_HOME&ciudad=X&marca=Y
// Público: devuelve anuncios activos según el contexto
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get('tipo')
    const ciudad = searchParams.get('ciudad')
    const marca = searchParams.get('marca')
    const todos = searchParams.get('todos') === '1' // admin ve todos

    const user = await getCurrentUser()
    const esAdmin = user?.rol === 'SUPER_ADMIN'

    const hoy = new Date()

    const where: Record<string, unknown> = todos && esAdmin ? {} : {
      estado: 'ACTIVO',
      inicio: { lte: hoy },
      OR: [{ fin: null }, { fin: { gte: hoy } }],
    }

    if (tipo) where.tipo = tipo

    const anuncios = await db.anuncio.findMany({
      where,
      include: { anunciante: { select: { nombre: true, logo: true, web: true } } },
      orderBy: todos && esAdmin ? [{ creadoEn: 'desc' }] : [{ Prioridad: 'desc' }, { creadoEn: 'desc' }],
      take: todos && esAdmin ? 100 : 5,
    })

    // Filtrar por ciudad y marca si no es admin pidiendo todos
    let filtrados = anuncios
    if (!todos || !esAdmin) {
      if (ciudad) filtrados = filtrados.filter(a => !a.soloCiudad || a.soloCiudad.toLowerCase().includes(ciudad.toLowerCase()))
      if (marca) filtrados = filtrados.filter(a => !a.soloMarca || a.soloMarca.toLowerCase().includes(marca.toLowerCase()))
    }

    // Incrementar impresiones (solo para anuncios activos que se muestran al público)
    if (!todos || !esAdmin) {
      for (const a of filtrados) {
        db.anuncio.update({ where: { id: a.id }, data: { impresiones: { increment: 1 } } }).catch(() => {})
      }
    }

    return NextResponse.json({ anuncios: filtrados })
  } catch (error) {
    console.error('Error anuncios:', error)
    return NextResponse.json({ anuncios: [] })
  }
}

// POST /api/anuncios - crear anuncio (solo super admin)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { anuncianteNombre, anuncianteTipo, titulo, descripcion, imagen, url, cta, tipo, inicio, fin, prioridad, soloCiudad, soloMarca } = body

    if (!anuncianteNombre || !titulo || !url || !tipo || !inicio) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    // Buscar o crear anunciante
    let anunciante = await db.anunciante.findFirst({ where: { nombre: anuncianteNombre } })
    if (!anunciante) {
      anunciante = await db.anunciante.create({
        data: { nombre: anuncianteNombre, tipo: anuncianteTipo || 'OTRO' },
      })
    }

    const anuncio = await db.anuncio.create({
      data: {
        anuncianteId: anunciante.id,
        titulo,
        descripcion: descripcion || null,
        imagen: imagen || null,
        url,
        cta: cta || null,
        tipo,
        estado: 'ACTIVO',
        inicio: new Date(inicio),
        fin: fin ? new Date(fin) : null,
        Prioridad: Number(prioridad) || 0,
        soloCiudad: soloCiudad || null,
        soloMarca: soloMarca || null,
      },
    })

    return NextResponse.json({ anuncio }, { status: 201 })
  } catch (error) {
    console.error('Error crear anuncio:', error)
    return NextResponse.json({ error: 'No se pudo crear' }, { status: 500 })
  }
}

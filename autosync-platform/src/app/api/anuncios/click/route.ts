import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/anuncios/click - registrar click en anuncio
// Body: { anuncioId, ciudad? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { anuncioId } = body

    if (!anuncioId) {
      return NextResponse.json({ error: 'Falta anuncioId' }, { status: 400 })
    }

    // Incrementar contador de clicks
    await db.anuncio.update({
      where: { id: anuncioId },
      data: { clicks: { increment: 1 } },
    })

    // Registrar click individual para analytics
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    const userAgent = req.headers.get('user-agent') || null

    await db.clickAnuncio.create({
      data: {
        anuncioId,
        ip: ip ? ip.slice(0, 15) : null, // anonimizar
        userAgent: userAgent ? userAgent.slice(0, 200) : null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error click:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

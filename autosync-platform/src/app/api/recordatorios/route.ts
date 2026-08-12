import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/recordatorios - recordatorios del taller (trabajos + VTV + GNC)
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const tallerId = user.taller.id
    const hoy = new Date()
    const en60Dias = new Date(hoy.getTime() + 60 * 24 * 60 * 60 * 1000)

    type Recordatorio = {
      id: string
      tipo: 'trabajo' | 'vtv' | 'gnc'
      titulo: string
      descripcion: string
      fecha: Date
      diasRestantes: number
      estado: 'vencido' | 'hoy' | 'proximo' | 'futuro'
      vehiculo: { id: string; marca: string; modelo: string; patente: string }
    }

    const recordatorios: Recordatorio[] = []

    // 1. Trabajos con recordatorio
    const trabajos = await db.trabajo.findMany({
      where: { tallerId, recordatorio: { not: null, lte: en60Dias } },
      include: { vehiculo: { include: { owner: true } } },
    })

    for (const t of trabajos) {
      const fecha = t.recordatorio!
      const dias = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
      let estado: Recordatorio['estado'] = 'futuro'
      if (dias < 0) estado = 'vencido'
      else if (dias === 0) estado = 'hoy'
      else if (dias <= 30) estado = 'proximo'

      recordatorios.push({
        id: t.id,
        tipo: 'trabajo',
        titulo: t.titulo,
        descripcion: t.proximaRevision || '',
        fecha,
        diasRestantes: dias,
        estado,
        vehiculo: { id: t.vehiculo.id, marca: t.vehiculo.marca, modelo: t.vehiculo.modelo, patente: t.vehiculo.patente },
      })
    }

    // 2. VTV y GNC de vehículos donde el taller trabajó
    const vehiculosTaller = await db.vehiculoTaller.findMany({
      where: { tallerId },
      include: { vehiculo: { include: { owner: true } } },
    })

    for (const vt of vehiculosTaller) {
      const v = vt.vehiculo
      // VTV
      if (v.vtvVencimiento && v.vtvVencimiento <= en60Dias) {
        const dias = Math.ceil((v.vtvVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
        let estado: Recordatorio['estado'] = 'futuro'
        if (dias < 0) estado = 'vencido'
        else if (dias === 0) estado = 'hoy'
        else if (dias <= 30) estado = 'proximo'

        recordatorios.push({
          id: `vtv-${v.id}`,
          tipo: 'vtv',
          titulo: 'Vencimiento VTV',
          descripcion: 'Recordá realizar la Verificación Técnica Vehicular',
          fecha: v.vtvVencimiento,
          diasRestantes: dias,
          estado,
          vehiculo: { id: v.id, marca: v.marca, modelo: v.modelo, patente: v.patente },
        })
      }
      // GNC
      if (v.gncVencimiento && v.gncVencimiento <= en60Dias) {
        const dias = Math.ceil((v.gncVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
        let estado: Recordatorio['estado'] = 'futuro'
        if (dias < 0) estado = 'vencido'
        else if (dias === 0) estado = 'hoy'
        else if (dias <= 30) estado = 'proximo'

        recordatorios.push({
          id: `gnc-${v.id}`,
          tipo: 'gnc',
          titulo: 'Vencimiento obleta GNC',
          descripcion: 'Recordá renovar la obleta de GNC',
          fecha: v.gncVencimiento,
          diasRestantes: dias,
          estado,
          vehiculo: { id: v.id, marca: v.marca, modelo: v.modelo, patente: v.patente },
        })
      }
    }

    // Ordenar por urgencia
    const orden = { vencido: 0, hoy: 1, proximo: 2, futuro: 3 }
    recordatorios.sort((a, b) => orden[a.estado] - orden[b.estado] || a.diasRestantes - b.diasRestantes)

    return NextResponse.json({ recordatorios, total: recordatorios.length })
  } catch (error) {
    console.error('Error recordatorios:', error)
    return NextResponse.json({ recordatorios: [], total: 0 })
  }
}

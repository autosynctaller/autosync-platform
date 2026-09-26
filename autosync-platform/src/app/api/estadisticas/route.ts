import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'TALLER' || !user.taller) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const tallerId = user.taller.id
    
    // Obtener ciclo de facturación del taller (default: día 1)
    const cicloInicio = user.taller.cicloFacturacionInicio || 1
    
    // Calcular rango del ciclo actual
    const hoy = new Date()
    let inicioCiclo, finCiclo
    if (cicloInicio === 1) {
      // Ciclo natural: 1 al último día del mes
      inicioCiclo = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      finCiclo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1)
    } else {
      // Ciclo custom: empieza el día X
      if (hoy.getDate() >= cicloInicio) {
        inicioCiclo = new Date(hoy.getFullYear(), hoy.getMonth(), cicloInicio)
        finCiclo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, cicloInicio)
      } else {
        inicioCiclo = new Date(hoy.getFullYear(), hoy.getMonth() - 1, cicloInicio)
        finCiclo = new Date(hoy.getFullYear(), hoy.getMonth(), cicloInicio)
      }
    }
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    
    // Stats paralelas
    const [vehiculos, trabajos, trabajosMes, trabajosCiclo, remitosCiclo] = await Promise.all([
      db.vehiculoTaller.count({ where: { tallerId } }),
      db.trabajo.count({ where: { tallerId } }),
      db.trabajo.count({ where: { tallerId, fecha: { gte: inicioMes } } }),
      // Trabajos del ciclo de facturación actual (con precio > 0)
      db.trabajo.findMany({
        where: { tallerId, fecha: { gte: inicioCiclo, lt: finCiclo } },
        select: { precio: true, fecha: true },
      }),
      // Trabajos del ciclo (cada trabajo = 1 remito)
      db.trabajo.count({
        where: { tallerId, fecha: { gte: inicioCiclo, lt: finCiclo } },
      }),
    ])
    
    // Calcular total cobrado en el ciclo
    const totalCobradoCiclo = trabajosCiclo.reduce((sum, t) => sum + (t.precio || 0), 0)
    
    // Calcular total cobrado este mes calendario
    const totalCobradoMes = trabajosCiclo
      .filter(t => new Date(t.fecha) >= inicioMes)
      .reduce((sum, t) => sum + (t.precio || 0), 0)
    
    return NextResponse.json({
      totales: {
        vehiculos,
        trabajos,
        trabajosMes,
        totalCobradoMes,
        remitosCiclo,
        totalCobradoCiclo,
        cicloInicio,
        cicloInicioFecha: inicioCiclo.toISOString(),
        cicloFinFecha: finCiclo.toISOString(),
      },
    })
  } catch (e) {
    console.error('Error en estadísticas:', e)
    return NextResponse.json({
      totales: {
        vehiculos: 0, trabajos: 0, trabajosMes: 0,
        totalCobradoMes: 0, remitosCiclo: 0, totalCobradoCiclo: 0,
        cicloInicio: 1,
      },
    })
  }
}

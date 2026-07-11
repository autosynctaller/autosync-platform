import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ADMIN_PIN = process.env.ADMIN_PIN || '1989'

function verificarPin(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-pin')
  return auth === ADMIN_PIN
}

// GET: estadísticas generales del taller (solo admin)
export async function GET(req: NextRequest) {
  if (!verificarPin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1)

    // Total de vehículos registrados
    const totalVehiculos = await db.vehiculo.count()

    // Total de clientes
    const totalClientes = await db.cliente.count()

    // Total de trabajos realizados
    const totalTrabajos = await db.trabajo.count()

    // Trabajos del mes actual
    const trabajosMes = await db.trabajo.count({
      where: { fecha: { gte: inicioMes } },
    })

    // Trabajos del mes anterior
    const trabajosMesAnterior = await db.trabajo.count({
      where: {
        fecha: { gte: inicioMesAnterior, lt: inicioMes },
      },
    })

    // Trabajos del año actual
    const trabajosAnio = await db.trabajo.count({
      where: { fecha: { gte: inicioAnio } },
    })

    // Ingresos del mes actual (suma de precios de trabajos completados)
    const ingresosMesRaw = await db.trabajo.aggregate({
      _sum: { precio: true },
      where: {
        fecha: { gte: inicioMes },
        estado: 'Completado',
      },
    })
    const ingresosMes = ingresosMesRaw._sum.precio || 0

    // Ingresos del mes anterior
    const ingresosMesAnteriorRaw = await db.trabajo.aggregate({
      _sum: { precio: true },
      where: {
        fecha: { gte: inicioMesAnterior, lt: inicioMes },
        estado: 'Completado',
      },
    })
    const ingresosMesAnterior = ingresosMesAnteriorRaw._sum.precio || 0

    // Ingresos del año
    const ingresosAnioRaw = await db.trabajo.aggregate({
      _sum: { precio: true },
      where: {
        fecha: { gte: inicioAnio },
        estado: 'Completado',
      },
    })
    const ingresosAnio = ingresosAnioRaw._sum.precio || 0

    // Ingresos totales (histórico)
    const ingresosTotalesRaw = await db.trabajo.aggregate({
      _sum: { precio: true },
      where: { estado: 'Completado' },
    })
    const ingresosTotales = ingresosTotalesRaw._sum.precio || 0

    // Trabajos por estado
    const trabajosPorEstado = await db.trabajo.groupBy({
      by: ['estado'],
      _count: true,
    })

    // Trabajos por mes (últimos 6 meses) - para gráfico
    const trabajosPorMes: Array<{ mes: string; cantidad: number; ingresos: number }> = []
    for (let i = 5; i >= 0; i--) {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      const fin = new Date(hoy.getFullYear(), hoy.getMonth() - i + 1, 1)
      const cantidad = await db.trabajo.count({
        where: { fecha: { gte: inicio, lt: fin } },
      })
      const ingresosRaw = await db.trabajo.aggregate({
        _sum: { precio: true },
        where: {
          fecha: { gte: inicio, lt: fin },
          estado: 'Completado',
        },
      })
      const nombreMes = inicio.toLocaleDateString('es-AR', { month: 'short' })
      trabajosPorMes.push({
        mes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
        cantidad,
        ingresos: ingresosRaw._sum.precio || 0,
      })
    }

    // Servicios más realizados (top 5)
    const serviciosMasRealizadosRaw = await db.trabajo.groupBy({
      by: ['servicioId'],
      _count: true,
      where: { servicioId: { not: null } },
      orderBy: { _count: { servicioId: 'desc' } },
      take: 5,
    })

    const serviciosMasRealizados: Array<{ nombre: string; cantidad: number }> = []
    for (const s of serviciosMasRealizadosRaw) {
      if (s.servicioId) {
        const servicio = await db.servicio.findUnique({
          where: { id: s.servicioId },
          select: { nombre: true },
        })
        if (servicio) {
          serviciosMasRealizados.push({
            nombre: servicio.nombre,
            cantidad: s._count,
          })
        }
      }
    }

    // Trabajos por categoría (top 5 por títulos más usados)
    const titulosMasUsadosRaw = await db.trabajo.groupBy({
      by: ['titulo'],
      _count: true,
      orderBy: { _count: { titulo: 'desc' } },
      take: 5,
    })
    const titulosMasUsados = titulosMasUsadosRaw.map((t) => ({
      titulo: t.titulo,
      cantidad: t._count,
    }))

    // Vehículos con VTV vencida o por vencer (30 días)
    const vehiculosVtvVencida = await db.vehiculo.count({
      where: {
        vtvVencimiento: { lt: hoy },
      },
    })
    const vehiculosVtvProxima = await db.vehiculo.count({
      where: {
        vtvVencimiento: {
          gte: hoy,
          lt: new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    // Vehículos con GNC vencida o por vencer
    const vehiculosGncVencida = await db.vehiculo.count({
      where: {
        gncVencimiento: { lt: hoy },
      },
    })
    const vehiculosGncProxima = await db.vehiculo.count({
      where: {
        gncVencimiento: {
          gte: hoy,
          lt: new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    // Recordatorios pendientes (trabajos)
    const recordatoriosPendientes = await db.trabajo.count({
      where: {
        recordatorio: { lt: hoy },
      },
    })

    // Calcular variaciones porcentuales
    const variacionTrabajos =
      trabajosMesAnterior > 0
        ? Math.round(
            ((trabajosMes - trabajosMesAnterior) / trabajosMesAnterior) * 100,
          )
        : 100

    const variacionIngresos =
      ingresosMesAnterior > 0
        ? Math.round(
            ((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100,
          )
        : 100

    return NextResponse.json({
      totales: {
        vehiculos: totalVehiculos,
        clientes: totalClientes,
        trabajos: totalTrabajos,
        trabajosMes,
        trabajosAnio,
        ingresosMes,
        ingresosAnio,
        ingresosTotales,
        variacionTrabajos,
        variacionIngresos,
      },
      trabajosPorEstado: trabajosPorEstado.map((t) => ({
        estado: t.estado,
        cantidad: t._count,
      })),
      trabajosPorMes,
      serviciosMasRealizados,
      titulosMasUsados,
      vencimientos: {
        vtvVencida: vehiculosVtvVencida,
        vtvProxima: vehiculosVtvProxima,
        gncVencida: vehiculosGncVencida,
        gncProxima: vehiculosGncProxima,
        recordatoriosPendientes,
      },
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 },
    )
  }
}

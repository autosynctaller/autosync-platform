import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  enviarEmail,
  emailRecordatorioTrabajo,
  emailRecordatorioVTV,
} from '@/lib/email'

// Este endpoint debe ser llamado diariamente por un cron job externo
// (Vercel Cron, GitHub Actions, UptimeRobot, etc.)
//
// Configuración en Vercel (vercel.json):
// {
//   "crons": [
//     { "path": "/api/cron/recordatorios", "schedule": "0 9 * * *" }
//   ]
// }
//
// El schedule "0 9 * * *" significa: todos los días a las 9:00 AM
//
// Seguridad: este endpoint requiere el token CRON_SECRET configurado en Vercel
// Se pasa como header: Authorization: Bearer <CRON_SECRET>

export const maxDuration = 60 // 60 segundos máximo (plan gratuito Vercel)
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Verificar autorización
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // En desarrollo, permitir ejecutar sin secret para testing
  if (!cronSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'CRON_SECRET no configurado' },
      { status: 500 },
    )
  }

  const hoy = new Date()
  const en30Dias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000)

  const resultados = {
    trabajosEnviados: 0,
    vtvEnviados: 0,
    gncEnviados: 0,
    errores: [] as string[],
    detalles: [] as string[],
  }

  // ============ 1. RECORDATORIOS DE TRABAJOS ============
  // Buscar trabajos con recordatorio vencido o por vencer en 30 días
  // Y que tengan email del cliente
  try {
    const trabajos = await db.trabajo.findMany({
      where: {
        recordatorio: {
          not: null,
          lte: en30Dias, // vencido o por vencer en 30 días
        },
        vehiculo: {
          cliente: {
            email: { not: null },
          },
        },
      },
      include: {
        vehiculo: {
          include: { cliente: true },
        },
      },
    })

    for (const t of trabajos) {
      if (!t.vehiculo.cliente.email) continue

      const fechaRecordatorio = t.recordatorio!
      const diasRestantes = Math.ceil(
        (fechaRecordatorio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      )

      // Solo mandar mail si venció hoy o hace menos de 7 días, o si vence en 7 o 30 días
      // (para no spamear al cliente todos los días)
      const diasParaEnvio = [-7, -1, 0, 7, 30]
      if (!diasParaEnvio.includes(diasRestantes)) continue

      const { subject, html } = emailRecordatorioTrabajo({
        nombreCliente: t.vehiculo.cliente.nombre,
        marca: t.vehiculo.marca,
        modelo: t.vehiculo.modelo,
        patente: t.vehiculo.patente,
        tituloTrabajo: t.titulo,
        proximoTexto: t.proximo,
        fechaRecordatorio: fechaRecordatorio.toLocaleDateString('es-AR'),
      })

      const result = await enviarEmail({
        to: t.vehiculo.cliente.email,
        subject,
        html,
      })

      if (result.ok) {
        resultados.trabajosEnviados++
        resultados.detalles.push(
          `✓ Trabajo "${t.titulo}" → ${t.vehiculo.cliente.email} (${t.vehiculo.patente})`,
        )
      } else {
        resultados.errores.push(
          `Error trabajo "${t.titulo}" → ${result.error}`,
        )
      }
    }
  } catch (err) {
    resultados.errores.push(
      `Error al procesar trabajos: ${err instanceof Error ? err.message : 'desconocido'}`,
    )
  }

  // ============ 2. RECORDATORIOS DE VTV ============
  try {
    const vehiculosConVtv = await db.vehiculo.findMany({
      where: {
        vtvVencimiento: {
          not: null,
          lte: en30Dias, // vencida o por vencer en 30 días
        },
        cliente: {
          email: { not: null },
        },
      },
      include: { cliente: true },
    })

    for (const v of vehiculosConVtv) {
      if (!v.cliente.email) continue

      const fecha = v.vtvVencimiento!
      const diasRestantes = Math.ceil(
        (fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      )

      // Solo mandar en días específicos para no spamear
      const diasParaEnvio = [-7, -1, 0, 7, 30]
      if (!diasParaEnvio.includes(diasRestantes)) continue

      const { subject, html } = emailRecordatorioVTV({
        nombreCliente: v.cliente.nombre,
        marca: v.marca,
        modelo: v.modelo,
        patente: v.patente,
        fechaVencimiento: fecha.toLocaleDateString('es-AR'),
        diasRestantes,
        tipo: 'VTV',
      })

      const result = await enviarEmail({
        to: v.cliente.email,
        subject,
        html,
      })

      if (result.ok) {
        resultados.vtvEnviados++
        resultados.detalles.push(
          `✓ VTV → ${v.cliente.email} (${v.patente}) - ${diasRestantes}d`,
        )
      } else {
        resultados.errores.push(`Error VTV ${v.patente} → ${result.error}`)
      }
    }
  } catch (err) {
    resultados.errores.push(
      `Error al procesar VTV: ${err instanceof Error ? err.message : 'desconocido'}`,
    )
  }

  // ============ 3. RECORDATORIOS DE GNC ============
  try {
    const vehiculosConGnc = await db.vehiculo.findMany({
      where: {
        gncVencimiento: {
          not: null,
          lte: en30Dias,
        },
        cliente: {
          email: { not: null },
        },
      },
      include: { cliente: true },
    })

    for (const v of vehiculosConGnc) {
      if (!v.cliente.email) continue

      const fecha = v.gncVencimiento!
      const diasRestantes = Math.ceil(
        (fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      )

      const diasParaEnvio = [-7, -1, 0, 7, 30]
      if (!diasParaEnvio.includes(diasRestantes)) continue

      const { subject, html } = emailRecordatorioVTV({
        nombreCliente: v.cliente.nombre,
        marca: v.marca,
        modelo: v.modelo,
        patente: v.patente,
        fechaVencimiento: fecha.toLocaleDateString('es-AR'),
        diasRestantes,
        tipo: 'GNC',
      })

      const result = await enviarEmail({
        to: v.cliente.email,
        subject,
        html,
      })

      if (result.ok) {
        resultados.gncEnviados++
        resultados.detalles.push(
          `✓ GNC → ${v.cliente.email} (${v.patente}) - ${diasRestantes}d`,
        )
      } else {
        resultados.errores.push(`Error GNC ${v.patente} → ${result.error}`)
      }
    }
  } catch (err) {
    resultados.errores.push(
      `Error al procesar GNC: ${err instanceof Error ? err.message : 'desconocido'}`,
    )
  }

  const totalEnviados =
    resultados.trabajosEnviados + resultados.vtvEnviados + resultados.gncEnviados

  return NextResponse.json({
    ok: true,
    fecha: hoy.toISOString(),
    totalEnviados,
    ...resultados,
  })
}

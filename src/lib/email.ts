import { Resend } from 'resend'

// Inicializar Resend solo si hay API key configurada
// En desarrollo sin API key, las funciones son no-op (no mandan nada)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'notificaciones@autosync.com.ar'
const FROM_NAME = process.env.RESEND_FROM_NAME || 'AutoSync - Taller Mecánico'
const TALLER_TELEFONO = '2235941522'
const TALLER_DIRECCION = 'Falucho 4657, Mar del Plata'

export interface EmailParams {
  to: string
  subject: string
  html: string
}

export async function enviarEmail({ to, subject, html }: EmailParams) {
  // Si no hay Resend configurado, logear y retornar ok (para desarrollo)
  if (!resend) {
    console.log(`📧 [DEV] Email simulado a ${to}:`)
    console.log(`   Asunto: ${subject}`)
    return { ok: true, simulated: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Error al enviar email:', error)
      return { ok: false, error: error.message }
    }

    console.log(`✓ Email enviado a ${to}: ${data?.id}`)
    return { ok: true, id: data?.id }
  } catch (err) {
    console.error('Error al enviar email:', err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}

// ============ PLANTILLAS DE EMAIL ============

function plantillaBase(contenido: string, titulo: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#18181b;padding:24px 32px;">
              <img src="https://autosync.com.ar/logo-autosync-dark.png" alt="AutoSync" style="height:40px;display:block;margin:0 auto;" />
            </td>
          </tr>
          <!-- Contenido -->
          <tr>
            <td style="padding:32px;color:#18181b;line-height:1.6;">
              ${contenido}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f4f4f5;padding:20px 32px;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#71717a;">
                <strong style="color:#18181b;">AutoSync - Centro Integral Automotriz</strong><br/>
                ${TALLER_DIRECCION} · Tel: ${TALLER_TELEFONO}
              </p>
              <p style="margin:0;font-size:11px;color:#a1a1aa;">
                Recibís este email porque tenemos tu vehículo registrado en nuestro sistema.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function emailRecordatorioTrabajo(params: {
  nombreCliente: string
  marca: string
  modelo: string
  patente: string
  tituloTrabajo: string
  proximoTexto?: string | null
  fechaRecordatorio: string
}): { subject: string; html: string } {
  const { nombreCliente, marca, modelo, patente, tituloTrabajo, proximoTexto, fechaRecordatorio } = params

  const subject = `Recordatorio: ${tituloTrabajo} - ${marca} ${modelo} (${patente})`

  const contenido = `
    <h1 style="margin:0 0 16px 0;font-size:24px;color:#18181b;">Hola ${nombreCliente}!</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#52525b;">
      Te recordamos que tu <strong>${marca} ${modelo}</strong> (patente <strong>${patente}</strong>)
      tiene pendiente el siguiente servicio:
    </p>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;margin:16px 0;border-radius:4px;">
      <p style="margin:0 0 8px 0;font-size:18px;font-weight:bold;color:#92400e;">${tituloTrabajo}</p>
      ${proximoTexto ? `<p style="margin:0;font-size:14px;color:#92400e;">Próximo: ${proximoTexto}</p>` : ''}
      <p style="margin:8px 0 0 0;font-size:13px;color:#92400e;">Fecha sugerida: ${fechaRecordatorio}</p>
    </div>
    <p style="margin:16px 0;font-size:16px;color:#52525b;">
      Para coordinar un turno, respondé a este email o contactanos por:
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://wa.me/549${TALLER_TELEFONO}" style="display:inline-block;background:#22c55e;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:15px;">
        💬 Escribinos por WhatsApp
      </a>
    </div>
    <p style="margin:16px 0 0 0;font-size:14px;color:#71717a;">
      Si ya realizaste este servicio, ignorá este mensaje. Si tenés alguna duda,
      no dudes en contactarnos.
    </p>
    <p style="margin:24px 0 0 0;font-size:14px;color:#52525b;">
      Saludos,<br/>
      <strong>Equipo de AutoSync</strong>
    </p>
  `

  return { subject, html: plantillaBase(contenido, subject) }
}

export function emailRecordatorioVTV(params: {
  nombreCliente: string
  marca: string
  modelo: string
  patente: string
  fechaVencimiento: string
  diasRestantes: number
  tipo: 'VTV' | 'GNC'
}): { subject: string; html: string } {
  const { nombreCliente, marca, modelo, patente, fechaVencimiento, diasRestantes, tipo } = params

  const vencido = diasRestantes < 0
  const subject = vencido
    ? `${tipo} VENCIDA - ${marca} ${modelo} (${patente})`
    : `${tipo} por vencer - ${marca} ${modelo} (${patente})`

  const colorBanner = vencido ? '#fee2e2|#dc2626|#991b1b' : '#fef3c7|#f59e0b|#92400e'
  const [bgColor, borderColor, textColor] = colorBanner.split('|')

  const mensaje = vencido
    ? `Te informamos que la <strong>${tipo}</strong> de tu vehículo está <strong>VENCIDA</strong> desde hace ${Math.abs(diasRestantes)} día(s).`
    : `Te recordamos que la <strong>${tipo}</strong> de tu vehículo <strong>vence en ${diasRestantes} día(s)</strong>.`

  const contenido = `
    <h1 style="margin:0 0 16px 0;font-size:24px;color:#18181b;">Hola ${nombreCliente}!</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#52525b;">
      ${mensaje}
    </p>
    <div style="background:${bgColor};border-left:4px solid ${borderColor};padding:16px;margin:16px 0;border-radius:4px;">
      <p style="margin:0 0 4px 0;font-size:13px;color:${textColor};text-transform:uppercase;letter-spacing:0.5px;">
        ${vencido ? '⚠️ VENCIDA' : '⏰ POR VENCER'}
      </p>
      <p style="margin:0 0 4px 0;font-size:18px;font-weight:bold;color:${textColor};">${tipo}</p>
      <p style="margin:0;font-size:14px;color:${textColor};">
        Vehículo: ${marca} ${modelo} (${patente})<br/>
        Fecha de vencimiento: <strong>${fechaVencimiento}</strong>
      </p>
    </div>
    <p style="margin:16px 0;font-size:16px;color:#52525b;">
      ${tipo === 'VTV'
        ? 'La Verificación Técnica Vehicular es obligatoria para circular. Recordá realizarla antes del vencimiento para evitar multas.'
        : 'La obleta de GNC es obligatoria para circular con el equipo instalado. Recordá renovarla antes del vencimiento.'
      }
    </p>
    <p style="margin:16px 0;font-size:16px;color:#52525b;">
      Si querés que coordinemos la revisión o tenés alguna consulta, contactanos:
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://wa.me/549${TALLER_TELEFONO}" style="display:inline-block;background:#22c55e;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:15px;">
        💬 Escribinos por WhatsApp
      </a>
    </div>
    <p style="margin:24px 0 0 0;font-size:14px;color:#52525b;">
      Saludos,<br/>
      <strong>Equipo de AutoSync</strong>
    </p>
  `

  return { subject, html: plantillaBase(contenido, subject) }
}

export function emailBienvenida(params: {
  nombreCliente: string
  marca: string
  modelo: string
  patente: string
}): { subject: string; html: string } {
  const { nombreCliente, marca, modelo, patente } = params

  const subject = `Bienvenido a AutoSync! Tu ${marca} ${modelo} fue registrado`

  const contenido = `
    <h1 style="margin:0 0 16px 0;font-size:24px;color:#18181b;">¡Hola ${nombreCliente}!</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#52525b;">
      Tu vehículo fue registrado exitosamente en nuestro sistema:
    </p>
    <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px 0;font-size:18px;font-weight:bold;color:#18181b;">
        ${marca} ${modelo}
      </p>
      <p style="margin:0;font-size:14px;color:#52525b;">
        Patente: <strong>${patente}</strong>
      </p>
    </div>
    <p style="margin:16px 0;font-size:16px;color:#52525b;">
      A partir de ahora, podés consultar el historial de servicios de tu vehículo
      cuando quieras, desde nuestro sitio web:
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://autosync.com.ar/#historial" style="display:inline-block;background:#f59e0b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:15px;">
        🔍 Ver mi historial
      </a>
    </div>
    <p style="margin:16px 0;font-size:16px;color:#52525b;">
      Te enviaremos recordatorios automáticos cuando:
    </p>
    <ul style="margin:0 0 16px 0;font-size:15px;color:#52525b;padding-left:20px;">
      <li style="margin-bottom:8px;">Se acerque la fecha de un service programado</li>
      <li style="margin-bottom:8px;">Venza la VTV o la obleta de GNC</li>
      <li style="margin-bottom:8px;">Haya que realizar algún mantenimiento</li>
    </ul>
    <p style="margin:24px 0 0 0;font-size:14px;color:#52525b;">
      ¡Gracias por confiar en nosotros!<br/>
      <strong>Equipo de AutoSync</strong>
    </p>
  `

  return { subject, html: plantillaBase(contenido, subject) }
}

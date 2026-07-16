import { NextRequest, NextResponse } from 'next/server'
import { enviarEmail } from '@/lib/email'

// GET: probar configuración de email
// Solo admin puede ejecutarlo (con PIN)
export async function GET(req: NextRequest) {
  const ADMIN_PIN = process.env.ADMIN_PIN || '1989'
  const auth = req.headers.get('x-admin-pin')

  if (auth !== ADMIN_PIN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json(
      { error: 'Falta parámetro email' },
      { status: 400 },
    )
  }

  const result = await enviarEmail({
    to: email,
    subject: '🧪 Test de configuración - AutoSync',
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;background:#f4f4f5;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
    <h1 style="color:#18181b;">🧪 Test de configuración</h1>
    <p>Si estás leyendo este email, la configuración de Resend funciona correctamente.</p>
    <p>Los recordatorios automáticos a tus clientes se enviarán desde esta cuenta.</p>
    <hr style="margin:24px 0;border:none;border-top:1px solid #e4e4e7;">
    <p style="font-size:13px;color:#71717a;">
      <strong>AutoSync - Taller Mecánico</strong><br/>
      Falucho 4657, Mar del Plata · (0223) 594-1522
    </p>
  </div>
</body>
</html>`,
  })

  if (result.ok) {
    return NextResponse.json({
      ok: true,
      message: result.simulated
        ? 'Email simulado (RESEND_API_KEY no configurada). En producción se enviará real.'
        : 'Email enviado correctamente. Revisá la bandeja de entrada.',
      to: email,
      simulated: result.simulated || false,
    })
  } else {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        tip: 'Verificá que RESEND_API_KEY esté configurada y el dominio verificado en Resend.',
      },
      { status: 500 },
    )
  }
}

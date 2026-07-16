#!/usr/bin/env python3
"""Genera un PDF de la guía de publicación (DEPLOY.md) de AutoSync."""

import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, ListFlowable, ListItem, KeepTogether,
    HRFlowable, Preformatted
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Registrar fuentes con soporte para español
font_paths = {
    'NotoSans': '/usr/share/fonts/truetype/chinese/NotoSansSC-Regular.ttf',
    'NotoSans-Bold': '/usr/share/fonts/truetype/chinese/NotoSansSC-Bold.ttf',
    'NotoSerif': '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf',
    'NotoSerif-Bold': '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf',
    'Mono': '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
}

for name, path in font_paths.items():
    if os.path.exists(path):
        try:
            pdfmetrics.registerFont(TTFont(name, path))
        except:
            pass

# Verificar qué fuentes se cargaron
has_noto = 'NotoSans' in pdfmetrics.getRegisteredFontNames()
has_mono = 'Mono' in pdfmetrics.getRegisteredFontNames()

BODY_FONT = 'NotoSans' if has_noto else 'Helvetica'
BOLD_FONT = 'NotoSans-Bold' if has_noto else 'Helvetica-Bold'
MONO_FONT = 'Mono' if has_mono else 'Courier'

# Colores de AutoSync (paleta ámbar/zinc)
COLOR_PRIMARY = HexColor('#f59e0b')  # amber-500
COLOR_DARK = HexColor('#18181b')     # zinc-900
COLOR_TEXT = HexColor('#27272a')     # zinc-800
COLOR_MUTED = HexColor('#71717a')    # zinc-500
COLOR_LIGHT = HexColor('#f4f4f5')    # zinc-100
COLOR_CODE_BG = HexColor('#1e1e1e')  # dark code background
COLOR_CODE_TEXT = HexColor('#e4e4e7')  # light code text
COLOR_GREEN = HexColor('#22c55e')
COLOR_RED = HexColor('#ef4444')

# ============ ESTILOS ============
styles = getSampleStyleSheet()

style_title = ParagraphStyle(
    'CustomTitle', parent=styles['Title'],
    fontName=BOLD_FONT, fontSize=28, leading=34,
    textColor=COLOR_DARK, spaceAfter=6, alignment=TA_LEFT,
)
style_subtitle = ParagraphStyle(
    'CustomSubtitle', parent=styles['Normal'],
    fontName=BODY_FONT, fontSize=14, leading=18,
    textColor=COLOR_MUTED, spaceAfter=20, alignment=TA_LEFT,
)
style_h1 = ParagraphStyle(
    'CustomH1', parent=styles['Heading1'],
    fontName=BOLD_FONT, fontSize=20, leading=26,
    textColor=COLOR_DARK, spaceBefore=24, spaceAfter=12,
    borderPadding=0,
)
style_h2 = ParagraphStyle(
    'CustomH2', parent=styles['Heading2'],
    fontName=BOLD_FONT, fontSize=16, leading=22,
    textColor=COLOR_PRIMARY, spaceBefore=18, spaceAfter=8,
)
style_h3 = ParagraphStyle(
    'CustomH3', parent=styles['Heading3'],
    fontName=BOLD_FONT, fontSize=13, leading=18,
    textColor=COLOR_TEXT, spaceBefore=12, spaceAfter=6,
)
style_body = ParagraphStyle(
    'CustomBody', parent=styles['Normal'],
    fontName=BODY_FONT, fontSize=10.5, leading=15,
    textColor=COLOR_TEXT, spaceAfter=6, alignment=TA_JUSTIFY,
)
style_bullet = ParagraphStyle(
    'CustomBullet', parent=style_body,
    leftIndent=20, bulletIndent=8, spaceAfter=4,
)
style_code = ParagraphStyle(
    'CustomCode', parent=styles['Code'],
    fontName=MONO_FONT, fontSize=8.5, leading=12,
    textColor=COLOR_CODE_TEXT, backColor=COLOR_CODE_BG,
    leftIndent=12, rightIndent=12, spaceBefore=4, spaceAfter=8,
    borderPadding=8,
)
style_note = ParagraphStyle(
    'CustomNote', parent=style_body,
    fontSize=10, textColor=COLOR_MUTED, leftIndent=16,
    spaceBefore=4, spaceAfter=8,
)
style_table_header = ParagraphStyle(
    'TableHeader', parent=style_body,
    fontName=BOLD_FONT, fontSize=9, leading=12,
    textColor=HexColor('#ffffff'), alignment=TA_LEFT,
)
style_table_cell = ParagraphStyle(
    'TableCell', parent=style_body,
    fontSize=9, leading=12, alignment=TA_LEFT, spaceAfter=0,
)

def make_code_block(text):
    """Crea un bloque de código con fondo oscuro."""
    # Escapar caracteres HTML
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    # Preservar espacios
    text = text.replace(' ', '&nbsp;')
    text = text.replace('\n', '<br/>')
    return Paragraph(text, style_code)

def make_table(headers, rows):
    """Crea una tabla con estilo."""
    data = [[Paragraph(h, style_table_header) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), style_table_cell) for c in row])

    col_widths = [None] * len(headers)
    # Calcular anchos proporcionales
    total = 440  # ancho disponible aproximado
    if len(headers) == 2:
        col_widths = [total * 0.4, total * 0.6]
    elif len(headers) == 3:
        col_widths = [total * 0.25, total * 0.35, total * 0.40]
    elif len(headers) == 4:
        col_widths = [total * 0.20, total * 0.30, total * 0.25, total * 0.25]
    else:
        col_widths = [total / len(headers)] * len(headers)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), BOLD_FONT),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), HexColor('#fafafa')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#ffffff'), HexColor('#f9fafb')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e4e4e7')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    return t

# ============ HEADER Y FOOTER ============
def header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4

    # Header (solo en páginas después de la primera)
    if doc.page > 1:
        canvas.setFillColor(COLOR_DARK)
        canvas.rect(0, height - 1.2 * cm, width, 1.2 * cm, fill=1, stroke=0)
        canvas.setFillColor(HexColor('#ffffff'))
        canvas.setFont(BOLD_FONT, 10)
        canvas.drawString(2 * cm, height - 0.8 * cm, 'AutoSync - Guía de Publicación')
        canvas.setFont(BODY_FONT, 8)
        canvas.drawRightString(width - 2 * cm, height - 0.8 * cm, 'autosync.com.ar')

    # Footer
    canvas.setStrokeColor(HexColor('#e4e4e7'))
    canvas.setLineWidth(0.5)
    canvas.line(2 * cm, 1.2 * cm, width - 2 * cm, 1.2 * cm)
    canvas.setFillColor(COLOR_MUTED)
    canvas.setFont(BODY_FONT, 8)
    canvas.drawString(2 * cm, 0.7 * cm, 'AutoSync - Taller Mecánico · Mar del Plata')
    canvas.drawRightString(width - 2 * cm, 0.7 * cm, f'Página {doc.page}')

    canvas.restoreState()

# ============ CONTENIDO DEL PDF ============
def build_story():
    story = []

    # ============ PORTADA ============
    story.append(Spacer(1, 4 * cm))

    # Banda ámbar superior
    band = Table([['']], colWidths=[16 * cm], rowHeights=[0.4 * cm])
    band.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), COLOR_PRIMARY)]))
    story.append(band)
    story.append(Spacer(1, 1 * cm))

    story.append(Paragraph('Guía de Publicación', style_title))
    story.append(Paragraph('AutoSync - Centro Integral Automotriz', style_subtitle))
    story.append(Spacer(1, 0.5 * cm))

    story.append(Paragraph(
        'Paso a paso para publicar la web en internet con dominio .com.ar '
        'y mails automáticos.',
        ParagraphStyle('Intro', parent=style_body, fontSize=12, leading=18,
                       textColor=COLOR_MUTED)
    ))
    story.append(Spacer(1, 1 * cm))

    # Tabla resumen
    story.append(make_table(
        ['Recurso', 'Costo', 'Dónde'],
        [
            ['Cuenta en Vercel', 'GRATIS', 'vercel.com'],
            ['Cuenta en Resend', 'GRATIS (100 mails/día)', 'resend.com'],
            ['Cuenta en GitHub', 'GRATIS', 'github.com'],
            ['Dominio .com.ar', '~$2.000-3.000 ARS/año', 'nic.ar o DonWeb'],
            ['Hosting', 'GRATIS', 'Vercel'],
        ]
    ))
    story.append(Spacer(1, 1 * cm))

    story.append(Paragraph(
        '<b>Tiempo total estimado:</b> 1-2 horas',
        style_note
    ))

    story.append(PageBreak())

    # ============ ÍNDICE DE PASOS ============
    story.append(Paragraph('Resumen de pasos', style_h1))
    story.append(Spacer(1, 0.3 * cm))

    pasos = [
        ['1.', 'Crear cuentas', '15 min', 'GitHub, Vercel, Resend'],
        ['2.', 'Subir código a GitHub', '10 min', 'Desde tu computadora'],
        ['3.', 'Publicar en Vercel', '10 min', 'Deploy automático'],
        ['4.', 'Configurar mails (Resend)', '15 min', 'API key + variables'],
        ['5.', 'Comprar dominio .com.ar', '10 min', 'Nic.ar o DonWeb'],
        ['6.', 'Conectar dominio a Vercel', '15 min', 'Configurar DNS'],
        ['7.', 'Verificar dominio en Resend', '15 min', 'Para mails automáticos'],
        ['8.', 'Probar todo', '10 min', 'Test final'],
    ]

    story.append(make_table(
        ['#', 'Paso', 'Tiempo', 'Detalle'],
        pasos
    ))

    story.append(PageBreak())

    # ============ PASO 1 ============
    story.append(Paragraph('1. Crear cuentas (gratis)', style_h1))
    story.append(Paragraph(
        'Necesitás crear tres cuentas gratuitas. Todas son gratuitas y no '
        'requieren tarjeta de crédito para empezar. GitHub es donde vas a '
        'subir el código de tu web, Vercel es el hosting gratuito que va a '
        'mantener tu web online las 24 horas, y Resend es el servicio que '
        'va a mandar los mails automáticos a tus clientes cuando tengan un '
        'service o VTV por vencer.',
        style_body
    ))

    story.append(Paragraph('GitHub', style_h2))
    story.append(Paragraph(
        '1. Andá a https://github.com/signup', style_body))
    story.append(Paragraph('2. Creá una cuenta con tu email', style_body))
    story.append(Paragraph(
        '3. Elegí un nombre de usuario (ej: taller-autosync)', style_body))

    story.append(Paragraph('Vercel', style_h2))
    story.append(Paragraph('1. Andá a https://vercel.com/signup', style_body))
    story.append(Paragraph(
        '2. Elegí "Continue with GitHub" (usá la cuenta que creaste arriba)',
        style_body))
    story.append(Paragraph(
        '3. Autorizá a Vercel a acceder a tu GitHub', style_body))

    story.append(Paragraph('Resend (para mails automáticos)', style_h2))
    story.append(Paragraph('1. Andá a https://resend.com/signup', style_body))
    story.append(Paragraph('2. Creá una cuenta con tu email', style_body))
    story.append(Paragraph(
        '3. En el dashboard, vas a ver tu API Key (la vas a necesitar después)',
        style_body))

    story.append(PageBreak())

    # ============ PASO 2 ============
    story.append(Paragraph('2. Subir el código a GitHub', style_h1))
    story.append(Paragraph(
        'El código del proyecto está en el archivo autosync-proyecto.zip '
        'que descargaste. Tenés que descomprimirlo y subirlo a GitHub para '
        'que Vercel pueda publicarlo automáticamente.',
        style_body
    ))

    story.append(Paragraph('Opción A: Desde tu computadora (recomendada)', style_h2))
    story.append(Paragraph(
        '1. Descargá el archivo autosync-proyecto.zip', style_body))
    story.append(Paragraph('2. Descomprimilo en una carpeta', style_body))
    story.append(Paragraph(
        '3. Abrí una terminal en esa carpeta y ejecutá estos comandos:',
        style_body))

    story.append(make_code_block(
        '# Inicializar repositorio git\n'
        'git init\n'
        'git add .\n'
        'git commit -m "AutoSync - versión inicial"\n'
        '\n'
        '# Crear repositorio en GitHub (desde la web de GitHub)\n'
        '# Después conectalo:\n'
        'git remote add origin https://github.com/TU_USUARIO/autosync.git\n'
        'git branch -M main\n'
        'git push -u origin main'
    ))

    story.append(Paragraph('Opción B: Subir desde la web de GitHub', style_h2))
    story.append(Paragraph(
        '1. En GitHub, hacé clic en "New repository"', style_body))
    story.append(Paragraph('2. Nombralo autosync', style_body))
    story.append(Paragraph(
        '3. Hacé clic en "uploading an existing file"', style_body))
    story.append(Paragraph(
        '4. Arrastrá todos los archivos del proyecto', style_body))
    story.append(Paragraph('5. Hacé clic en "Commit changes"', style_body))

    story.append(PageBreak())

    # ============ PASO 3 ============
    story.append(Paragraph('3. Publicar en Vercel', style_h1))
    story.append(Paragraph(
        'Vercel es el hosting gratuito que va a mantener tu web online. '
        'Se conecta directamente con GitHub y publica automáticamente cada '
        'vez que hacés un cambio en el código. El plan gratuito es más que '
        'suficiente para un taller mecánico.',
        style_body
    ))

    story.append(Paragraph(
        '1. Andá a https://vercel.com/new', style_body))
    story.append(Paragraph(
        '2. Elegí tu repositorio autosync de GitHub', style_body))
    story.append(Paragraph(
        '3. Vercel detecta Next.js automáticamente, no toques nada',
        style_body))
    story.append(Paragraph('4. Hacé clic en "Deploy"', style_body))
    story.append(Paragraph(
        '5. ¡Esperá 2-3 minutos y ya está online!', style_body))

    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph(
        'Tu web va a estar en una dirección tipo:',
        style_body))
    story.append(make_code_block('https://autosync-xxxxx.vercel.app'))

    story.append(Paragraph(
        'IMPORTANTE: Configurar variables de entorno', style_h2))
    story.append(Paragraph(
        'Antes de que funcione todo, tenés que configurar las variables en '
        'Vercel. En Vercel, andá a tu proyecto, luego a Settings, luego a '
        'Environment Variables. Agregá estas variables una por una:',
        style_body
    ))

    story.append(make_table(
        ['Nombre', 'Valor'],
        [
            ['ADMIN_PIN', '1989 (o el PIN que quieras)'],
            ['DATABASE_URL', 'Ver paso siguiente (PostgreSQL)'],
        ]
    ))

    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        'IMPORTANTE: Vercel no soporta SQLite (es solo para desarrollo). '
        'Tenés que usar PostgreSQL gratis. En Vercel, andá a Storage, luego '
        'Create Database, luego Postgres (Neon). Llamalo autosync-db. Una '
        'vez creado, hacé clic en Connect to project. Vercel te va a dar '
        'una DATABASE_URL automáticamente.',
        style_body
    ))

    story.append(Paragraph(
        'Después, en el archivo prisma/schema.prisma, cambiá el provider '
        'de sqlite a postgresql:', style_body))

    story.append(make_code_block(
        'datasource db {\n'
        '  provider = "postgresql"  // cambiar de sqlite\n'
        '  url      = env("DATABASE_URL")\n'
        '}'
    ))

    story.append(Paragraph(
        'Subí ese cambio a GitHub y Vercel lo va a deployar automáticamente.',
        style_body
    ))

    story.append(PageBreak())

    # ============ PASO 4 ============
    story.append(Paragraph('4. Configurar mails con Resend', style_h1))
    story.append(Paragraph(
        'Resend es el servicio que manda los mails automáticos a tus '
        'clientes. Es gratis hasta 100 mails por día, lo cual es más que '
        'suficiente para un taller. Los mails se mandan automáticamente '
        'cuando un cliente tiene un service, VTV o GNC por vencer.',
        style_body
    ))

    story.append(Paragraph(
        '1. Andá a https://resend.com/dashboard', style_body))
    story.append(Paragraph(
        '2. Copiá tu API Key (empieza con re_...)', style_body))
    story.append(Paragraph(
        '3. En Vercel, agregá esta variable de entorno:', style_body))

    story.append(make_table(
        ['Nombre', 'Valor'],
        [
            ['RESEND_API_KEY', 're_tu_api_key_aqui'],
            ['RESEND_FROM_EMAIL', 'notificaciones@autosync.com.ar'],
            ['RESEND_FROM_NAME', 'AutoSync - Taller Mecánico'],
            ['CRON_SECRET', '(generá uno aleatorio de 32 caracteres)'],
        ]
    ))

    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph('Probar que el email funcione', style_h2))
    story.append(Paragraph(
        'Para esto, Resend te da un email de prueba gratis: '
        'delivered@resend.dev. Desde una terminal ejecutá:',
        style_body
    ))

    story.append(make_code_block(
        'curl "https://TU-DOMINIO.vercel.app/api/cron/test-email'
        '?email=delivered@resend.dev" \\\n'
        '  -H "x-admin-pin: TU_PIN"'
    ))

    story.append(Paragraph(
        'Si devuelve {"ok": true}, los mails funcionan correctamente.',
        style_body
    ))

    story.append(PageBreak())

    # ============ PASO 5 ============
    story.append(Paragraph('5. Comprar dominio .com.ar', style_h1))
    story.append(Paragraph(
        'El dominio es la dirección de tu web en internet (ej: '
        'autosync.com.ar). Es lo que vas a poner en tarjetas, flyers y '
        'dar a conocer a tus clientes. Tenés dos opciones para comprarlo.',
        style_body
    ))

    story.append(Paragraph('Opción A: Nic.ar (más barato)', style_h2))
    story.append(Paragraph('1. Andá a https://nic.ar', style_body))
    story.append(Paragraph('2. Buscá tu dominio: autosync.com.ar', style_body))
    story.append(Paragraph(
        '3. Si está libre, compralo (aprox. $2.500 ARS/año)', style_body))
    story.append(Paragraph(
        '4. Vas a recibir un email con instrucciones para pagarlo por '
        'transferencia o PagoFácil', style_body
    ))

    story.append(Paragraph('Opción B: DonWeb o Hostinger (más fácil)', style_h2))
    story.append(Paragraph('1. Andá a https://donweb.com', style_body))
    story.append(Paragraph('2. Buscá autosync.com.ar', style_body))
    story.append(Paragraph(
        '3. Compralo con tarjeta de crédito (aprox. $3.000 ARS/año)',
        style_body))

    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        'Recomendación: Si no tenés experiencia con dominios, usá DonWeb. '
        'Es un poco más caro pero mucho más simple de configurar.',
        style_body
    ))

    story.append(PageBreak())

    # ============ PASO 6 ============
    story.append(Paragraph('6. Conectar dominio a Vercel', style_h1))
    story.append(Paragraph(
        'Una vez que compraste el dominio, tenés que conectarlo a Vercel '
        'para que cuando alguien escriba autosync.com.ar en el navegador, '
        'vea tu web. Esto se hace configurando los DNS del dominio.',
        style_body
    ))

    story.append(Paragraph(
        '1. En Vercel, andá a tu proyecto, luego Settings, luego Domains',
        style_body))
    story.append(Paragraph(
        '2. Escribí autosync.com.ar y hacé clic en "Add"', style_body))
    story.append(Paragraph(
        '3. También agregá www.autosync.com.ar', style_body))
    story.append(Paragraph(
        '4. Vercel te va a dar instrucciones de qué DNS configurar',
        style_body))

    story.append(Paragraph('Configurar DNS en Nic.ar / DonWeb', style_h2))
    story.append(Paragraph(
        'Andá al panel de tu registrador de dominio y configurá estos '
        'registros DNS:', style_body
    ))

    story.append(Paragraph('Registro A:', style_h3))
    story.append(make_code_block(
        'Tipo: A\n'
        'Nombre: @\n'
        'Valor: 76.76.21.21'
    ))

    story.append(Paragraph('Registro CNAME:', style_h3))
    story.append(make_code_block(
        'Tipo: CNAME\n'
        'Nombre: www\n'
        'Valor: cname.vercel-dns.com'
    ))

    story.append(Paragraph(
        'Esperá de 5 minutos a 24 horas para que se propaguen los DNS '
        '(suele tardar 30 minutos). Tu web va a estar accesible en:',
        style_body
    ))
    story.append(make_code_block('https://autosync.com.ar'))

    story.append(PageBreak())

    # ============ PASO 7 ============
    story.append(Paragraph('7. Verificar dominio en Resend', style_h1))
    story.append(Paragraph(
        'Para poder mandar mails desde notificaciones@autosync.com.ar, '
        'tenés que verificar el dominio en Resend. Esto es obligatorio '
        'para que los mails no lleguen a spam. Resend te va a dar unos '
        'registros DNS que tenés que agregar en el panel de tu dominio.',
        style_body
    ))

    story.append(Paragraph(
        '1. Andá a https://resend.com/domains', style_body))
    story.append(Paragraph('2. Hacé clic en "Add Domain"', style_body))
    story.append(Paragraph('3. Escribí autosync.com.ar', style_body))
    story.append(Paragraph(
        '4. Resend te va a dar registros DNS para agregar', style_body))

    story.append(Paragraph('Ejemplo (los valores reales te los da Resend):', style_h3))
    story.append(make_code_block(
        'Tipo: MX\n'
        'Nombre: bounce.autosync.com.ar\n'
        'Valor: feedback-smtp.us-east-1.amazonses.com\n'
        '\n'
        'Tipo: TXT\n'
        'Nombre: @\n'
        'Valor: "v=spf1 include:amazonses.com ~all"\n'
        '\n'
        'Tipo: TXT\n'
        'Nombre: resend._domainkey\n'
        'Valor: "v=DKIM1; k=rsa; p=..."'
    ))

    story.append(Paragraph(
        '5. Agregá esos registros en el panel de tu registrador de dominio',
        style_body))
    story.append(Paragraph(
        '6. Volvé a Resend y hacé clic en "Verify" (puede tardar hasta '
        '48 horas, pero suele ser rápido)', style_body))

    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        'Listo! Ahora podés mandar mails desde notificaciones@autosync.com.ar',
        style_body
    ))

    story.append(PageBreak())

    # ============ PASO 8 ============
    story.append(Paragraph('8. Probar todo', style_h1))
    story.append(Paragraph(
        'Antes de dar por terminado el proyecto, es importante probar que '
        'todo funcione correctamente. Estos son los tests que tenés que '
        'hacer para asegurarte de que tu web está 100% operativa.',
        style_body
    ))

    story.append(Paragraph('Probar la web', style_h2))
    story.append(Paragraph('1. Entrá a https://autosync.com.ar', style_body))
    story.append(Paragraph('2. Probá registrar un vehículo', style_body))
    story.append(Paragraph('3. Probá consultar el historial por patente', style_body))
    story.append(Paragraph('4. Entrá al panel admin con tu PIN', style_body))

    story.append(Paragraph('Probar los mails', style_h2))
    story.append(Paragraph('Mandar email de test:', style_body))
    story.append(make_code_block(
        'curl "https://autosync.com.ar/api/cron/test-email'
        '?email=tu-email@gmail.com" \\\n'
        '  -H "x-admin-pin: TU_PIN"'
    ))

    story.append(Paragraph('Ejecutar el cron manualmente:', style_body))
    story.append(make_code_block(
        'curl "https://autosync.com.ar/api/cron/recordatorios" \\\n'
        '  -H "Authorization: Bearer TU_CRON_SECRET"'
    ))

    story.append(Paragraph(
        'Te va a devolver un JSON con cuántos mails se mandaron.',
        style_body
    ))

    story.append(PageBreak())

    # ============ MIGRACIÓN BD ============
    story.append(Paragraph('Migración de base de datos', style_h1))
    story.append(Paragraph(
        'IMPORTANTE: Como cambiaste de SQLite (desarrollo) a PostgreSQL '
        '(producción), tenés que crear las tablas en la nueva base de datos '
        'y cargar los datos iniciales. Esto se hace una sola vez desde tu '
        'computadora.',
        style_body
    ))

    story.append(Paragraph(
        'Desde tu computadora, en la carpeta del proyecto, ejecutá:',
        style_body
    ))

    story.append(make_code_block(
        '# 1. Instalar dependencias\n'
        'bun install\n'
        '\n'
        '# 2. Configurar temporalmente la URL de producción\n'
        '# Editá el archivo .env y poné la DATABASE_URL de Vercel\n'
        '\n'
        '# 3. Crear las tablas\n'
        'bunx prisma db push\n'
        '\n'
        '# 4. Cargar datos iniciales (servicios)\n'
        'bun run scripts/seed.ts\n'
        '\n'
        '# 5. Cargar cronogramas\n'
        'bun run scripts/seed-cronogramas.ts\n'
        'bun run scripts/seed-cronogramas-extra.ts\n'
        'bun run scripts/seed-km-altos.ts\n'
        'bun run scripts/seed-modelos-faltantes.ts\n'
        '\n'
        '# 6. Restaurar el .env original (SQLite local)\n'
    ))

    story.append(PageBreak())

    # ============ PROBLEMAS COMUNES ============
    story.append(Paragraph('Problemas comunes y soluciones', style_h1))
    story.append(Paragraph(
        'Si tenés problemas en algún paso, estos son los más comunes y '
        'cómo resolverlos.',
        style_body
    ))

    story.append(make_table(
        ['Problema', 'Solución'],
        [
            ['No funciona el panel admin',
             'Olvidaste configurar ADMIN_PIN en Vercel'],
            ['No se ven los vehículos',
             'No creaste las tablas en PostgreSQL (prisma db push)'],
            ['No llegan los mails',
             'Falta verificar el dominio en Resend'],
            ['El dominio no funciona',
             'Los DNS todavía no se propagaron (esperá 24hs)'],
            ['Error 500 en la web',
             'Falta configurar DATABASE_URL en Vercel'],
            ['No puedo subir fotos',
             'Verificá que la carpeta uploads tenga permisos'],
        ]
    ))

    story.append(PageBreak())

    # ============ CHECKLIST ============
    story.append(Paragraph('Checklist final', style_h1))
    story.append(Paragraph(
        'Marcá cada item cuando lo completes para asegurarte de no olvidar '
        'nada.',
        style_body
    ))

    story.append(Spacer(1, 0.3 * cm))

    items = [
        'Cuenta de GitHub creada',
        'Código subido a GitHub',
        'Cuenta de Vercel creada',
        'Proyecto deployado en Vercel',
        'Base de datos PostgreSQL creada y conectada',
        'Variables de entorno configuradas (ADMIN_PIN, DATABASE_URL)',
        'Tablas creadas en PostgreSQL (prisma db push)',
        'Datos iniciales cargados (seeds)',
        'Cuenta de Resend creada',
        'API key de Resend en Vercel',
        'Dominio .com.ar comprado',
        'Dominio conectado a Vercel',
        'Dominio verificado en Resend',
        'Email de test funcionando',
        'Cron de recordatorios configurado',
    ]

    for item in items:
        story.append(Paragraph(
            f'&#9744; &nbsp; {item}',
            ParagraphStyle('Checklist', parent=style_body, fontSize=11,
                          leading=18, leftIndent=12, spaceAfter=6)
        ))

    story.append(Spacer(1, 1 * cm))

    story.append(Paragraph(
        '¡Cuando tengas todo esto, tu web va a estar 100% operativa con '
        'mails automáticos!',
        ParagraphStyle('Final', parent=style_body, fontSize=12,
                      leading=18, textColor=COLOR_PRIMARY,
                      fontName=BOLD_FONT)
    ))

    return story

# ============ GENERAR PDF ============
def main():
    output_path = '/home/z/my-project/download/AutoSync-Guia-Publicacion.pdf'

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title='AutoSync - Guía de Publicación',
        author='AutoSync',
        subject='Guía paso a paso para publicar la web con dominio .com.ar',
        creator='AutoSync',
    )

    story = build_story()
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)

    size = os.path.getsize(output_path)
    print(f'✓ PDF generado: {output_path}')
    print(f'  Tamaño: {size / 1024:.1f} KB')

if __name__ == '__main__':
    main()

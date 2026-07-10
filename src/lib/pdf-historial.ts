import { jsPDF } from 'jspdf'
import { formatFecha } from './format'

interface TrabajoPDF {
  id: string
  titulo: string
  descripcion: string
  estado: string
  fecha: string
  kilometraje: number | null
  proximo: string | null
  servicio: { nombre: string; categoria: string } | null
}

interface VehiculoPDF {
  id: string
  marca: string
  modelo: string
  anio: number
  patente: string
  color: string | null
  kilometraje: number | null
  tipo: string
  combustible: string | null
  notas: string | null
  cliente: {
    nombre: string
    telefono: string
    email: string | null
  }
  trabajos: TrabajoPDF[]
}

export function generarPDFHistorial(v: VehiculoPDF) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // ============ HEADER ============
  // Banda ámbar superior
  doc.setFillColor(245, 158, 11) // amber-500
  doc.rect(0, 0, pageWidth, 22, 'F')

  // Logo / Nombre
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('AutoSync', margin, 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Taller Mecánico · Mar del Plata', margin, 19)

  // Fecha de emisión
  doc.setFontSize(8)
  doc.text(
    `Emitido: ${formatFecha(new Date())}`,
    pageWidth - margin,
    13,
    { align: 'right' },
  )
  doc.text(
    'Falucho 4657 · (0223) 594-1522',
    pageWidth - margin,
    19,
    { align: 'right' },
  )

  y = 32

  // ============ TÍTULO ============
  doc.setTextColor(20, 20, 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Historial de servicios del vehículo', margin, y)
  y += 7

  // Línea separadora
  doc.setDrawColor(245, 158, 11)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // ============ DATOS DEL VEHÍCULO ============
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(20, 20, 20)
  doc.text(`${v.marca} ${v.modelo}`, margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)

  const patenteText = `Patente: ${v.patente}    Año: ${v.anio}    Tipo: ${v.tipo}${v.combustible ? `    Combustible: ${v.combustible}` : ''}`
  doc.text(patenteText, margin, y)
  y += 5

  const colorText = `Color: ${v.color || '—'}    Kilometraje: ${v.kilometraje ? v.kilometraje.toLocaleString('es-AR') + ' km' : '—'}`
  doc.text(colorText, margin, y)
  y += 8

  // ============ DATOS DEL TITULAR ============
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y, contentWidth, 18, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text('TITULAR', margin + 3, y + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text(`Nombre: ${v.cliente.nombre}`, margin + 3, y + 10)
  doc.text(
    `Teléfono: ${v.cliente.telefono}${v.cliente.email ? `    Email: ${v.cliente.email}` : ''}`,
    margin + 3,
    y + 15,
  )
  y += 24

  // ============ HISTORIAL DE TRABAJOS ============
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(20, 20, 20)
  doc.text(
    `Trabajos realizados (${v.trabajos.length})`,
    margin,
    y,
  )
  y += 6

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  if (v.trabajos.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text('Sin trabajos registrados aún.', margin, y + 5)
  } else {
    // Por cada trabajo (ordenado del más reciente al más viejo)
    v.trabajos.forEach((t, idx) => {
      // Verificar si necesitamos nueva página
      if (y > pageHeight - 40) {
        doc.addPage()
        y = margin
      }

      // Badge de número
      doc.setFillColor(245, 158, 11)
      doc.circle(margin + 4, y + 2, 4, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(String(v.trabajos.length - idx), margin + 4, y + 3, {
        align: 'center',
      })

      // Título del trabajo
      doc.setTextColor(20, 20, 20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(t.titulo, margin + 10, y + 3)

      // Estado
      const estadoColor =
        t.estado === 'Completado'
          ? [16, 185, 129]
          : t.estado === 'En proceso'
            ? [245, 158, 11]
            : [120, 120, 120]
      doc.setTextColor(estadoColor[0], estadoColor[1], estadoColor[2])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(t.estado.toUpperCase(), pageWidth - margin, y + 3, {
        align: 'right',
      })

      y += 7

      // Fecha y km
      doc.setTextColor(100, 100, 100)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const metaLine = `Fecha: ${formatFecha(t.fecha)}${t.kilometraje != null ? `    ·    Kilometraje: ${t.kilometraje.toLocaleString('es-AR')} km` : ''}${t.servicio ? `    ·    Categoría: ${t.servicio.categoria}` : ''}`
      doc.text(metaLine, margin + 10, y)
      y += 5

      // Descripción (con wrap)
      const descLines = doc.splitTextToSize(t.descripcion, contentWidth - 10)
      doc.setTextColor(50, 50, 50)
      doc.setFontSize(9)
      doc.text(descLines, margin + 10, y)
      y += descLines.length * 4 + 2

      // Próxima revisión
      if (t.proximo) {
        if (y > pageHeight - 30) {
          doc.addPage()
          y = margin
        }
        doc.setFillColor(254, 243, 199) // amber-100
        doc.rect(margin + 10, y - 3, contentWidth - 10, 5, 'F')
        doc.setTextColor(146, 64, 14) // amber-800
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.text(`Próxima revisión: ${t.proximo}`, margin + 12, y + 0.5)
        y += 7
      }

      // Separador entre trabajos
      y += 3
      if (idx < v.trabajos.length - 1) {
        doc.setDrawColor(235, 235, 235)
        doc.setLineWidth(0.2)
        doc.line(margin, y, pageWidth - margin, y)
        y += 4
      }
    })
  }

  // ============ NOTAS (si existen) ============
  if (v.notas) {
    if (y > pageHeight - 40) {
      doc.addPage()
      y = margin
    }
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(20, 20, 20)
    doc.text('Notas registradas', margin, y)
    y += 5
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageWidth - margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    const notasLines = doc.splitTextToSize(v.notas, contentWidth)
    doc.text(notasLines, margin, y)
    y += notasLines.length * 4 + 5
  }

  // ============ FOOTER en cada página ============
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    // Línea separadora del footer
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)
    // Texto footer
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(140, 140, 140)
    doc.text(
      'AutoSync · Taller Mecánico · Falucho 4657, Mar del Plata · (0223) 594-1522',
      margin,
      pageHeight - 7,
    )
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin,
      pageHeight - 7,
      { align: 'right' },
    )
  }

  // Descargar
  const nombreArchivo = `AutoSync-Historial-${v.patente}.pdf`
  doc.save(nombreArchivo)
}

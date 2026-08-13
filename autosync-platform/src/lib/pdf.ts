import { jsPDF } from 'jspdf'

interface TrabajoPDF {
  titulo: string
  descripcion: string
  precio: number
  estado: string
  fecha: string
  kilometraje: number | null
  proximaRevision: string | null
  taller: { nombre: string }
  servicio: { nombre: string; categoria: string } | null
  fotos: { url: string; categoria: string }[]
}

export function generarPDFHistorial(v: {
  patente: string
  marca: string
  modelo: string
  anio: number
  kilometraje: number | null
  color: string | null
  combustible: string | null
  trabajos: TrabajoPDF[]
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = 210, pageH = 297, margin = 15
  let y = margin

  // Header banda
  doc.setFillColor(245, 158, 11); doc.rect(0, 0, pageW, 22, 'F')
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(18)
  doc.text('AutoSync', margin, 13)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text('Historial Digital Automotor', margin, 19)
  doc.setFontSize(8)
  doc.text(`Emitido: ${new Date().toLocaleDateString('es-AR')}`, pageW - margin, 13, { align: 'right' })
  y = 32

  // Título
  doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'bold'); doc.setFontSize(14)
  doc.text('Historial de servicios del vehículo', margin, y); y += 7
  doc.setDrawColor(245, 158, 11); doc.setLineWidth(0.8); doc.line(margin, y, pageW - margin, y); y += 8

  // Datos vehículo
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
  doc.text(`${v.marca} ${v.modelo}`, margin, y); y += 5
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(80, 80, 80)
  doc.text(`Patente: ${v.patente}    Año: ${v.anio}    KM: ${v.kilometraje?.toLocaleString('es-AR') || '—'}`, margin, y); y += 8

  // Trabajos
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(20, 20, 20)
  doc.text(`Trabajos realizados (${v.trabajos.length})`, margin, y); y += 5
  doc.setDrawColor(220, 220, 220); doc.line(margin, y, pageW - margin, y); y += 5

  if (v.trabajos.length === 0) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(120, 120, 120)
    doc.text('Sin trabajos registrados.', margin, y + 5)
  } else {
    v.trabajos.forEach((t, idx) => {
      if (y > pageH - 40) { doc.addPage(); y = margin }
      // Número
      doc.setFillColor(245, 158, 11); doc.circle(margin + 4, y + 2, 4, 'F')
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
      doc.text(String(v.trabajos.length - idx), margin + 4, y + 3, { align: 'center' })
      // Título
      doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
      doc.text(t.titulo, margin + 10, y + 3)
      // Estado
      const ec = t.estado === 'COMPLETADO' ? [16, 185, 129] : [245, 158, 11]
      doc.setTextColor(ec[0], ec[1], ec[2]); doc.setFontSize(8)
      doc.text(t.estado, pageW - margin, y + 3, { align: 'right' })
      y += 6
      // Meta
      doc.setTextColor(100, 100, 100); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
      let meta = `Fecha: ${new Date(t.fecha).toLocaleDateString('es-AR')}`
      if (t.kilometraje) meta += `    KM: ${t.kilometraje.toLocaleString('es-AR')}`
      meta += `    Taller: ${t.taller.nombre}`
      doc.text(meta, margin + 10, y); y += 5
      // Descripción
      const descLines = doc.splitTextToSize(t.descripcion, pageW - margin * 2 - 10)
      doc.setTextColor(50, 50, 50); doc.setFontSize(9)
      doc.text(descLines, margin + 10, y); y += descLines.length * 4 + 2
      // Fotos count
      if (t.fotos.length > 0) {
        doc.setTextColor(100, 100, 100); doc.setFontSize(8)
        doc.text(`📷 ${t.fotos.length} foto(s)`, margin + 10, y); y += 4
      }
      y += 3
      if (idx < v.trabajos.length - 1) { doc.setDrawColor(235, 235, 235); doc.line(margin, y, pageW - margin, y); y += 4 }
    })
  }

  // Footer
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setDrawColor(220, 220, 220); doc.line(margin, pageH - 12, pageW - margin, pageH - 12)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140, 140, 140)
    doc.text('AutoSync - Historial Digital Automotor', margin, pageH - 7)
    doc.text(`Página ${i} de ${pages}`, pageW - margin, pageH - 7, { align: 'right' })
  }

  doc.save(`AutoSync-Historial-${v.patente}.pdf`)
}

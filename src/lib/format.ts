// Formatea un número como moneda argentina (ARS)
export function formatPrecio(valor: number | null | undefined): string {
  if (valor == null) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

// Formatea una fecha ISO a formato legible en español
export function formatFecha(iso: string | Date): string {
  const fecha = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fecha)
}

// Normaliza patente: AAA123 o AA123BB en mayúsculas sin espacios
export function normalizarPatente(p: string): string {
  return p
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]/g, '')
}

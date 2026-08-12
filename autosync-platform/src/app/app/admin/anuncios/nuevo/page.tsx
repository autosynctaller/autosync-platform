'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

export default function NuevoAnuncioPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    anuncianteNombre: '', anuncianteTipo: 'AUTOPARTISTA',
    titulo: '', descripcion: '', imagen: '', url: '', cta: 'Ver más',
    tipo: 'BANNER_HOME', inicio: new Date().toISOString().split('T')[0], fin: '',
    prioridad: '0', soloCiudad: '', soloMarca: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      // Por ahora, crear anunciante + anuncio en un solo endpoint
      // (se puede separar después)
      const res = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      router.push('/app/admin/anuncios')
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <Link href="/app/admin/anuncios" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Volver</Link>
      <h1 className="text-2xl font-bold">Nuevo anuncio</h1>
      {error && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-6">
        {/* Anunciante */}
        <div className="space-y-3 border-b border-border pb-4">
          <h2 className="text-sm font-semibold">Anunciante</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">Nombre del anunciante *</label><input value={form.anuncianteNombre} onChange={e => setForm({...form, anuncianteNombre: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Ej: Repuestos del Centro" /></div>
            <div><label className="text-xs font-medium">Tipo</label><select value={form.anuncianteTipo} onChange={e => setForm({...form, anuncianteTipo: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary"><option value="AUTOPARTISTA">Autopartista</option><option value="TALLER">Taller</option><option value="SEGURO">Seguro</option><option value="OTRO">Otro</option></select></div>
          </div>
        </div>
        {/* Anuncio */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Anuncio</h2>
          <div><label className="text-xs font-medium">Título *</label><input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Ej: Repuestos al mejor precio" /></div>
          <div><label className="text-xs font-medium">Descripción</label><input value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">URL de imagen</label><input value={form.imagen} onChange={e => setForm({...form, imagen: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="/uploads/banner.jpg" /></div>
            <div><label className="text-xs font-medium">URL destino *</label><input value={form.url} onChange={e => setForm({...form, url: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="https://repuestosdelcentro.com" /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">Texto del botón (CTA)</label><input value={form.cta} onChange={e => setForm({...form, cta: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Zona (dónde se muestra)</label><select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary"><option value="BANNER_HOME">Banner en home</option><option value="BANNER_SEARCH">Banner en búsqueda</option><option value="CARD_DIRECTORIO">Card en directorio</option><option value="SIDEBAR">Sidebar</option><option value="SPONSORED_LISTING">Listing patrocinado</option></select></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">Fecha inicio *</label><input type="date" value={form.inicio} onChange={e => setForm({...form, inicio: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Fecha fin (vacío = sin vencimiento)</label><input type="date" value={form.fin} onChange={e => setForm({...form, fin: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">Solo mostrar en ciudad</label><input value={form.soloCiudad} onChange={e => setForm({...form, soloCiudad: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Ej: Mar del Plata (vacío = todas)" /></div>
            <div><label className="text-xs font-medium">Solo mostrar para marca</label><input value={form.soloMarca} onChange={e => setForm({...form, soloMarca: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Ej: Toyota (vacío = todas)" /></div>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-1 inline h-4 w-4" />Crear anuncio</>}</button>
          <Link href="/app/admin/anuncios" className="rounded-lg border border-border px-4 py-2 text-sm">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}

'use client'
import { useState, useEffect, use } from 'react'
import { Loader2, ArrowLeft, Save, Edit, Trash2, Megaphone, ExternalLink, MousePointerClick, Eye } from 'lucide-react'
import Link from 'next/link'

export default function AnuncioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [anuncio, setAnuncio] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    fetch(`/api/admin/anuncios/${id}`, { credentials: 'include' }).then(r => r.json()).then(d => { setAnuncio(d.anuncio); setForm(d.anuncio || {}); setLoading(false) })
  }, [id])

  const guardar = async () => {
    setSaving(true)
    await fetch(`/api/admin/anuncios/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setEditing(false)
    fetch(`/api/admin/anuncios/${id}`, { credentials: 'include' }).then(r => r.json()).then(d => setAnuncio(d.anuncio))
  }

  const eliminar = async () => {
    if (!confirm('¿Eliminar este anuncio?')) return
    await fetch(`/api/admin/anuncios/${id}`, { method: 'DELETE', credentials: 'include' })
    window.location.href = '/app/admin/anuncios'
  }

  if (loading) return <Loader2 className="h-8 w-8 animate-spin text-primary" />
  if (!anuncio) return <p>No encontrado</p>

  const ctr = anuncio.impresiones > 0 ? ((anuncio.clicks / anuncio.impresiones) * 100).toFixed(2) : '0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/app/admin/anuncios" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Volver</Link>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted"><Edit className="mr-1 inline h-3 w-3" />{editing ? 'Cancelar' : 'Editar'}</button>
          <button onClick={eliminar} className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"><Trash2 className="mr-1 inline h-3 w-3" />Eliminar</button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100 text-amber-600"><Megaphone className="h-7 w-7" /></div>
          <div className="flex-1">
            {!editing ? (
              <>
                <h1 className="text-xl font-bold">{anuncio.titulo}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${anuncio.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{anuncio.estado}</span>
                  <span className="rounded border px-2 py-0.5 text-[10px] text-muted-foreground">{anuncio.tipo?.replace('_', ' ')}</span>
                  <span className="text-xs text-muted-foreground">Anunciante: {anuncio.anunciante?.nombre}</span>
                </div>
                {anuncio.descripcion && <p className="mt-2 text-sm text-muted-foreground">{anuncio.descripcion}</p>}
                {anuncio.url && <a href={anuncio.url} target="_blank" className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline"><ExternalLink className="h-3 w-3" />{anuncio.url}</a>}
              </>
            ) : (
              <div className="space-y-3">
                <div><label className="text-xs font-medium">Título</label><input value={form.titulo || ''} onChange={e => setForm({...form, titulo: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">Descripción</label><input value={form.descripcion || ''} onChange={e => setForm({...form, descripcion: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">URL</label><input value={form.url || ''} onChange={e => setForm({...form, url: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium">Estado</label><select value={form.estado || 'ACTIVO'} onChange={e => setForm({...form, estado: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="ACTIVO">Activo</option><option value="PAUSADO">Pausado</option><option value="VENCIDO">Vencido</option><option value="BORRADOR">Borrador</option></select></div>
                  <div><label className="text-xs font-medium">Tipo</label><select value={form.tipo || 'BANNER_HOME'} onChange={e => setForm({...form, tipo: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="BANNER_HOME">Banner Home</option><option value="BANNER_SEARCH">Banner Search</option><option value="CARD_DIRECTORIO">Card Directorio</option><option value="SIDEBAR">Sidebar</option><option value="SPONSORED_LISTING">Sponsored</option></select></div>
                </div>
                <button onClick={guardar} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4"><div className="mb-1 flex h-8 w-8 items-center justify-center rounded bg-blue-500/10 text-blue-600"><Eye className="h-4 w-4" /></div><p className="text-2xl font-bold">{anuncio.impresiones}</p><p className="text-xs text-muted-foreground">Impresiones</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="mb-1 flex h-8 w-8 items-center justify-center rounded bg-emerald-500/10 text-emerald-600"><MousePointerClick className="h-4 w-4" /></div><p className="text-2xl font-bold">{anuncio.clicks}</p><p className="text-xs text-muted-foreground">Clicks</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="mb-1 flex h-8 w-8 items-center justify-center rounded bg-amber-500/10 text-amber-600"><Megaphone className="h-4 w-4" /></div><p className="text-2xl font-bold">{ctr}%</p><p className="text-xs text-muted-foreground">CTR</p></div>
      </div>

      {/* Configuración */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Configuración</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Inicio:</span> {new Date(anuncio.inicio).toLocaleDateString('es-AR')}</div>
          <div><span className="text-muted-foreground">Fin:</span> {anuncio.fin ? new Date(anuncio.fin).toLocaleDateString('es-AR') : 'Sin vencimiento'}</div>
          <div><span className="text-muted-foreground">Prioridad:</span> {anuncio.Prioridad}</div>
          <div><span className="text-muted-foreground">Solo ciudad:</span> {anuncio.soloCiudad || 'Todas'}</div>
          <div><span className="text-muted-foreground">Solo marca:</span> {anuncio.soloMarca || 'Todas'}</div>
        </div>
      </div>
    </div>
  )
}

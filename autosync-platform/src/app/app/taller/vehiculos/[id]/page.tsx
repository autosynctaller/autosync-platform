'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Loader2, Plus, Calendar, Gauge, Wrench, Camera, X, ArrowLeft, Image as ImageIcon } from 'lucide-react'

interface Trabajo {
  id: string
  titulo: string
  descripcion: string
  precio: number
  estado: string
  fecha: string
  kilometraje: number | null
  proximaRevision: string | null
  notasInternas: string | null
  fotos: { id: string; url: string; descripcion: string | null; categoria: string }[]
  taller: { nombre: string }
  servicio: { nombre: string; categoria: string } | null
}

interface Vehiculo {
  id: string
  patente: string
  marca: string
  modelo: string
  anio: number
  color: string | null
  kilometraje: number | null
  tipo: string
  combustible: string | null
  vtvVencimiento: string | null
  gncVencimiento: string | null
  trabajos: Trabajo[]
}

export default function VehiculoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [vehiculoId, setVehiculoId] = useState('')

  useEffect(() => {
    params.then(p => {
      setVehiculoId(p.id)
      fetch(`/api/vehiculos/${p.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.vehiculo) setVehiculo(data.vehiculo)
          else router.push('/app/taller/vehiculos')
        })
        .finally(() => setLoading(false))
    })
  }, [params, router])

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!vehiculo) return null

  return (
    <div className="space-y-6">
      <Link href="/app/taller/vehiculos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a vehículos
      </Link>

      {/* Header del vehículo */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Car className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{vehiculo.marca} {vehiculo.modelo}</h1>
              <p className="text-sm text-muted-foreground">{vehiculo.anio} · {vehiculo.tipo}{vehiculo.combustible && ` · ${vehiculo.combustible}`}</p>
              <p className="mt-1 text-sm font-mono font-bold">{vehiculo.patente}</p>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 inline h-4 w-4" />Cargar trabajo
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {vehiculo.color && <span>Color: {vehiculo.color}</span>}
          {vehiculo.kilometraje && <span className="flex items-center gap-1"><Gauge className="h-4 w-4" />{vehiculo.kilometraje.toLocaleString('es-AR')} km</span>}
        </div>
      </div>

      {/* Formulario de nuevo trabajo */}
      {showForm && (
        <TrabajoForm vehiculoId={vehiculoId} kmActual={vehiculo.kilometraje} onClose={() => setShowForm(false)} onSaved={() => {
          setShowForm(false)
          fetch(`/api/vehiculos/${vehiculoId}`).then(r => r.json()).then(data => setVehiculo(data.vehiculo))
        }} />
      )}

      {/* Historial de trabajos */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Historial de trabajos ({vehiculo.trabajos.length})</h2>
        {vehiculo.trabajos.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Wrench className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Sin trabajos cargados todavía.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {vehiculo.trabajos.map((t) => (
              <li key={t.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{t.titulo}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${t.estado === 'COMPLETADO' ? 'bg-emerald-100 text-emerald-800' : t.estado === 'EN_PROCESO' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-800'}`}>{t.estado.replace('_', ' ')}</span>
                      {t.servicio && <span className="rounded border px-2 py-0.5 text-[10px] text-muted-foreground">{t.servicio.categoria}</span>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.descripcion}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(t.fecha).toLocaleDateString('es-AR')}</span>
                      {t.kilometraje && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{t.kilometraje.toLocaleString('es-AR')} km</span>}
                      <span>por {t.taller.nombre}</span>
                      {t.proximaRevision && <span className="text-primary">Próximo: {t.proximaRevision}</span>}
                    </div>
                    {/* Fotos del trabajo */}
                    {t.fotos.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {t.fotos.map(f => (
                          <div key={f.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border">
                            <img src={f.url} alt={f.descripcion || ''} className="h-full w-full object-cover" />
                            <span className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-center text-[8px] uppercase text-white">{f.categoria}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

// ============ FORMULARIO DE TRABAJO ============
function TrabajoForm({ vehiculoId, kmActual, onClose, onSaved }: { vehiculoId: string; kmActual: number | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    titulo: '', descripcion: '', precio: '', estado: 'COMPLETADO',
    fecha: new Date().toISOString().split('T')[0], kilometraje: kmActual?.toString() || '',
    proximaRevision: '', notasInternas: '',
  })
  const [fotos, setFotos] = useState<{ url: string; descripcion: string; categoria: string }[]>([])
  const [subiendo, setSubiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File, categoria: string) => {
    setSubiendo(true)
    try {
      const fd = new FormData()
      fd.append('foto', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setFotos(f => [...f, { url: data.url, descripcion: '', categoria }])
    } catch { setError('Error al subir foto') } finally { setSubiendo(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const res = await fetch(`/api/vehiculos/${vehiculoId}/trabajos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Subir fotos asociadas al trabajo
      if (data.trabajo?.id && fotos.length > 0) {
        for (const f of fotos) {
          await fetch(`/api/trabajos/${data.trabajo.id}/fotos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(f),
          })
        }
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally { setGuardando(false) }
  }

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Nuevo trabajo</h3>
        <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
      </div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium">Título *</label>
            <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Ej: Cambio de aceite" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Precio *</label>
            <input type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="35000" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Descripción *</label>
          <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Qué se hizo..." />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium">Fecha</label>
            <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Kilometraje</label>
            <input type="number" value={form.kilometraje} onChange={e => setForm({...form, kilometraje: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="85000" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Estado</label>
            <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary">
              <option value="COMPLETADO">Completado</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Próxima revisión</label>
          <input value={form.proximaRevision} onChange={e => setForm({...form, proximaRevision: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Ej: a los 95.000 km" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Notas internas (solo tu taller)</label>
          <textarea value={form.notasInternas} onChange={e => setForm({...form, notasInternas: e.target.value})} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="🔒 Solo vos ves esto..." />
        </div>

        {/* Fotos del trabajo */}
        <div>
          <label className="mb-1 block text-xs font-medium">Fotos del trabajo</label>
          <div className="flex flex-wrap gap-2">
            {fotos.map((f, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-md border border-border">
                <img src={f.url} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-center text-[8px] uppercase text-white">{f.categoria}</span>
                <button type="button" onClick={() => setFotos(fotos.filter((_, idx) => idx !== i))} className="absolute right-0 top-0 rounded-full bg-red-500 p-0.5 text-white"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              {['ANTES', 'DESPUES', 'REPUESTO', 'DETALLE'].map(cat => (
                <label key={cat} className="flex cursor-pointer items-center gap-1 rounded border border-dashed border-border px-2 py-1 text-[10px] hover:bg-muted">
                  <Camera className="h-3 w-3" />{cat}
                  <input type="file" accept="image/*" capture="environment" className="hidden" disabled={subiendo} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, cat); e.target.value = '' }} />
                </label>
              ))}
            </div>
          </div>
          {subiendo && <p className="mt-1 text-xs text-muted-foreground">Subiendo foto...</p>}
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</button>
          <button type="submit" disabled={guardando} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar trabajo'}
          </button>
        </div>
      </form>
    </div>
  )
}

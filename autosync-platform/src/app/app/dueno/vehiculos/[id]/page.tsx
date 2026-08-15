'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Loader2, ArrowLeft, Calendar, Gauge, Wrench, FileDown, Edit, Save, X, Shield, AlertCircle, ExternalLink, Phone, MapPin, Receipt, FileText, Car as CarIcon } from 'lucide-react'
import { generarPDFHistorial } from '@/lib/pdf'

interface Trabajo {
  id: string; titulo: string; descripcion: string; precio: number; estado: string
  fecha: string; kilometraje: number | null; proximaRevision: string | null
  taller: { id: string; nombre: string; slug: string }
  servicio: { nombre: string; categoria: string } | null
  fotos: { id: string; url: string; descripcion: string | null; categoria: string }[]
}

interface Vehiculo {
  id: string; patente: string; marca: string; modelo: string; anio: number
  color: string | null; kilometraje: number | null; tipo: string; combustible: string | null
  vin: string | null; numeroMotor: string | null; notas: string | null
  vtvVencimiento: string | null; gncVencimiento: string | null; verificado: boolean
  trabajos: Trabajo[]; talleres: { taller: { id: string; nombre: string; slug: string } }[]
}

export default function DuenoVehiculoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ color: '', kilometraje: '', notas: '', vtvVencimiento: '', gncVencimiento: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    params.then(p => {
      fetch(`/api/vehiculos/${p.id}`).then(r => r.json()).then(data => {
        if (data.vehiculo) {
          setVehiculo(data.vehiculo)
          setEditForm({
            color: data.vehiculo.color || '', kilometraje: data.vehiculo.kilometraje?.toString() || '',
            notas: data.vehiculo.notas || '',
            vtvVencimiento: data.vehiculo.vtvVencimiento ? data.vehiculo.vtvVencimiento.split('T')[0] : '',
            gncVencimiento: data.vehiculo.gncVencimiento ? data.vehiculo.gncVencimiento.split('T')[0] : '',
          })
        } else { router.push('/app/dueno') }
      }).finally(() => setLoading(false))
    })
  }, [params, router])

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await fetch(`/api/vehiculos/${vehiculo!.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: editForm.color || null, kilometraje: editForm.kilometraje ? Number(editForm.kilometraje) : null,
          notas: editForm.notas || null, vtvVencimiento: editForm.vtvVencimiento || null, gncVencimiento: editForm.gncVencimiento || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setVehiculo({ ...vehiculo!, ...data.vehiculo, trabajos: vehiculo!.trabajos, talleres: vehiculo!.talleres })
      setEditing(false)
    } catch (err) { alert(err instanceof Error ? err.message : 'Error') } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (!vehiculo) return null

  const hoy = new Date()
  const vtvVencido = vehiculo.vtvVencimiento && new Date(vehiculo.vtvVencimiento) < hoy
  const gncVencido = vehiculo.gncVencimiento && new Date(vehiculo.gncVencimiento) < hoy
  const tieneGNC = vehiculo.combustible === 'GNC' || vehiculo.combustible === 'Nafta/GNC'

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/app/dueno" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Mis vehículos</Link>
          <div className="flex items-center gap-2">
            <button onClick={() => generarPDFHistorial(vehiculo)} className="rounded-md border border-border p-2 hover:bg-muted" title="Exportar PDF"><FileDown className="h-4 w-4" /></button>
            <button onClick={() => setEditing(!editing)} className="rounded-md p-2 hover:bg-muted"><Edit className="h-4 w-4" /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Header del vehículo */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary"><Car className="h-7 w-7" /></div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{vehiculo.marca} {vehiculo.modelo}</h1>
              <p className="text-sm text-muted-foreground">{vehiculo.anio} · {vehiculo.tipo}{vehiculo.combustible && ` · ${vehiculo.combustible}`}</p>
              <p className="mt-1 font-mono font-bold">{vehiculo.patente}</p>
            </div>
            {vehiculo.verificado && <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"><Shield className="h-3 w-3" />Verificado</div>}
          </div>

          {!editing ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoItem label="Color" value={vehiculo.color || '—'} />
              <InfoItem label="Kilometraje" value={vehiculo.kilometraje ? `${vehiculo.kilometraje.toLocaleString('es-AR')} km` : '—'} />
              <InfoItem label="VTV" value={vehiculo.vtvVencimiento ? new Date(vehiculo.vtvVencimiento).toLocaleDateString('es-AR') : '—'} danger={!!vtvVencido} />
              {tieneGNC && <InfoItem label="GNC" value={vehiculo.gncVencimiento ? new Date(vehiculo.gncVencimiento).toLocaleDateString('es-AR') : '—'} danger={!!gncVencido} />}
            </div>
          ) : (
            <form onSubmit={guardarEdicion} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label className="text-xs font-medium">Color</label><input value={editForm.color} onChange={e => setEditForm({...editForm, color: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
                <div><label className="text-xs font-medium">Kilometraje (solo subir)</label><input type="number" value={editForm.kilometraje} onChange={e => setEditForm({...editForm, kilometraje: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
                <div><label className="text-xs font-medium">Vencimiento VTV</label><input type="date" value={editForm.vtvVencimiento} onChange={e => setEditForm({...editForm, vtvVencimiento: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
                {tieneGNC && <div><label className="text-xs font-medium">Vencimiento GNC</label><input type="date" value={editForm.gncVencimiento} onChange={e => setEditForm({...editForm, gncVencimiento: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>}
              </div>
              <div><label className="text-xs font-medium">Notas para el taller</label><textarea value={editForm.notas} onChange={e => setEditForm({...editForm, notas: e.target.value})} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
              <div className="flex gap-2"><button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}</button><button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancelar</button></div>
            </form>
          )}
          {vehiculo.notas && !editing && <div className="mt-3 rounded-lg border-l-4 border-primary bg-primary/5 p-3"><p className="text-xs font-semibold text-muted-foreground">Notas</p><p className="text-sm">{vehiculo.notas}</p></div>}
        </div>

        {/* Alertas de vencimiento */}
        {(vtvVencido || gncVencido) && (
          <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
            <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-600" /><p className="font-semibold text-red-800">Vencimientos</p></div>
            {vtvVencido && <p className="mt-1 text-sm text-red-700">⚠️ VTV vencida</p>}
            {gncVencido && <p className="text-sm text-red-700">⚠️ Obleta GNC vencida</p>}
          </div>
        )}

        {/* SERVICIOS Y TRÁMITES */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Servicios y trámites</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <ServiceLink icon={Shield} label="Sacar turno VTV" desc="Verificación técnica" url="https://www.vtvbsas.gob.ar/" />
            <ServiceLink icon={Receipt} label="Deuda de patentes" desc="Consulta de impuestos" url="https://www.arba.gov.ar/" />
            <ServiceLink icon={CarIcon} label="Deuda de multas" desc="Infracciones de tránsito" url="https://www.mardelplata.gob.ar/" />
            <ServiceLink icon={FileText} label="Deuda de peajes" desc="Ausas y AABA" url="https://www.ausa.com.ar/" />
            <ServiceLink icon={Phone} label="Turno registro" desc="Licencias y trámites" url="https://www.mardelplata.gob.ar/" />
            <ServiceLink icon={MapPin} label="Estado de rutas" desc="Vialidad provincial" url="https://www.vialidad.gob.ar/" />
          </div>
        </div>

        {/* Talleres que trabajaron */}
        {vehiculo.talleres.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Talleres que trabajaron ({vehiculo.talleres.length})</h2>
            <div className="flex flex-wrap gap-2">{vehiculo.talleres.map(({ taller }) => <Link key={taller.id} href={`/talleres/${taller.slug}`} className="rounded-full border border-border px-3 py-1 text-xs hover:border-primary/40 hover:bg-muted">{taller.nombre}</Link>)}</div>
          </div>
        )}

        {/* Historial completo */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Historial completo ({vehiculo.trabajos.length})</h2>
          {vehiculo.trabajos.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed p-8 text-center"><Wrench className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">Sin trabajos registrados todavía.</p></div>
          ) : (
            <ol className="relative space-y-3 border-l-2 border-border pl-6">
              {vehiculo.trabajos.map((t, idx) => (
                <li key={t.id} className="relative">
                  <span className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground">{vehiculo.trabajos.length - idx}</span>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{t.titulo}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${t.estado === 'COMPLETADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{t.estado.replace('_',' ')}</span>
                      {t.servicio && <span className="rounded border px-2 py-0.5 text-[10px] text-muted-foreground">{t.servicio.categoria}</span>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.descripcion}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(t.fecha).toLocaleDateString('es-AR')}</span>
                      {t.kilometraje && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{t.kilometraje.toLocaleString('es-AR')} km</span>}
                      <span>por <strong>{t.taller.nombre}</strong></span>
                      {t.proximaRevision && <span className="text-primary">Próximo: {t.proximaRevision}</span>}
                    </div>
                    {t.fotos.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {t.fotos.map(f => <div key={f.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border"><img src={f.url} alt={f.descripcion || ''} className="h-full w-full object-cover" /><span className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-center text-[8px] uppercase text-white">{f.categoria}</span></div>)}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
    </div>
  )
}

function InfoItem({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return <div className={`rounded-lg border p-2 ${danger ? 'border-red-300 bg-red-50' : 'border-border/40 bg-background/50'}`}><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p><p className={`text-sm font-medium ${danger ? 'text-red-700' : ''}`}>{value}</p></div>
}

function ServiceLink({ icon: Icon, label, desc, url }: { icon: typeof Car; label: string; desc: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-border p-2 transition-colors hover:border-primary/40 hover:bg-muted/40">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0"><p className="text-xs font-medium truncate">{label}</p><p className="text-[10px] text-muted-foreground truncate">{desc}</p></div>
      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
    </a>
  )
}

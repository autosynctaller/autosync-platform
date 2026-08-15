'use client'
import { useState, useEffect, use } from 'react'
import { Loader2, ArrowLeft, Car, User, Phone, Gauge, Calendar, Wrench, Trash2, Mail } from 'lucide-react'
import Link from 'next/link'

export default function VehiculoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [vehiculo, setVehiculo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/vehiculos/${id}`, { credentials: 'include' }).then(r => r.json()).then(d => { setVehiculo(d.vehiculo); setLoading(false) })
  }, [id])

  const eliminar = async () => {
    if (!confirm('¿Eliminar este vehículo? Se borrarán todos sus trabajos.')) return
    await fetch(`/api/admin/vehiculos/${id}`, { method: 'DELETE', credentials: 'include' })
    window.location.href = '/app/admin/vehiculos'
  }

  if (loading) return <Loader2 className="h-8 w-8 animate-spin text-primary" />
  if (!vehiculo) return <p>No encontrado</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/app/admin/vehiculos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Volver</Link>
        <button onClick={eliminar} className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"><Trash2 className="mr-1 inline h-3 w-3" />Eliminar</button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary"><Car className="h-7 w-7" /></div>
          <div>
            <h1 className="text-xl font-bold">{vehiculo.marca} {vehiculo.modelo}</h1>
            <p className="text-sm text-muted-foreground">{vehiculo.anio} · {vehiculo.tipo} · <span className="font-mono font-bold">{vehiculo.patente}</span></p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Info label="Color" value={vehiculo.color || '—'} />
          <Info label="Kilometraje" value={vehiculo.kilometraje ? `${vehiculo.kilometraje.toLocaleString('es-AR')} km` : '—'} />
          <Info label="Combustible" value={vehiculo.combustible || '—'} />
          <Info label="Verificado" value={vehiculo.verificado ? 'Sí' : 'No'} />
          <Info label="VTV" value={vehiculo.vtvVencimiento ? new Date(vehiculo.vtvVencimiento).toLocaleDateString('es-AR') : '—'} />
          <Info label="GNC" value={vehiculo.gncVencimiento ? new Date(vehiculo.gncVencimiento).toLocaleDateString('es-AR') : '—'} />
          <Info label="VIN" value={vehiculo.vin || '—'} />
          <Info label="Motor" value={vehiculo.numeroMotor || '—'} />
        </div>
        {vehiculo.notas && <div className="mt-3 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-3"><p className="text-xs font-semibold text-amber-700">Notas del dueño</p><p className="text-sm">{vehiculo.notas}</p></div>}
      </div>

      {/* Dueño */}
      {vehiculo.owner && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Dueño</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{vehiculo.owner.nombre}</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{vehiculo.owner.email}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{vehiculo.owner.telefono || '—'}</div>
          </div>
        </div>
      )}

      {/* Talleres que trabajaron */}
      {vehiculo.talleres?.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Talleres que trabajaron ({vehiculo.talleres.length})</h2>
          <div className="flex flex-wrap gap-2">{vehiculo.talleres.map((vt: any) => <span key={vt.taller.id} className="rounded-full border border-border px-3 py-1 text-xs">{vt.taller.nombre}</span>)}</div>
        </div>
      )}

      {/* Historial */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">Trabajos realizados ({vehiculo._count?.trabajos || 0})</h2>
        {vehiculo.trabajos?.length === 0 ? <p className="text-sm text-muted-foreground">Sin trabajos cargados.</p> : (
          <ol className="space-y-2">{vehiculo.trabajos?.map((t: any) => (
            <li key={t.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <div><span className="font-medium text-sm">{t.titulo}</span><span className="ml-2 text-xs text-muted-foreground">por {t.taller.nombre}</span></div>
                <span className="text-xs text-muted-foreground">{new Date(t.fecha).toLocaleDateString('es-AR')}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.descripcion}</p>
              {t.kilometraje && <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Gauge className="h-3 w-3" />{t.kilometraje.toLocaleString('es-AR')} km</span>}
            </li>
          ))}</ol>
        )}
      </div>
    </div>
  )
}

function Info({ label, value }: any) { return <div className="rounded-lg border border-border/40 p-2"><p className="text-[10px] uppercase text-muted-foreground">{label}</p><p className="text-sm font-medium">{value}</p></div> }

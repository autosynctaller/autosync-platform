'use client'
import { useEffect, useState } from 'react'
import { Loader2, Car, Search, User, Gauge, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function AdminVehiculosPage() {
  const [vehiculos, setVehiculos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/admin/vehiculos', { credentials: 'include' }).then(r => r.json()).then(d => { setVehiculos(d.vehiculos || []); setLoading(false) })
  }, [])

  const filtrados = vehiculos.filter(v => !q || v.patente.toLowerCase().includes(q.toLowerCase()) || v.marca.toLowerCase().includes(q.toLowerCase()) || v.modelo.toLowerCase().includes(q.toLowerCase()) || v.owner?.nombre.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Vehículos registrados</h1><p className="text-sm text-muted-foreground">{vehiculos.length} vehículos</p></div>
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..." className="w-full rounded-lg border border-border py-2.5 pl-10 pr-3 focus:ring-2 focus:ring-primary" /></div>
      {loading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : filtrados.length === 0 ? <div className="rounded-xl border-2 border-dashed p-8 text-center"><Car className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">Sin vehículos.</p></div> :
        <div className="space-y-2">
          {filtrados.map(v => (
            <Link key={v.id} href={`/app/admin/vehiculos/${v.id}`} className="block rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-muted/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Car className="h-5 w-5" /></div>
                  <div>
                    <div className="flex items-center gap-2"><span className="font-semibold text-sm">{v.marca} {v.modelo}</span>{v.verificado && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">✓</span>}</div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-0.5"><span className="font-mono font-bold">{v.patente}</span><span>{v.anio}</span>{v.kilometraje && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.kilometraje.toLocaleString('es-AR')} km</span>}{v.owner && <span className="flex items-center gap-1"><User className="h-3 w-3" />{v.owner.nombre}</span>}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{v._count?.trabajos || 0} trabajos</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></div>
              </div>
            </Link>
          ))}
        </div>
      }
    </div>
  )
}

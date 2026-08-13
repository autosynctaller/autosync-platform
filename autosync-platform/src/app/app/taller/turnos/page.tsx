'use client'
import { useState, useEffect } from 'react'
import { Loader2, Calendar, Clock, Check, X, Phone, Car } from 'lucide-react'

interface Turno {
  id: string
  nombreCliente: string
  telefonoCliente: string
  vehiculoPatente: string | null
  vehiculoMarca: string | null
  vehiculoModelo: string | null
  fechaHora: string
  motivo: string
  descripcion: string | null
  estado: string
  notaTaller: string | null
}

export default function TurnosPage() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('SOLICITADO')

  const cargar = () => fetch('/api/turnos').then(r => r.json()).then(d => { setTurnos(d.turnos || []); setLoading(false) })
  useEffect(() => { cargar() }, [])

  const responder = async (id: string, estado: string) => {
    await fetch(`/api/turnos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }) })
    cargar()
  }

  const estadoColor: Record<string, string> = {
    SOLICITADO: 'bg-amber-100 text-amber-800',
    CONFIRMADO: 'bg-emerald-100 text-emerald-800',
    COMPLETADO: 'bg-blue-100 text-blue-800',
    CANCELADO: 'bg-zinc-100 text-zinc-500',
    RECHAZADO: 'bg-red-100 text-red-800',
  }

  const filtrados = filtro === 'TODOS' ? turnos : turnos.filter(t => t.estado === filtro)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Turnos</h1><p className="text-sm text-muted-foreground">Gestioná los turnos solicitados online.</p></div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {['SOLICITADO', 'CONFIRMADO', 'COMPLETADO', 'TODOS'].map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`rounded-full px-3 py-1 text-xs font-medium ${filtro === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f.charAt(0) + f.slice(1).toLowerCase()}</button>
        ))}
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> :
        filtrados.length === 0 ? <div className="rounded-xl border-2 border-dashed p-8 text-center"><Calendar className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">No hay turnos {filtro.toLowerCase()}.</p></div> :
        <div className="space-y-3">
          {filtrados.map(t => (
            <div key={t.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{t.nombreCliente}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${estadoColor[t.estado]}`}>{t.estado}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(t.fechaHora).toLocaleDateString('es-AR')}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(t.fechaHora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{t.telefonoCliente}</span>
                  </div>
                  <p className="mt-1 text-sm"><span className="font-medium">Motivo:</span> {t.motivo}</p>
                  {t.descripcion && <p className="text-xs text-muted-foreground">{t.descripcion}</p>}
                  {t.vehiculoPatente && (
                    <p className="mt-1 flex items-center gap-1 text-xs"><Car className="h-3 w-3" />{t.vehiculoMarca} {t.vehiculoModelo} · <span className="font-mono font-bold">{t.vehiculoPatente}</span></p>
                  )}
                </div>
                {t.estado === 'SOLICITADO' && (
                  <div className="flex gap-1">
                    <button onClick={() => responder(t.id, 'CONFIRMADO')} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"><Check className="mr-1 inline h-3 w-3" />Confirmar</button>
                    <button onClick={() => responder(t.id, 'RECHAZADO')} className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"><X className="mr-1 inline h-3 w-3" />Rechazar</button>
                  </div>
                )}
                {t.estado === 'CONFIRMADO' && (
                  <button onClick={() => responder(t.id, 'COMPLETADO')} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600">Marcar completado</button>
                )}
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}

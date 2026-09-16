'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Search, Bell, Stethoscope, Calendar, Gauge, Wrench, MessageCircle, X, AlertCircle, Check, FileText } from 'lucide-react'

interface Diagnostico {
  id: string
  titulo: string
  sintoma: string
  pruebasRealizadas: string | null
  resultadoPrueba: string | null
  diagnostico: string | null
  solucion: string | null
  resultadoFinal: string | null
  estado: string
  kilometraje: number | null
  fecha: string
}

interface Cronograma {
  marca: string
  modelo: string
  kilometraje: number
  items: string
  notas: string | null
}

interface Recordatorio {
  id: string
  tipo: 'trabajo' | 'vtv' | 'gnc'
  titulo: string
  descripcion: string
  fecha: string
  diasRestantes: number
  estado: 'vencido' | 'hoy' | 'proximo' | 'futuro'
  vehiculo: { id: string; marca: string; modelo: string; patente: string }
}

export function DiagnosticosPanel({ vehiculoId }: { vehiculoId: string }) {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    titulo: '', sintoma: '', pruebasRealizadas: '', resultadoPrueba: '',
    diagnostico: '', solucion: '', resultadoFinal: '', estado: 'EN_DIAGNOSTICO', kilometraje: '', fecha: new Date().toISOString().split('T')[0],
  })
  const [guardando, setGuardando] = useState(false)

  const cargar = () => fetch(`/api/vehiculos/${vehiculoId}/diagnosticos`).then(r => r.json()).then(d => { setDiagnosticos(d.diagnosticos || []); setLoading(false) })
  useEffect(() => { cargar() }, [vehiculoId])

  const crear = async (e: React.FormEvent) => {
    e.preventDefault(); setGuardando(true)
    await fetch(`/api/vehiculos/${vehiculoId}/diagnosticos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm({ titulo: '', sintoma: '', pruebasRealizadas: '', resultadoPrueba: '', diagnostico: '', solucion: '', resultadoFinal: '', estado: 'EN_DIAGNOSTICO', kilometraje: '', fecha: new Date().toISOString().split('T')[0] })
    setShowForm(false); setGuardando(false); cargar()
  }

  const estadoColor: Record<string, string> = {
    EN_DIAGNOSTICO: 'bg-amber-100 text-amber-800', RESUELTO: 'bg-emerald-100 text-emerald-800',
    PENDIENTE_REPUESTO: 'bg-blue-100 text-blue-800', SIN_SOLUCION: 'bg-red-100 text-red-800',
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><Stethoscope className="h-4 w-4 text-primary" />Diagnósticos ({diagnosticos.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg border border-border px-3 py-1 text-xs font-medium hover:bg-muted"><Plus className="mr-1 inline h-3 w-3" />Nuevo</button>
      </div>
      {showForm && (
        <form onSubmit={crear} className="mb-4 space-y-3 rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2"><label className="text-xs font-medium">Título *</label><input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Ej: Ruido al frenar" /></div>
            <div><label className="text-xs font-medium">Estado</label><select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary"><option value="EN_DIAGNOSTICO">En diagnóstico</option><option value="RESUELTO">Resuelto</option><option value="PENDIENTE_REPUESTO">Pendiente repuesto</option><option value="SIN_SOLUCION">Sin solución</option></select></div>
          </div>
          <div><label className="text-xs font-medium">Síntoma *</label><textarea value={form.sintoma} onChange={e => setForm({...form, sintoma: e.target.value})} required rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Qué reporta el cliente..." /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">Pruebas realizadas</label><textarea value={form.pruebasRealizadas} onChange={e => setForm({...form, pruebasRealizadas: e.target.value})} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Resultado de pruebas</label><textarea value={form.resultadoPrueba} onChange={e => setForm({...form, resultadoPrueba: e.target.value})} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">Diagnóstico</label><textarea value={form.diagnostico} onChange={e => setForm({...form, diagnostico: e.target.value})} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Solución aplicada</label><textarea value={form.solucion} onChange={e => setForm({...form, solucion: e.target.value})} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          </div>
          <div><label className="text-xs font-medium">Resultado final</label><input value={form.resultadoFinal} onChange={e => setForm({...form, resultadoFinal: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          <div className="flex gap-2"><button type="submit" disabled={guardando} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}</button><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancelar</button></div>
        </form>
      )}
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> :
        diagnosticos.length === 0 ? <p className="text-xs text-muted-foreground py-3">Sin diagnósticos cargados.</p> :
        <ol className="space-y-2">
          {diagnosticos.map(d => (
            <li key={d.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2"><span className="text-sm font-semibold">{d.titulo}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${estadoColor[d.estado] || 'bg-muted'}`}>{d.estado.replace('_',' ')}</span></div>
              <p className="mt-1 text-xs text-muted-foreground">Síntoma: {d.sintoma}</p>
              {d.diagnostico && <p className="text-xs"><span className="text-muted-foreground">Diagnóstico:</span> {d.diagnostico}</p>}
              {d.solucion && <p className="text-xs text-emerald-600">✓ {d.solucion}</p>}
              <p className="mt-1 text-[10px] text-muted-foreground">{new Date(d.fecha).toLocaleDateString('es-AR')}{d.kilometraje && ` · ${d.kilometraje.toLocaleString('es-AR')} km`}</p>
            </li>
          ))}
        </ol>
      }
    </div>
  )
}

export function CronogramaSugerido({ marca, modelo, kilometraje }: { marca: string; modelo: string; kilometraje: number | null }) {
  const [sugerido, setSugerido] = useState<Cronograma | null>(null)
  const [proximo, setProximo] = useState<Cronograma | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!marca || !kilometraje) { setLoading(false); return }
    fetch(`/api/cronogramas?marca=${encodeURIComponent(marca)}&modelo=${encodeURIComponent(modelo)}&km=${kilometraje}`)
      .then(r => r.json())
      .then(data => { setSugerido(data.sugerido); setProximo(data.proximo); setLoading(false) })
  }, [marca, modelo, kilometraje])

  if (loading) return <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Cargando cronograma...</div>
  if (!sugerido && !proximo) return <p className="text-xs text-muted-foreground">No hay cronograma pre-cargado para {marca}.</p>

  return (
    <div className="space-y-3">
      {sugerido && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase text-amber-800">⚠️ Service de los {sugerido.kilometraje.toLocaleString('es-AR')} km - Le corresponde</p>
          <ul className="mt-1 space-y-0.5 text-xs text-amber-900">{sugerido.items.split('\n').map((item, i) => <li key={i}>• {item}</li>)}</ul>
          {sugerido.notas && <p className="mt-1 rounded bg-amber-100 p-1 text-[10px] italic text-amber-800">💡 {sugerido.notas}</p>}
        </div>
      )}
      {proximo && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs font-semibold uppercase text-emerald-800">✓ Próximo: {proximo.kilometraje.toLocaleString('es-AR')} km {kilometraje && <span className="font-normal">(faltan {(proximo.kilometraje - kilometraje).toLocaleString('es-AR')} km)</span>}</p>
          <ul className="mt-1 space-y-0.5 text-xs text-emerald-900">{proximo.items.split('\n').map((item, i) => <li key={i}>• {item}</li>)}</ul>
          {proximo.notas && <p className="mt-1 rounded bg-emerald-100 p-1 text-[10px] italic text-emerald-800">💡 {proximo.notas}</p>}
        </div>
      )}
    </div>
  )
}

export function RecordatoriosWidget() {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recordatorios').then(r => r.json()).then(d => { setRecordatorios(d.recordatorios || []); setLoading(false) })
  }, [])

  if (loading) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
  if (recordatorios.length === 0) return <p className="text-xs text-muted-foreground">Sin recordatorios pendientes.</p>

  const estadoColor: Record<string, string> = {
    vencido: 'border-red-300 bg-red-50', hoy: 'border-amber-300 bg-amber-50',
    proximo: 'border-yellow-200 bg-yellow-50', futuro: 'border-border bg-card',
  }

  return (
    <div className="space-y-2">
      {recordatorios.slice(0, 10).map(r => (
        <div key={r.id} className={`rounded-lg border-2 p-3 ${estadoColor[r.estado]}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{r.titulo}</span>
                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase text-white">{r.tipo}</span>
              </div>
              <p className="text-xs text-muted-foreground">{r.vehiculo.marca} {r.vehiculo.modelo} · {r.vehiculo.patente}</p>
            </div>
            <span className={`text-xs font-bold ${r.estado === 'vencido' ? 'text-red-600' : 'text-amber-600'}`}>
              {r.estado === 'vencido' ? `Vencido ${Math.abs(r.diasRestantes)}d` : r.estado === 'hoy' ? 'Hoy' : `${r.diasRestantes}d`}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

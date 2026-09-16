'use client'
import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

export default function DiagnosticosPage() {
  const [q, setQ] = useState('')
  const [resultados, setResultados] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)
  const [buscado, setBuscado] = useState(false)

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (q.length < 2) return
    setBuscando(true); setBuscado(true)
    try {
      const res = await fetch(`/api/diagnosticos/buscar?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResultados(data.resultados || [])
    } catch {} finally { setBuscando(false) }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Buscar diagnósticos</h1><p className="text-sm text-muted-foreground">Buscá síntomas en todos los diagnósticos que cargaste.</p></div>
      <form onSubmit={buscar} className="flex gap-2">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={e => setQ(e.target.value)} className="w-full rounded-lg border border-border py-2.5 pl-10 pr-3 focus:ring-2 focus:ring-primary" placeholder="Ej: ruido al frenar..." /></div>
        <button type="submit" disabled={buscando} className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}</button>
      </form>
      {buscado && resultados.length === 0 && !buscando && <div className="rounded-xl border-2 border-dashed p-8 text-center"><p className="text-sm text-muted-foreground">Sin resultados para "{q}"</p></div>}
      {resultados.length > 0 && <div className="space-y-2">{resultados.map(r => (
        <div key={r.id} className="rounded-lg border border-border bg-card p-3">
          <p className="font-semibold text-sm">{r.titulo}</p><p className="text-xs text-muted-foreground">{r.vehiculo?.marca} {r.vehiculo?.modelo} ({r.vehiculo?.patente})</p>
          <p className="mt-1 text-xs italic">"{r.sintoma}"</p>
          {r.solucion && <p className="mt-1 text-xs text-emerald-600">✓ {r.solucion}</p>}
        </div>
      ))}</div>}
    </div>
  )
}

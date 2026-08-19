'use client'
import { useState, useEffect } from 'react'
import { Wrench, Plus, Loader2, Trash2 } from 'lucide-react'
import { authFetch } from '@/lib/auth-client'

interface Servicio { id: string; nombre: string; descripcion: string | null; categoria: string | null; activo: boolean }

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', categoria: '' })
  const [guardando, setGuardando] = useState(false)

  const cargar = () => authFetch('/api/servicios').then(r => r.json()).then(d => { setServicios(d.servicios || []); setLoading(false) })
  useEffect(() => { cargar() }, [])

  const crear = async (e: React.FormEvent) => {
    e.preventDefault(); setGuardando(true)
    await authFetch('/api/servicios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm({ nombre: '', descripcion: '', categoria: '' }); setShowForm(false); setGuardando(false); cargar()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Servicios</h1><p className="text-sm text-muted-foreground">Catálogo de servicios de tu taller.</p></div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="mr-2 inline h-4 w-4" />Nuevo</button>
      </div>
      {showForm && (
        <form onSubmit={crear} className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-medium">Nombre *</label><input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="mb-1 block text-xs font-medium">Categoría</label><input value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Mantenimiento, Frenos..." /></div>
          </div>
          <div><label className="mb-1 block text-xs font-medium">Descripción</label><textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          <button type="submit" disabled={guardando} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear'}</button>
        </form>
      )}
      {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> :
        servicios.length === 0 ? <div className="rounded-xl border-2 border-dashed p-8 text-center"><Wrench className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">Sin servicios cargados.</p></div> :
        <div className="grid gap-3 sm:grid-cols-2">{servicios.map(s => (
          <div key={s.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between"><div><p className="font-semibold">{s.nombre}</p>{s.categoria && <span className="text-xs text-muted-foreground">{s.categoria}</span>}</div></div>
            {s.descripcion && <p className="mt-1 text-sm text-muted-foreground">{s.descripcion}</p>}
          </div>
        ))}</div>
      }
    </div>
  )
}

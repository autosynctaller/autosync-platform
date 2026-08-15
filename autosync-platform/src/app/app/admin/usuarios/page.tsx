'use client'
import { useState } from 'react'
import { Loader2, KeyRound, Search, Check } from 'lucide-react'

export default function AdminUsuariosPage() {
  const [email, setEmail] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [usuarios, setUsuarios] = useState<any[]>([])

  const buscar = async () => {
    if (busqueda.length < 2) return
    const res = await fetch(`/api/admin/usuarios?q=${encodeURIComponent(busqueda)}`, { credentials: 'include' })
    const data = await res.json()
    setUsuarios(data.usuarios || [])
  }
  const resetear = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(''); setOk(false)
    try {
      const res = await fetch('/api/admin/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, nuevaPassword }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOk(true); setEmail(''); setNuevaPassword('')
      setTimeout(() => setOk(false), 3000)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Usuarios y contraseñas</h1><p className="text-sm text-muted-foreground">Buscá usuarios y reseteá contraseñas cuando sea necesario.</p></div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Buscar usuarios</h2>
        <div className="flex gap-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && buscar()} placeholder="Email o nombre..." className="w-full rounded-lg border border-border py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-primary" /></div>
          <button onClick={buscar} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Buscar</button>
        </div>
        {usuarios.length > 0 && <div className="mt-3 space-y-1">{usuarios.map(u => (
          <div key={u.id} className="flex items-center justify-between rounded-lg border border-border/50 p-2 text-sm">
            <div><span className="font-medium">{u.nombre}</span><span className="ml-2 text-muted-foreground">{u.email}</span><span className="ml-2 rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase">{u.rol}</span></div>
            <button onClick={() => setEmail(u.email)} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted">Resetear</button>
          </div>
        ))}</div>}
      </div>
      <form onSubmit={resetear} className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><KeyRound className="h-4 w-4 text-primary" />Resetear contraseña</h2>
        {ok && <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2"><Check className="h-4 w-4" />Contraseña actualizada correctamente</div>}
        {error && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div><label className="text-xs font-medium">Email del usuario</label><input value={email} onChange={e => setEmail(e.target.value)} required placeholder="usuario@email.com" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
        <div><label className="text-xs font-medium">Nueva contraseña</label><input type="text" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resetear contraseña'}</button>
      </form>
    </div>
  )
}

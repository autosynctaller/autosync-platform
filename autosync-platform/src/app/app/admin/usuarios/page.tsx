'use client'
import { useState, useEffect } from 'react'
import { Loader2, KeyRound, Search, Check, Users, Wrench, Car, Mail, Phone, Calendar } from 'lucide-react'

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState('')

  const cargar = () => {
    const url = q ? `/api/admin/usuarios?q=${encodeURIComponent(q)}` : '/api/admin/usuarios'
    fetch(url, { credentials: 'include' }).then(r => r.json()).then(d => { setUsuarios(d.usuarios || []); setLoading(false) })
  }
  useEffect(() => { cargar() }, [])

  const buscar = () => { setLoading(true); cargar() }

  const resetear = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(''); setOk(false)
    try {
      const res = await fetch('/api/admin/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: resetEmail, nuevaPassword }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOk(true); setResetEmail(''); setNuevaPassword('')
      setTimeout(() => setOk(false), 3000)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') } finally { setSaving(false) }
  }

  const rolColor: Record<string, string> = {
    SUPER_ADMIN: 'bg-zinc-900 text-white', TALLER: 'bg-blue-100 text-blue-700', DUENO: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Usuarios</h1><p className="text-sm text-muted-foreground">{usuarios.length} usuarios registrados</p></div>
      <div className="flex gap-2">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && buscar()} placeholder="Buscar por email o nombre..." className="w-full rounded-lg border border-border py-2.5 pl-10 pr-3 focus:ring-2 focus:ring-primary" /></div>
        <button onClick={buscar} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Buscar</button>
      </div>
      {loading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : usuarios.length === 0 ? <div className="rounded-xl border-2 border-dashed p-8 text-center"><Users className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">Sin usuarios.</p></div> :
        <div className="space-y-2">
          {usuarios.map(u => (
            <div key={u.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{u.nombre}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${rolColor[u.rol] || 'bg-zinc-100'}`}>{u.rol.replace('_', ' ')}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{u.email}</span>
                    {u.telefono && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{u.telefono}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(u.creadoEn).toLocaleDateString('es-AR')}</span>
                  </div>
                  {u.taller && (
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <Wrench className="h-3 w-3 text-blue-500" />
                      <span className="font-medium">{u.taller.nombre}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] ${u.taller.plan === 'PREMIUM' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'}`}>{u.taller.plan}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] ${u.taller.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{u.taller.estado}</span>
                    </div>
                  )}
                  {u._count?.vehiculos > 0 && <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Car className="h-3 w-3" />{u._count.vehiculos} vehículo(s)</span>}
                </div>
                <button onClick={() => setResetEmail(u.email)} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted"><KeyRound className="mr-1 inline h-3 w-3" />Resetear</button>
              </div>
            </div>
          ))}
        </div>
      }
      <form onSubmit={resetear} className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><KeyRound className="h-4 w-4 text-primary" />Resetear contraseña</h2>
        {ok && <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2"><Check className="h-4 w-4" />Contraseña actualizada</div>}
        {error && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="text-xs font-medium">Email</label><input value={resetEmail} onChange={e => setResetEmail(e.target.value)} required placeholder="usuario@email.com" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          <div><label className="text-xs font-medium">Nueva contraseña</label><input type="text" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
        </div>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resetear'}</button>
      </form>
    </div>
  )
}

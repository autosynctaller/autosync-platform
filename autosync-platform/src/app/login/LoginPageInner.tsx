'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Car, Loader2, Wrench, User } from 'lucide-react'
import { setToken, setStoredUser } from '@/lib/auth-client'

export default function LoginPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [tab, setTab] = useState<'login' | 'registro'>('login')
  const [rol, setRol] = useState<'DUENO' | 'TALLER'>('DUENO')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [tallerNombre, setTallerNombre] = useState('')
  const [tallerCiudad, setTallerCiudad] = useState('')

  useEffect(() => {
    if (params.get('tab') === 'registro') setTab('registro')
  }, [params])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim().toLowerCase(), password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.token) {
        setToken(data.token)
        setStoredUser(data.user)
      }
      window.location.href = '/app'
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') } finally { setLoading(false) }
  }

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const body: Record<string, unknown> = { email, password, nombre, telefono, rol }
      if (rol === 'TALLER') body.tallerData = { nombre: tallerNombre || nombre, telefono, ciudad: tallerCiudad }
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/app'); router.refresh()
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') } finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground"><Car className="h-6 w-6" /></div>
            <span className="text-xl font-bold">AutoSync</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Historial Digital Automotor</p>
        </div>
        <div className="mb-6 flex rounded-lg border border-border bg-card p-1">
          <button onClick={() => setTab('login')} className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${tab === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Iniciar sesión</button>
          <button onClick={() => setTab('registro')} className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${tab === 'registro' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Crear cuenta</button>
        </div>
        {error && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div><label className="mb-1 block text-sm font-medium">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="tu@email.com" /></div>
            <div><label className="mb-1 block text-sm font-medium">Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" /></div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Iniciar sesión'}</button>
          </form>
        ) : (
          <form onSubmit={handleRegistro} className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Tipo de cuenta</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setRol('DUENO')} className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${rol === 'DUENO' ? 'border-primary bg-primary/5' : 'border-border'}`}><User className="h-5 w-5" /><span className="text-xs font-medium">Dueño</span></button>
                <button type="button" onClick={() => setRol('TALLER')} className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${rol === 'TALLER' ? 'border-primary bg-primary/5' : 'border-border'}`}><Wrench className="h-5 w-5" /><span className="text-xs font-medium">Taller</span></button>
              </div>
            </div>
            <div><label className="mb-1 block text-sm font-medium">Nombre</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder={rol === 'TALLER' ? 'Tu nombre' : 'Nombre y apellido'} /></div>
            {rol === 'TALLER' && (
              <>
                <div><label className="mb-1 block text-sm font-medium">Nombre del taller</label><input type="text" value={tallerNombre} onChange={(e) => setTallerNombre(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ej: Taller Juan Mecánica" /></div>
                <div><label className="mb-1 block text-sm font-medium">Ciudad</label><input type="text" value={tallerCiudad} onChange={(e) => setTallerCiudad(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ej: Mar del Plata" /></div>
              </>
            )}
            <div><label className="mb-1 block text-sm font-medium">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="tu@email.com" /></div>
            <div><label className="mb-1 block text-sm font-medium">Teléfono</label><input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ej: 2235941522" /></div>
            <div><label className="mb-1 block text-sm font-medium">Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Mínimo 6 caracteres" /></div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Crear cuenta'}</button>
            <p className="text-center text-xs text-muted-foreground">{rol === 'DUENO' ? 'Gratis para siempre.' : 'Plan gratis sin límites. Premium disponible después.'}</p>
          </form>
        )}
      </div>
    </div>
  )
}

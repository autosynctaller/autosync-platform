'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Loader2, LogOut, Plus, Search, Calendar, Gauge, Wrench } from 'lucide-react'

interface Vehiculo {
  id: string
  patente: string
  marca: string
  modelo: string
  anio: number
  kilometraje: number | null
  vtvVencimiento: string | null
  gncVencimiento: string | null
  _count: { trabajos: number }
}

export default function DuenoPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) { router.push('/login'); return }
      if (data.user.rol !== 'DUENO') { router.push('/app'); return }
      setUser(data.user)
      fetch('/api/vehiculos').then(r => r.json()).then(d => setVehiculos(d.vehiculos || [])).finally(() => setLoading(false))
    })
  }, [router])

  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); router.refresh() }

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Car className="h-5 w-5" /></div><span className="font-bold">AutoSync</span></Link>
          <div className="flex items-center gap-3"><span className="hidden text-sm text-muted-foreground sm:block">{user.nombre}</span><button onClick={handleLogout} className="rounded-md p-2 hover:bg-muted"><LogOut className="h-4 w-4" /></button></div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Mis vehículos</h1><p className="text-sm text-muted-foreground">Gestioná el historial de tus vehículos.</p></div>
          <Link href="/app/dueno/reclamar" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="mr-2 inline h-4 w-4" />Reclamar vehículo</Link>
        </div>
        {vehiculos.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Car className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Todavía no reclamaste ningún vehículo.</p>
            <Link href="/app/dueno/reclamar" className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Reclamar mi primer vehículo</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehiculos.map(v => (
              <Link key={v.id} href={`/app/dueno/vehiculos/${v.id}`} className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"><Car className="h-6 w-6" /></div>
                  <div><p className="font-semibold">{v.marca} {v.modelo}</p><p className="text-sm text-muted-foreground font-mono">{v.patente}</p></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{v.anio}</span>
                  {v.kilometraje && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.kilometraje.toLocaleString('es-AR')} km</span>}
                  <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{v._count.trabajos} trabajo(s)</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

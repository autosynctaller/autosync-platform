'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Wrench, Loader2, Star, BadgeCheck } from 'lucide-react'

interface Taller {
  id: string; nombre: string; slug: string; descripcion: string | null
  logo: string | null; telefono: string; whatsapp: string | null
  ciudad: string | null; provincia: string | null; plan: string
  verificado: boolean; creadoEn: string
  _count: { trabajos: number }
}

export default function TalleresPage() {
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [ciudad, setCiudad] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (ciudad) params.set('ciudad', ciudad)
    fetch(`/api/talleres?${params}`)
      .then(r => r.json())
      .then(data => setTalleres(data.talleres || []))
      .finally(() => setLoading(false))
  }, [q, ciudad])

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Wrench className="h-5 w-5" /></div><span className="font-bold">AutoSync</span></Link>
          <Link href="/login" className="text-sm font-medium hover:text-primary">Iniciar sesión</Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold">Talleres registrados</h1>
        <p className="mt-1 text-sm text-muted-foreground">Encontrá talleres de confianza en la plataforma.</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o descripción..." className="w-full rounded-lg border border-border py-2.5 pl-10 pr-3 focus:ring-2 focus:ring-primary" /></div>
          <input value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Ciudad..." className="rounded-lg border border-border px-3 py-2.5 focus:ring-2 focus:ring-primary sm:w-48" />
        </div>

        {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> :
          talleres.length === 0 ? <div className="mt-8 rounded-xl border-2 border-dashed p-8 text-center"><p className="text-sm text-muted-foreground">No se encontraron talleres.</p></div> :
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {talleres.map(t => (
              <Link key={t.id} href={`/talleres/${t.slug}`} className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg font-bold">{t.nombre.charAt(0)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1"><p className="truncate font-semibold">{t.nombre}</p>{t.verificado && <BadgeCheck className="h-4 w-4 text-primary" />}</div>
                    {t.ciudad && <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{t.ciudad}</p>}
                  </div>
                  {t.plan === 'PREMIUM' && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">PREMIUM</span>}
                </div>
                {t.descripcion && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{t.descripcion}</p>}
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{t._count.trabajos} trabajos</span>
                </div>
              </Link>
            ))}
          </div>
        }
      </main>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { Loader2, Plus, Megaphone, ChevronRight, ExternalLink, Eye, MousePointerClick } from 'lucide-react'
import Link from 'next/link'

export default function AdminAnuncios() {
  const [anuncios, setAnuncios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const cargar = () => fetch('/api/anuncios?todos=1', { credentials: 'include' }).then(r => r.json()).then(d => { setAnuncios(d.anuncios || []); setLoading(false) })
  useEffect(() => { cargar() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Anuncios</h1><p className="text-sm text-muted-foreground">{anuncios.length} anuncios</p></div>
        <Link href="/app/admin/anuncios/nuevo" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="mr-2 inline h-4 w-4" />Nuevo</Link>
      </div>
      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : anuncios.length === 0 ? <div className="rounded-xl border-2 border-dashed p-8 text-center"><Megaphone className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">Sin anuncios.</p></div> :
        <div className="space-y-2">
          {anuncios.map(a => {
            const ctr = a.impresiones > 0 ? ((a.clicks / a.impresiones) * 100).toFixed(1) : '0'
            return (
              <Link key={a.id} href={`/app/admin/anuncios/${a.id}`} className="block rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-muted/40">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><span className="font-medium text-sm">{a.titulo}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${a.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{a.estado}</span><span className="rounded border px-2 py-0.5 text-[10px] text-muted-foreground">{a.tipo?.replace('_', ' ')}</span></div>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.anunciante?.nombre}</p>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Eye className="h-3 w-3" />{a.impresiones}</span><span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{a.clicks}</span><span className="font-medium text-primary">{ctr}% CTR</span></div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            )
          })}
        </div>
      }
    </div>
  )
}

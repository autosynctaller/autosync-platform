'use client'
import { useEffect, useState } from 'react'
import { Loader2, Plus, Megaphone, Trash2, Pause, Play, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Anuncio {
  id: string
  titulo: string
  descripcion: string | null
  url: string
  tipo: string
  estado: string
  inicio: string
  fin: string | null
  impresiones: number
  clicks: number
  anunciante: { nombre: string }
}

export default function AdminAnuncios() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [loading, setLoading] = useState(true)

  const cargar = () => fetch('/api/anuncios?todos=1').then(r => r.json()).then(d => { setAnuncios(d.anuncios || []); setLoading(false) })
  useEffect(() => { cargar() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Anuncios</h1><p className="text-sm text-muted-foreground">Gestioná la publicidad de la plataforma.</p></div>
        <Link href="/app/admin/anuncios/nuevo" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="mr-2 inline h-4 w-4" />Nuevo anuncio</Link>
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> :
        anuncios.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-8 text-center">
            <Megaphone className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No hay anuncios cargados todavía.</p>
            <p className="mt-1 text-xs text-muted-foreground">Cuando agregues anunciantes (autopartistas, seguros, etc.), van a aparecer acá.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {anuncios.map(a => (
              <div key={a.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{a.titulo}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${a.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{a.estado}</span>
                      <span className="rounded border px-2 py-0.5 text-[10px] text-muted-foreground">{a.tipo.replace('_', ' ')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.anunciante.nombre}</p>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      <span>👁 {a.impresiones} impres.</span>
                      <span>👆 {a.clicks} clicks</span>
                      <span>📊 {a.impresiones > 0 ? ((a.clicks / a.impresiones) * 100).toFixed(1) : 0}% CTR</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="rounded p-2 hover:bg-muted"><ExternalLink className="h-4 w-4" /></a>
                    <button className="rounded p-2 hover:bg-muted">{a.estado === 'ACTIVO' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

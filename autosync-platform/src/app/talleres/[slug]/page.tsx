'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Wrench, MapPin, Phone, MessageCircle, Loader2, BadgeCheck, ArrowLeft } from 'lucide-react'

export default function TallerPerfilPage() {
  const params = useParams()
  const slug = params.slug as string
  const [taller, setTaller] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/talleres?slug=${slug}`).then(r => r.json()).then(data => {
      if (data.talleres && data.talleres[0]) setTaller(data.talleres[0])
      setLoading(false)
    })
  }, [slug])

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (!taller) return <div className="flex min-h-screen items-center justify-center"><p>Taller no encontrado</p></div>

  const whatsappUrl = taller.whatsapp ? `https://wa.me/549${taller.whatsapp.replace(/[^0-9]/g,'')}` : null

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background"><div className="mx-auto flex h-16 max-w-5xl items-center px-4"><Link href="/talleres" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Directorio</Link></div></header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl font-bold">{taller.nombre.charAt(0)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2"><h1 className="text-xl font-bold">{taller.nombre}</h1>{taller.verificado && <BadgeCheck className="h-5 w-5 text-primary" />}{taller.plan === 'PREMIUM' && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">PREMIUM</span>}</div>
              {taller.descripcion && <p className="mt-1 text-sm text-muted-foreground">{taller.descripcion}</p>}
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {taller.ciudad && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{taller.ciudad}{taller.provincia && `, ${taller.provincia}`}</span>}
                <span className="flex items-center gap-1"><Wrench className="h-4 w-4" />{taller._count?.trabajos || 0} trabajos realizados</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"><MessageCircle className="h-4 w-4" />WhatsApp</a>}
            <a href={`tel:${taller.telefono}`} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"><Phone className="h-4 w-4" />Llamar</a>
          </div>
        </div>
        <div className="mt-6 rounded-xl border-2 border-dashed p-8 text-center"><p className="text-sm text-muted-foreground">¿Tienes un vehículo que llevó a este taller? <Link href="/login?tab=registro" className="font-medium text-primary">Creá tu cuenta</Link> y reclamalo para ver el historial completo.</p></div>
      </main>
    </div>
  )
}

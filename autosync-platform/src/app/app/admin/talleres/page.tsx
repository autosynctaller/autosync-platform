'use client'
import { useEffect, useState } from 'react'
import { Loader2, Wrench, BadgeCheck } from 'lucide-react'

export default function AdminTalleres() {
  const [talleres, setTalleres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/talleres', { credentials: 'include' }).then(r => r.json()).then(d => { setTalleres(d.talleres || []); setLoading(false) })
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Talleres ({talleres.length})</h1>
      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> :
        <div className="space-y-2">
          {talleres.map(t => (
            <div key={t.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary text-sm font-bold">{t.nombre.charAt(0)}</div>
                  <div><p className="font-medium text-sm">{t.nombre}</p><p className="text-xs text-muted-foreground">{t.ciudad || 'Sin ciudad'} · {t.plan}</p></div>
                  {t.verificado && <BadgeCheck className="h-4 w-4 text-primary" />}
                </div>
                <span className="text-xs text-muted-foreground">{t._count?.trabajos || 0} trabajos</span>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}

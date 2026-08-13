'use client'
import { useEffect, useState } from 'react'
import { Loader2, Car, Wrench, TrendingUp } from 'lucide-react'

export default function EstadisticasPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/estadisticas').then(r => r.json()).then(d => setStats(d)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estadísticas</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Car} label="Vehículos" value={stats?.totales?.vehiculos || 0} />
        <StatCard icon={Wrench} label="Trabajos" value={stats?.totales?.trabajos || 0} />
        <StatCard icon={TrendingUp} label="Este mes" value={stats?.totales?.trabajosMes || 0} />
      </div>
    </div>
  )
}
function StatCard({ icon: Icon, label, value }: any) {
  return <div className="rounded-xl border border-border bg-card p-4"><div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
}

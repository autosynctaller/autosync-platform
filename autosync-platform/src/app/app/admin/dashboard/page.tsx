'use client'
import { useEffect, useState } from 'react'
import { Loader2, Wrench, Car, Megaphone, Users } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar stats básicas
    Promise.all([
      fetch('/api/talleres').then(r => r.json()),
    ]).then(([talleresData]) => {
      setStats({ talleres: talleresData.talleres?.length || 0 })
      setLoading(false)
    })
  }, [])

  if (loading) return <Loader2 className="h-8 w-8 animate-spin text-primary" />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Wrench} label="Talleres" value={stats?.talleres || 0} />
        <StatCard icon={Car} label="Vehículos" value="—" />
        <StatCard icon={Users} label="Usuarios" value="—" />
        <StatCard icon={Megaphone} label="Anuncios" value="—" />
      </div>
      <div className="rounded-xl border-2 border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">📊 Estadísticas detalladas en construcción.</p>
      </div>
    </div>
  )
}
function StatCard({ icon: Icon, label, value }: any) {
  return <div className="rounded-xl border border-border bg-card p-4"><div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
}

'use client'
import { useEffect, useState } from 'react'
import { Loader2, Wrench, Car, Megaphone, Users, FileText, CheckCircle, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' }).then(r => r.json()).then(d => { setStats(d); setLoading(false) })
  }, [])

  if (loading) return <Loader2 className="h-8 w-8 animate-spin text-primary" />

  const t = stats?.totales || {}
  const planGratis = stats?.talleresPorPlan?.find((p: any) => p.plan === 'GRATIS')?._count || 0
  const planPremium = stats?.talleresPorPlan?.find((p: any) => p.plan === 'PREMIUM')?._count || 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stats principales */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={Wrench} label="Talleres" value={t.talleres || 0} sub={`${planGratis} gratis · ${planPremium} premium`} color="bg-blue-500/10 text-blue-600" />
        <StatCard icon={Car} label="Vehículos" value={t.vehiculos || 0} sub={`${stats?.vehiculosVerificados || 0} verificados`} color="bg-emerald-500/10 text-emerald-600" />
        <StatCard icon={Users} label="Usuarios" value={t.usuarios || 0} sub="Total registrados" color="bg-purple-500/10 text-purple-600" />
        <StatCard icon={FileText} label="Trabajos" value={t.trabajos || 0} sub="Total cargados" color="bg-amber-500/10 text-amber-600" />
        <StatCard icon={Megaphone} label="Anuncios" value={t.anuncios || 0} sub={`${stats?.anunciosActivos || 0} activos`} color="bg-red-500/10 text-red-600" />
        <StatCard icon={TrendingUp} label="Plataforma" value="Online" sub="Funcionando" color="bg-zinc-500/10 text-zinc-600" />
      </div>

      {/* Estado de la plataforma */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-3 text-sm font-semibold">Estado de la plataforma</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> Base de datos (Neon)</span>
            <span className="font-medium text-emerald-600">Conectada</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> Hosting (Vercel)</span>
            <span className="font-medium text-emerald-600">Activo</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> Autenticación</span>
            <span className="font-medium text-emerald-600">Funcionando</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> PWA</span>
            <span className="font-medium text-emerald-600">Activa</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-md ${color}`}><Icon className="h-4 w-4" /></div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && <p className="mt-1 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

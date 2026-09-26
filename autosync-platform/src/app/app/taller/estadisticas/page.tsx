'use client'
import { useEffect, useState } from 'react'
import { Loader2, Car, Wrench, TrendingUp, Receipt, DollarSign, Calendar } from 'lucide-react'
import { authFetch } from '@/lib/auth-client'

export default function EstadisticasPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch('/api/estadisticas').then(r => r.json()).then(d => setStats(d)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  const t = stats?.totales || {}
  const cicloInicioFecha = t.cicloInicioFecha ? new Date(t.cicloInicioFecha).toLocaleDateString('es-AR') : ''
  const cicloFinFecha = t.cicloFinFecha ? new Date(t.cicloFinFecha).toLocaleDateString('es-AR') : ''

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Facturación</h1>

      {/* Sección: Cómo te pagaron este mes */}
      <div>
        <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Cómo te pagaron este mes
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={DollarSign} label="Total cobrado este mes" value={`$${(t.totalCobradoMes || 0).toLocaleString('es-AR')}`} highlight />
          <StatCard icon={Receipt} label="Remitos este ciclo" value={t.remitosCiclo || 0} />
          <StatCard icon={DollarSign} label="Total cobrado en el ciclo" value={`$${(t.totalCobradoCiclo || 0).toLocaleString('es-AR')}`} />
          <StatCard icon={Calendar} label="Ciclo actual" value={`${cicloInicioFecha} → ${cicloFinFecha}`} small />
        </div>
      </div>

      {/* Sección: Resumen general */}
      <div>
        <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Resumen general
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Car} label="Vehículos trabajados" value={t.vehiculos || 0} />
          <StatCard icon={Wrench} label="Trabajos totales" value={t.trabajos || 0} />
          <StatCard icon={Calendar} label="Trabajos este mes" value={t.trabajosMes || 0} />
        </div>
      </div>

      {/* Configuración del ciclo de facturación */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-2 font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Ciclo de facturación
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Tu ciclo actual empieza el día <strong>{t.cicloInicio || 1}</strong> de cada mes.
        </p>
        <CicloFacturacionEditor diaActual={t.cicloInicio || 1} />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, highlight, small }: any) {
  return (
    <div className={`rounded-xl border bg-card p-4 ${highlight ? 'border-emerald-300 bg-emerald-50' : 'border-border'}`}>
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <p className={`font-bold ${small ? 'text-sm' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

function CicloFacturacionEditor({ diaActual }: { diaActual: number }) {
  const [dia, setDia] = useState(diaActual)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const guardar = async () => {
    setSaving(true); setMsg('')
    try {
      const res = await authFetch('/api/talleres/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cicloFacturacionInicio: Number(dia) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg('✓ Ciclo actualizado')
    } catch (e) {
      setMsg('Error: ' + (e instanceof Error ? e.message : 'desconocido'))
    } finally { setSaving(false) }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs font-medium block mb-1">Día de inicio del ciclo (1-28)</label>
        <input
          type="number"
          min={1}
          max={28}
          value={dia}
          onChange={e => setDia(Number(e.target.value))}
          className="w-24 rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>
      <button
        onClick={guardar}
        disabled={saving || dia === diaActual}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
      {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      <p className="text-xs text-muted-foreground w-full">
        Por defecto: 1 (inicio de mes). Si elegís otro día, el ciclo va de ese día al mismo día del mes siguiente.
      </p>
    </div>
  )
}

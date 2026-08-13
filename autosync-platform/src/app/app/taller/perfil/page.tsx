'use client'
import { useState, useEffect } from 'react'
import { Loader2, Save, Calendar, Package, Wrench, Check } from 'lucide-react'

interface TallerData {
  nombre: string
  descripcion: string
  telefono: string
  whatsapp: string
  email: string
  direccion: string
  ciudad: string
  provincia: string
  ofreceTurnos: boolean
  horarioApertura: string
  horarioCierre: string
  diasLaborables: string
  duracionTurnoMin: number
  plan: string
}

export default function PerfilPage() {
  const [data, setData] = useState<TallerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user?.taller) {
        setData({
          nombre: d.user.taller.nombre || '',
          descripcion: '', telefono: '', whatsapp: '', email: '',
          direccion: '', ciudad: '', provincia: '',
          ofreceTurnos: false, horarioApertura: '09:00', horarioCierre: '18:00',
          diasLaborables: 'L,V,S', duracionTurnoMin: 60,
          plan: d.user.taller.plan || 'GRATIS',
        })
        // Cargar datos completos del taller
        fetch(`/api/talleres?slug=${d.user.taller.slug}`)
          .then(r => r.json())
          .then(tData => {
            if (tData.talleres?.[0]) {
              const t = tData.talleres[0]
              setData(prev => prev ? {
                ...prev,
                descripcion: t.descripcion || '',
                telefono: t.telefono || '',
                whatsapp: t.whatsapp || '',
                ciudad: t.ciudad || '',
                provincia: t.provincia || '',
                ofreceTurnos: t.ofreceTurnos || false,
              } : prev)
            }
            setLoading(false)
          })
      } else { setLoading(false) }
    })
  }, [])

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaved(false)
    try {
      const res = await fetch('/api/talleres/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al guardar')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { alert('Error al guardar') } finally { setSaving(false) }
  }

  if (loading || !data) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Editá los datos de tu taller. Esto es lo que ven los clientes.</p>
      </div>

      {data.plan === 'GRATIS' && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <div className="flex items-center justify-between">
            <div><p className="font-semibold text-amber-800">Plan Gratis</p><p className="text-xs text-amber-700">Upgradeá a Premium para stock, presupuestos y visibilidad destacada.</p></div>
            <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Mejorar a Premium</button>
          </div>
        </div>
      )}

      {saved && <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2"><Check className="h-4 w-4" />Guardado correctamente</div>}

      <form onSubmit={guardar} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-medium">Nombre del taller</label><input value={data.nombre} onChange={e => setData({...data, nombre: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          <div><label className="text-xs font-medium">Email público</label><input value={data.email} onChange={e => setData({...data, email: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
        </div>
        <div><label className="text-xs font-medium">Descripción</label><textarea value={data.descripcion} onChange={e => setData({...data, descripcion: e.target.value})} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Contá sobre tu taller, especialidades, experiencia..." /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-medium">Teléfono</label><input value={data.telefono} onChange={e => setData({...data, telefono: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          <div><label className="text-xs font-medium">WhatsApp</label><input value={data.whatsapp} onChange={e => setData({...data, whatsapp: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="2235941522" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="text-xs font-medium">Dirección</label><input value={data.direccion} onChange={e => setData({...data, direccion: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          <div><label className="text-xs font-medium">Ciudad</label><input value={data.ciudad} onChange={e => setData({...data, ciudad: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          <div><label className="text-xs font-medium">Provincia</label><input value={data.provincia} onChange={e => setData({...data, provincia: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
        </div>

        {/* Configuración de turnos */}
        <div className="rounded-lg border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Turnos online</h3></div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.ofreceTurnos} onChange={e => setData({...data, ofreceTurnos: e.target.checked})} className="h-4 w-4 rounded" />
              <span className="text-xs font-medium">{data.ofreceTurnos ? 'Activado' : 'Desactivado'}</span>
            </label>
          </div>
          {data.ofreceTurnos && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div><label className="text-xs font-medium">Apertura</label><input type="time" value={data.horarioApertura} onChange={e => setData({...data, horarioApertura: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
              <div><label className="text-xs font-medium">Cierre</label><input type="time" value={data.horarioCierre} onChange={e => setData({...data, horarioCierre: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
              <div><label className="text-xs font-medium">Duración turno (min)</label><input type="number" value={data.duracionTurnoMin} onChange={e => setData({...data, duracionTurnoMin: Number(e.target.value)})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
              <div className="sm:col-span-3"><label className="text-xs font-medium">Días laborables</label><input value={data.diasLaborables} onChange={e => setData({...data, diasLaborables: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="L,V,S (Lunes, Viernes, Sábado)" /></div>
            </div>
          )}
          {!data.ofreceTurnos && <p className="text-xs text-muted-foreground">Activá esta opción para que los clientes puedan pedir turnos online desde tu perfil público.</p>}
        </div>

        <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-1 inline h-4 w-4" />Guardar cambios</>}</button>
      </form>
    </div>
  )
}

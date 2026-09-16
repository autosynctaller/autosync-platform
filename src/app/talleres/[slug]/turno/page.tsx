'use client'
import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Loader2, Check, Car } from 'lucide-react'

function TurnoForm() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [taller, setTaller] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    nombreCliente: '', telefonoCliente: '', emailCliente: '',
    vehiculoPatente: '', vehiculoMarca: '', vehiculoModelo: '',
    fecha: '', hora: '', motivo: '', descripcion: '',
  })
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/talleres?slug=${slug}`).then(r => r.json()).then(d => {
      if (d.talleres?.[0]) {
        const t = d.talleres[0]
        if (!t.ofreceTurnos) { router.push(`/talleres/${slug}`); return }
        setTaller(t)
      }
      setLoading(false)
    })
  }, [slug, router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const fechaHora = new Date(`${form.fecha}T${form.hora}:00`)
      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tallerId: taller.id,
          ...form,
          fechaHora: fechaHora.toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOk(true)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') } finally { setSaving(false) }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (!taller) return <div className="flex min-h-screen items-center justify-center"><p>Taller no encontrado</p></div>

  if (ok) return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md rounded-xl border border-emerald-300 bg-emerald-50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100"><Check className="h-7 w-7 text-emerald-600" /></div>
        <h1 className="text-xl font-bold text-emerald-900">¡Turno solicitado!</h1>
        <p className="mt-2 text-sm text-emerald-700">{taller.nombre} va a revisar tu solicitud y te contactará para confirmar.</p>
        <Link href={`/talleres/${slug}`} className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Volver al taller</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background"><div className="mx-auto flex h-16 max-w-2xl items-center px-4"><Link href={`/talleres/${slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />{taller.nombre}</Link></div></header>
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold">Solicitar turno</h1>
        <p className="mt-1 text-sm text-muted-foreground">{taller.nombre} · {taller.ciudad || 'Sin ciudad'}</p>
        {error && <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">Nombre *</label><input value={form.nombreCliente} onChange={e => setForm({...form, nombreCliente: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Teléfono *</label><input value={form.telefonoCliente} onChange={e => setForm({...form, telefonoCliente: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="2235941522" /></div>
          </div>
          <div><label className="text-xs font-medium">Email (opcional)</label><input type="email" value={form.emailCliente} onChange={e => setForm({...form, emailCliente: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          <div className="border-t border-border pt-3">
            <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground"><Car className="h-3 w-3" />Vehículo (opcional)</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><label className="text-xs">Patente</label><input value={form.vehiculoPatente} onChange={e => setForm({...form, vehiculoPatente: e.target.value.toUpperCase()})} maxLength={7} className="w-full rounded-lg border border-border px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-primary" /></div>
              <div><label className="text-xs">Marca</label><input value={form.vehiculoMarca} onChange={e => setForm({...form, vehiculoMarca: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
              <div><label className="text-xs">Modelo</label><input value={form.vehiculoModelo} onChange={e => setForm({...form, vehiculoModelo: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">Fecha *</label><input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} required min={new Date().toISOString().split('T')[0]} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Hora *</label><input type="time" value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          </div>
          <div><label className="text-xs font-medium">Motivo *</label><input value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Ej: Cambio de aceite, revisión de frenos..." /></div>
          <div><label className="text-xs font-medium">Descripción (opcional)</label><textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Contanos más sobre el problema o lo que necesitás..." /></div>
          <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Solicitar turno'}</button>
        </form>
      </main>
    </div>
  )
}

export default function TurnoPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}><TurnoForm /></Suspense>
}

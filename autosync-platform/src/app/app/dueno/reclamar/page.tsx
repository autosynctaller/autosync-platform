'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Loader2, ArrowLeft } from 'lucide-react'

export default function ReclamarPage() {
  const router = useRouter()
  const [form, setForm] = useState({ patente: '', codigoVerificacion: '', marca: '', modelo: '', anio: '', color: '', combustible: 'Nafta' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/vehiculos/reclamar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, anio: Number(form.anio) || 2000 }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/app/dueno')
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background"><div className="mx-auto flex h-16 max-w-7xl items-center px-4"><Link href="/app/dueno" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Volver</Link></div></header>
      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"><Car className="h-6 w-6" /></div><h1 className="text-2xl font-bold">Reclamar vehículo</h1><p className="mt-1 text-sm text-muted-foreground">Verificá que sos el dueño con los últimos 3 dígitos de tu DNI.</p></div>
        {error && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div><label className="mb-1 block text-sm font-medium">Patente *</label><input value={form.patente} onChange={e => setForm({...form, patente: e.target.value.toUpperCase()})} required maxLength={7} className="w-full rounded-lg border border-border px-3 py-2 text-lg uppercase tracking-wider focus:ring-2 focus:ring-primary" placeholder="AB123CD" /></div>
          <div><label className="mb-1 block text-sm font-medium">Últimos 3 dígitos de tu DNI *</label><input value={form.codigoVerificacion} onChange={e => setForm({...form, codigoVerificacion: e.target.value})} required maxLength={3} className="w-full rounded-lg border border-border px-3 py-2 focus:ring-2 focus:ring-primary" placeholder="123" /><p className="mt-1 text-xs text-muted-foreground">Se usan para verificar que sos el dueño. No se comparten.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium">Marca</label><input value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Toyota" /></div>
            <div><label className="mb-1 block text-sm font-medium">Modelo</label><input value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Corolla" /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium">Año</label><input type="number" value={form.anio} onChange={e => setForm({...form, anio: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="2020" /></div>
            <div><label className="mb-1 block text-sm font-medium">Color</label><input value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Gris" /></div>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Reclamar vehículo'}</button>
        </form>
      </main>
    </div>
  )
}

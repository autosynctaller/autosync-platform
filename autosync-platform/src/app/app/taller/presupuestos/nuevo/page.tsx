'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react'

interface Item { descripcion: string; cantidad: number; precioUnitario: number; subtotal: number }

export default function NuevoPresupuestoPage() {
  const router = useRouter()
  const [form, setForm] = useState({ clienteNombre: '', clienteTelefono: '', clienteEmail: '', vehiculoPatente: '', vehiculoMarca: '', vehiculoModelo: '', descuento: '', notas: '', validez: '15' })
  const [items, setItems] = useState<Item[]>([{ descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0)
  const desc = Number(form.descuento) || 0
  const total = subtotal - desc

  const updateItem = (idx: number, field: keyof Item, value: string | number) => {
    const newItems = [...items]
    newItems[idx] = { ...newItems[idx], [field]: field === 'descripcion' ? value : Number(value) || 0 }
    newItems[idx].subtotal = newItems[idx].cantidad * newItems[idx].precioUnitario
    setItems(newItems)
  }

  const addItem = () => setItems([...items, { descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }])
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const res = await fetch('/api/presupuestos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, items }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/app/taller/presupuestos')
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <Link href="/app/taller/presupuestos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Volver</Link>
      <h1 className="text-2xl font-bold">Nuevo presupuesto</h1>
      {error && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        {/* Cliente */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Cliente</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">Nombre *</label><input value={form.clienteNombre} onChange={e => setForm({...form, clienteNombre: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Teléfono *</label><input value={form.clienteTelefono} onChange={e => setForm({...form, clienteTelefono: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Email</label><input value={form.clienteEmail} onChange={e => setForm({...form, clienteEmail: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div><label className="text-xs font-medium">Patente</label><input value={form.vehiculoPatente} onChange={e => setForm({...form, vehiculoPatente: e.target.value.toUpperCase()})} className="w-full rounded-lg border border-border px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Marca</label><input value={form.vehiculoMarca} onChange={e => setForm({...form, vehiculoMarca: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Modelo</label><input value={form.vehiculoModelo} onChange={e => setForm({...form, vehiculoModelo: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Items del presupuesto</h2>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-wrap gap-2">
                <input value={item.descripcion} onChange={e => updateItem(idx, 'descripcion', e.target.value)} placeholder="Descripción" className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" />
                <input type="number" value={item.cantidad} onChange={e => updateItem(idx, 'cantidad', e.target.value)} className="w-20 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Cant" />
                <input type="number" value={item.precioUnitario} onChange={e => updateItem(idx, 'precioUnitario', e.target.value)} className="w-28 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Precio" />
                <div className="flex items-center rounded-lg bg-muted px-3 py-2 text-sm font-medium w-28 justify-end">${item.subtotal.toLocaleString('es-AR')}</div>
                {items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>}
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="mt-2 flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs hover:bg-muted"><Plus className="h-3 w-3" />Agregar item</button>

          {/* Totales */}
          <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span>${subtotal.toLocaleString('es-AR')}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Descuento:</span><input type="number" value={form.descuento} onChange={e => setForm({...form, descuento: e.target.value})} className="w-24 rounded border border-border px-2 py-1 text-sm text-right" /></div>
            <div className="flex justify-between font-bold text-lg"><span>Total:</span><span className="text-primary">${total.toLocaleString('es-AR')}</span></div>
          </div>
        </div>

        {/* Notas */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">Validez (días)</label><input type="number" value={form.validez} onChange={e => setForm({...form, validez: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          </div>
          <div className="mt-3"><label className="text-xs font-medium">Notas</label><textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Condiciones, garantía, observaciones..." /></div>
        </div>

        <div className="flex gap-2"><button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-1 inline h-4 w-4" />Crear presupuesto</>}</button><Link href="/app/taller/presupuestos" className="rounded-lg border border-border px-4 py-2 text-sm">Cancelar</Link></div>
      </form>
    </div>
  )
}

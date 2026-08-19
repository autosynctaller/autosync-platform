'use client'
import { useState, useEffect } from 'react'
import { Loader2, Plus, Package, AlertTriangle, Search, X, ArrowDown, ArrowUp, Save, Camera } from 'lucide-react'
import { authFetch } from '@/lib/auth-client'
import BarcodeScanner from '@/components/site/BarcodeScanner'

interface Producto {
  id: string; nombre: string; codigo: string | null; categoria: string | null
  marca: string | null; descripcion: string | null; cantidad: number
  stockMinimo: number; precioCompra: number | null; precioVenta: number | null
  ubicacion: string | null; stockBajo: boolean
}

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showMov, setShowMov] = useState<string | null>(null)
  const [form, setForm] = useState({ nombre: '', codigo: '', categoria: '', marca: '', cantidad: '', stockMinimo: '5', precioCompra: '', precioVenta: '', ubicacion: '' })
  const [movForm, setMovForm] = useState({ tipo: 'COMPRA', cantidad: '', motivo: '', precio: '' })
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [scannerTarget, setScannerTarget] = useState<'form' | 'search'>('form')

  const cargar = () => authFetch('/api/stock/productos').then(r => r.json()).then(d => { setProductos(d.productos || []); setLoading(false) })
  useEffect(() => { cargar() }, [])

  const crear = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const res = await authFetch('/api/stock/productos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm({ nombre: '', codigo: '', categoria: '', marca: '', cantidad: '', stockMinimo: '5', precioCompra: '', precioVenta: '', ubicacion: '' })
      setShowForm(false); cargar()
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') } finally { setSaving(false) }
  }

  const registrarMov = async (productoId: string) => {
    setSaving(true); setError('')
    try {
      const res = await authFetch('/api/stock/movimientos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productoId, ...movForm }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMovForm({ tipo: 'COMPRA', cantidad: '', motivo: '', precio: '' }); setShowMov(null); cargar()
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') } finally { setSaving(false) }
  }

  const filtrados = productos.filter(p => !q || p.nombre.toLowerCase().includes(q.toLowerCase()) || p.codigo?.includes(q))
  const stockBajo = productos.filter(p => p.stockBajo).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Stock</h1><p className="text-sm text-muted-foreground">{productos.length} productos{stockBajo > 0 && <span className="text-amber-600 font-medium"> · {stockBajo} con stock bajo</span>}</p></div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="mr-2 inline h-4 w-4" />Nuevo</button>
      </div>

      {error && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Búsqueda */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o código..." className="w-full rounded-lg border border-border py-2.5 pl-10 pr-3 focus:ring-2 focus:ring-primary" />
        </div>
        <button
          type="button"
          onClick={() => { setScannerTarget('search'); setShowScanner(true) }}
          className="rounded-lg border border-border p-2.5 hover:bg-muted"
          title="Escanear código"
        >
          <Camera className="h-5 w-5" />
        </button>
      </div>

      {/* Modal del scanner */}
      {showScanner && (
        <BarcodeScanner
          onScan={(codigo) => {
            console.log('[stock] Código escaneado:', codigo)
            if (scannerTarget === 'form') {
              setForm({ ...form, codigo })
            } else {
              setQ(codigo)
            }
            setShowScanner(false)
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Formulario nuevo */}
      {showForm && (
        <form onSubmit={crear} className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">Nombre *</label><input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div>
              <label className="text-xs font-medium">Código</label>
              <div className="flex gap-1">
                <input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" />
                <button
                  type="button"
                  onClick={() => { setScannerTarget('form'); setShowScanner(true) }}
                  className="shrink-0 rounded-lg border border-border px-3 hover:bg-muted"
                  title="Escanear código de barras"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div><label className="text-xs font-medium">Categoría</label><input value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Aceites, Filtros..." /></div>
            <div><label className="text-xs font-medium">Marca</label><input value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Cantidad inicial</label><input type="number" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Stock mínimo</label><input type="number" value={form.stockMinimo} onChange={e => setForm({...form, stockMinimo: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Precio compra</label><input type="number" value={form.precioCompra} onChange={e => setForm({...form, precioCompra: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
            <div><label className="text-xs font-medium">Precio venta</label><input type="number" value={form.precioVenta} onChange={e => setForm({...form, precioVenta: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary" /></div>
          </div>
          <div className="flex gap-2"><button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-1 inline h-4 w-4" />Guardar</>}</button><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancelar</button></div>
        </form>
      )}

      {/* Lista */}
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> :
        filtrados.length === 0 ? <div className="rounded-xl border-2 border-dashed p-8 text-center"><Package className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">Sin productos cargados.</p></div> :
        <div className="space-y-2">
          {filtrados.map(p => (
            <div key={p.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{p.nombre}</span>
                    {p.stockBajo && <span className="flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700"><AlertTriangle className="h-3 w-3" />STOCK BAJO</span>}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {p.categoria && <span>{p.categoria}</span>}
                    {p.marca && <span>· {p.marca}</span>}
                    {p.codigo && <span>· Cod: {p.codigo}</span>}
                    {p.ubicacion && <span>· 📍 {p.ubicacion}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${p.stockBajo ? 'text-red-600' : ''}`}>{p.cantidad}</p>
                  <p className="text-[10px] text-muted-foreground">min: {p.stockMinimo}</p>
                </div>
                <button onClick={() => setShowMov(showMov === p.id ? null : p.id)} className="ml-2 rounded-lg border border-border p-2 hover:bg-muted"><Plus className="h-4 w-4" /></button>
              </div>
              {/* Movimiento rápido */}
              {showMov === p.id && (
                <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-2">
                  <select value={movForm.tipo} onChange={e => setMovForm({...movForm, tipo: e.target.value})} className="rounded border border-border px-2 py-1 text-xs">
                    <option value="COMPRA">Compra (+)</option><option value="USO">Uso (-)</option><option value="VENTA">Venta (-)</option><option value="PERDIDA">Pérdida (-)</option><option value="AJUSTE">Ajuste</option>
                  </select>
                  <input type="number" value={movForm.cantidad} onChange={e => setMovForm({...movForm, cantidad: e.target.value})} placeholder="Cant" className="w-16 rounded border border-border px-2 py-1 text-xs" />
                  <input value={movForm.motivo} onChange={e => setMovForm({...movForm, motivo: e.target.value})} placeholder="Motivo" className="flex-1 rounded border border-border px-2 py-1 text-xs" />
                  <button onClick={() => registrarMov(p.id)} disabled={saving} className="rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{saving ? '...' : 'OK'}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      }
    </div>
  )
}

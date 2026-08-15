'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Loader2, ArrowLeft, Wrench, Fuel } from 'lucide-react'

interface DatosTecnicos {
  motor?: string
  propulsion?: string
  distribucion?: string
  aceite?: string
  filtros?: string
  periodo?: string
  puntoCritico?: string
}

export default function ReclamarPage() {
  const router = useRouter()
  const [marcas, setMarcas] = useState<string[]>([])
  const [modelos, setModelos] = useState<string[]>([])
  const [datos, setDatos] = useState<DatosTecnicos | null>(null)

  const [form, setForm] = useState({
    patente: '', codigoVerificacion: '', marca: '', marcaManual: '', modelo: '', modeloManual: '',
    anio: '', color: '', combustible: 'Nafta',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cargandoMarcas, setCargandoMarcas] = useState(true)
  const [cargandoModelos, setCargandoModelos] = useState(false)
  const [cargandoDatos, setCargandoDatos] = useState(false)
  const [marcaEsManual, setMarcaEsManual] = useState(false)
  const [modeloEsManual, setModeloEsManual] = useState(false)

  useEffect(() => {
    fetch('/api/modelos').then(r => r.json()).then(d => {
      setMarcas(d.marcas || [])
      setCargandoMarcas(false)
    })
  }, [])

  // Marca efectiva (de la lista o manual)
  const marcaEfectiva = marcaEsManual ? form.marcaManual : form.marca
  // Modelo efectivo (de la lista o manual)
  const modeloEfectivo = modeloEsManual ? form.modeloManual : form.modelo

  // Cargar modelos cuando cambia la marca
  useEffect(() => {
    if (!marcaEfectiva || marcaEsManual) { setModelos([]); return }
    setCargandoModelos(true)
    setForm(f => ({ ...f, modelo: '' }))
    setDatos(null)
    fetch(`/api/modelos?marca=${encodeURIComponent(marcaEfectiva)}`).then(r => r.json()).then(d => {
      setModelos(d.modelos || [])
      setCargandoModelos(false)
    })
  }, [marcaEfectiva, marcaEsManual])

  // Cargar datos técnicos
  useEffect(() => {
    if (!marcaEfectiva || !modeloEfectivo) { setDatos(null); return }
    setCargandoDatos(true)
    fetch(`/api/modelos/datos?marca=${encodeURIComponent(marcaEfectiva)}&modelo=${encodeURIComponent(modeloEfectivo)}`).then(r => r.json()).then(d => {
      setDatos(d.datos || null)
      if (d.datos?.propulsion) {
        const prop = d.datos.propulsion.toLowerCase()
        if (prop.includes('diésel') || prop.includes('diesel')) setForm(f => ({ ...f, combustible: 'Diesel' }))
        else if (prop.includes('gnc')) setForm(f => ({ ...f, combustible: 'GNC' }))
        else if (prop.includes('híbrido')) setForm(f => ({ ...f, combustible: 'Híbrido' }))
        else if (prop.includes('eléctrico')) setForm(f => ({ ...f, combustible: 'Eléctrico' }))
        else setForm(f => ({ ...f, combustible: 'Nafta' }))
      }
      setCargandoDatos(false)
    })
  }, [marcaEfectiva, modeloEfectivo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const marcaFinal = marcaEfectiva || 'Desconocida'
      const modeloFinal = modeloEfectivo || 'Desconocido'
      const res = await fetch('/api/vehiculos/reclamar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          marca: marcaFinal,
          modelo: modeloFinal,
          anio: Number(form.anio) || 2000,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/app/dueno')
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4">
          <Link href="/app/dueno" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Volver</Link>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"><Car className="h-6 w-6" /></div>
          <h1 className="text-2xl font-bold">Reclamar vehículo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Seleccioná tu vehículo de la lista y verificá que sos el dueño.</p>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          {/* Patente */}
          <div>
            <label className="mb-1 block text-sm font-medium">Patente *</label>
            <input value={form.patente} onChange={e => setForm({...form, patente: e.target.value.toUpperCase()})} required maxLength={7} className="w-full rounded-lg border border-border px-3 py-2.5 text-lg uppercase tracking-wider focus:ring-2 focus:ring-primary" placeholder="AB123CD" />
          </div>

          {/* Verificación */}
          <div>
            <label className="mb-1 block text-sm font-medium">Últimos 3 dígitos de tu DNI *</label>
            <input value={form.codigoVerificacion} onChange={e => setForm({...form, codigoVerificacion: e.target.value})} required maxLength={3} className="w-full rounded-lg border border-border px-3 py-2.5 focus:ring-2 focus:ring-primary" placeholder="123" />
            <p className="mt-1 text-xs text-muted-foreground">Se usan para verificar que sos el dueño. No se comparten.</p>
          </div>

          {/* Marca - dropdown + opción manual */}
          <div>
            <label className="mb-1 block text-sm font-medium">Marca *</label>
            {!marcaEsManual ? (
              <>
                {cargandoMarcas ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Cargando marcas...</div>
                ) : (
                  <select value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2.5 focus:ring-2 focus:ring-primary">
                    <option value="">Seleccioná una marca...</option>
                    {marcas.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                )}
                <button type="button" onClick={() => { setMarcaEsManual(true); setForm(f => ({...f, marca: ''})) }} className="mt-1 text-xs text-primary hover:underline">
                  ¿No encontrás tu marca? Cargala manualmente
                </button>
              </>
            ) : (
              <>
                <input value={form.marcaManual} onChange={e => setForm({...form, marcaManual: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Ej: Mercedes-Benz" />
                <button type="button" onClick={() => { setMarcaEsManual(false); setForm(f => ({...f, marcaManual: ''})) }} className="mt-1 text-xs text-primary hover:underline">
                  ← Ver lista de marcas
                </button>
              </>
            )}
          </div>

          {/* Modelo - dropdown + opción manual */}
          {marcaEfectiva && (
            <div>
              <label className="mb-1 block text-sm font-medium">Modelo *</label>
              {!modeloEsManual ? (
                <>
                  {marcaEsManual ? (
                    <input value={form.modeloManual} onChange={e => setForm({...form, modeloManual: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Ej: C250" />
                  ) : cargandoModelos ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Cargando modelos...</div>
                  ) : modelos.length > 0 ? (
                    <select value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2.5 focus:ring-2 focus:ring-primary">
                      <option value="">Seleccioná un modelo...</option>
                      {modelos.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  ) : (
                    <input value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Escribí el modelo" />
                  )}
                  {!marcaEsManual && (
                    <button type="button" onClick={() => { setModeloEsManual(true); setForm(f => ({...f, modelo: ''})) }} className="mt-1 text-xs text-primary hover:underline">
                      ¿No encontrás tu modelo? Cargalo manualmente
                    </button>
                  )}
                </>
              ) : (
                <>
                  <input value={form.modeloManual} onChange={e => setForm({...form, modeloManual: e.target.value})} required className="w-full rounded-lg border border-border px-3 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Ej: C250" />
                  <button type="button" onClick={() => { setModeloEsManual(false); setForm(f => ({...f, modeloManual: ''})) }} className="mt-1 text-xs text-primary hover:underline">
                    ← Ver lista de modelos
                  </button>
                </>
              )}
            </div>
          )}

          {/* Datos técnicos */}
          {modeloEfectivo && cargandoDatos && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Cargando datos técnicos...</div>
          )}
          {modeloEfectivo && datos && !cargandoDatos && (
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary"><Wrench className="h-3.5 w-3.5" />Datos técnicos del modelo</p>
              <div className="grid gap-2 text-xs">
                {datos.motor && <div className="flex gap-2"><span className="font-medium text-muted-foreground w-24">Motor:</span><span>{datos.motor}</span></div>}
                {datos.propulsion && <div className="flex gap-2"><span className="font-medium text-muted-foreground w-24">Propulsión:</span><span>{datos.propulsion}</span></div>}
                {datos.distribucion && <div className="flex gap-2"><span className="font-medium text-muted-foreground w-24">Distribución:</span><span className="font-semibold">{datos.distribucion}</span></div>}
                {datos.aceite && <div className="flex gap-2"><span className="font-medium text-muted-foreground w-24">Aceite:</span><span>{datos.aceite}</span></div>}
                {datos.filtros && <div className="flex gap-2"><span className="font-medium text-muted-foreground w-24">Filtros:</span><span>{datos.filtros}</span></div>}
                {datos.periodo && <div className="flex gap-2"><span className="font-medium text-muted-foreground w-24">Período:</span><span>{datos.periodo}</span></div>}
              </div>
              {datos.puntoCritico && (
                <div className="mt-2 rounded bg-amber-100 p-2 text-xs text-amber-800">⚠️ <strong>Punto crítico:</strong> {datos.puntoCritico}</div>
              )}
            </div>
          )}

          {/* Año, color, combustible */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium">Año</label><input type="number" value={form.anio} onChange={e => setForm({...form, anio: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2.5 focus:ring-2 focus:ring-primary" placeholder="2020" /></div>
            <div><label className="mb-1 block text-sm font-medium">Color</label><input value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Gris" /></div>
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-sm font-medium"><Fuel className="h-3.5 w-3.5" />Combustible</label>
            <select value={form.combustible} onChange={e => setForm({...form, combustible: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2.5 focus:ring-2 focus:ring-primary">
              <option value="Nafta">Nafta</option><option value="Diesel">Diésel</option><option value="GNC">GNC</option><option value="Eléctrico">Eléctrico</option><option value="Híbrido">Híbrido</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Reclamar vehículo'}
          </button>
        </form>
      </main>
    </div>
  )
}

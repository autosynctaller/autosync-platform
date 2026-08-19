'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Camera, Loader2, Check, Search, Save, Zap } from 'lucide-react'
import { authFetch } from '@/lib/auth-client'

interface TrabajoRapido {
  patente: string
  vehiculoId: string | null
  marca: string
  modelo: string
  titulo: string
  descripcion: string
  precio: string
  kilometraje: string
  fotos: { url: string; categoria: string }[]
  guardando: boolean
  ok: boolean
  error: string
}

export default function CargaRapidaPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [trabajo, setTrabajo] = useState<TrabajoRapido>({
    patente: '', vehiculoId: null, marca: '', modelo: '',
    titulo: '', descripcion: '', precio: '', kilometraje: '',
    fotos: [], guardando: false, ok: false, error: '',
  })
  const [buscando, setBuscando] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    authFetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return }
      if (d.user.rol !== 'TALLER') { router.push('/app'); return }
      setUser(d.user); setLoading(false)
    })
  }, [router])

  const buscarPatente = async () => {
    if (trabajo.patente.length < 6) return
    setBuscando(true)
    try {
      const res = await authFetch(`/api/vehiculos/buscar?patente=${trabajo.patente}`)
      const data = await res.json()
      if (data.encontrado && data.vehiculo) {
        setTrabajo(t => ({ ...t, vehiculoId: data.vehiculo.id, marca: data.vehiculo.marca, modelo: data.vehiculo.modelo }))
      } else {
        // Crear vehículo nuevo
        const createRes = await authFetch('/api/vehiculos/reclamar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patente: trabajo.patente, codigoVerificacion: '000', marca: 'Desconocida', modelo: 'Desconocido', anio: 2000 }),
        })
        const createData = await createRes.json()
        if (createData.vehiculo) {
          setTrabajo(t => ({ ...t, vehiculoId: createData.vehiculo.id, marca: 'Desconocida', modelo: 'Desconocido' }))
        }
      }
    } catch {} finally { setBuscando(false) }
  }

  const tomarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('foto', file)
    const res = await authFetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) {
      setTrabajo(t => ({ ...t, fotos: [...t.fotos, { url: data.url, categoria: 'DESPUES' }] }))
    }
    e.target.value = ''
  }

  const guardar = async () => {
    if (!trabajo.vehiculoId || !trabajo.titulo || !trabajo.precio) {
      setTrabajo(t => ({ ...t, error: 'Faltan datos: patente, título y precio' }))
      return
    }
    setTrabajo(t => ({ ...t, guardando: true, error: '' }))
    try {
      const res = await authFetch(`/api/vehiculos/${trabajo.vehiculoId}/trabajos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: trabajo.titulo,
          descripcion: trabajo.descripcion || 'Trabajo cargado desde app móvil',
          precio: Number(trabajo.precio),
          estado: 'COMPLETADO',
          kilometraje: trabajo.kilometraje ? Number(trabajo.kilometraje) : null,
          fecha: new Date().toISOString().split('T')[0],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Subir fotos
      if (data.trabajo?.id && trabajo.fotos.length > 0) {
        for (const f of trabajo.fotos) {
          await authFetch(`/api/trabajos/${data.trabajo.id}/fotos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(f),
          })
        }
      }

      setTrabajo(t => ({ ...t, ok: true, guardando: false }))
      setTimeout(() => {
        setTrabajo({
          patente: '', vehiculoId: null, marca: '', modelo: '',
          titulo: '', descripcion: '', precio: '', kilometraje: '',
          fotos: [], guardando: false, ok: false, error: '',
        })
      }, 2000)
    } catch (err) {
      setTrabajo(t => ({ ...t, error: err instanceof Error ? err.message : 'Error', guardando: false }))
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-900">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-zinc-900"><Zap className="h-4 w-4" /></div>
            <span className="font-bold">Carga rápida</span>
          </div>
          <a href="/app/taller/vehiculos" className="text-xs text-zinc-400 hover:text-white">Panel completo →</a>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        {trabajo.ok ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500"><Check className="h-8 w-8 text-white" /></div>
            <p className="mt-4 text-lg font-bold">¡Trabajo cargado!</p>
            <p className="text-sm text-zinc-400">Cargando próximo...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Paso 1: Patente */}
            <div className="rounded-xl bg-zinc-900 p-4">
              <label className="mb-1 block text-xs font-medium text-zinc-400">Patente del vehículo</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trabajo.patente}
                  onChange={e => setTrabajo(t => ({ ...t, patente: e.target.value.toUpperCase(), vehiculoId: null }))}
                  onBlur={buscarPatente}
                  maxLength={7}
                  placeholder="AB123CD"
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-center text-xl font-bold uppercase tracking-widest text-white placeholder:normal-case placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                />
                {buscando && <Loader2 className="h-5 w-5 animate-spin self-center text-primary" />}
              </div>
              {trabajo.vehiculoId && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-900/30 px-3 py-2">
                  <Car className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300">{trabajo.marca} {trabajo.modelo}</span>
                </div>
              )}
            </div>

            {/* Paso 2: Trabajo */}
            {trabajo.vehiculoId && (
              <>
                <div className="rounded-xl bg-zinc-900 p-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-400">Trabajo realizado *</label>
                    <input
                      value={trabajo.titulo}
                      onChange={e => setTrabajo(t => ({ ...t, titulo: e.target.value }))}
                      placeholder="Ej: Cambio de aceite"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-400">Descripción</label>
                    <textarea
                      value={trabajo.descripcion}
                      onChange={e => setTrabajo(t => ({ ...t, descripcion: e.target.value }))}
                      rows={2}
                      placeholder="Detalles del trabajo..."
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Precio *</label>
                      <input
                        type="number"
                        value={trabajo.precio}
                        onChange={e => setTrabajo(t => ({ ...t, precio: e.target.value }))}
                        placeholder="35000"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Kilometraje</label>
                      <input
                        type="number"
                        value={trabajo.kilometraje}
                        onChange={e => setTrabajo(t => ({ ...t, kilometraje: e.target.value }))}
                        placeholder="85000"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Paso 3: Fotos */}
                <div className="rounded-xl bg-zinc-900 p-4">
                  <label className="mb-2 block text-xs font-medium text-zinc-400">Fotos del trabajo (opcional)</label>
                  <div className="flex flex-wrap gap-2">
                    {trabajo.fotos.map((f, i) => (
                      <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-700">
                        <img src={f.url} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() => setTrabajo(t => ({ ...t, fotos: t.fotos.filter((_, idx) => idx !== i) }))}
                          className="absolute right-0 top-0 rounded-bl-lg bg-red-500 px-1 text-xs text-white"
                        >✕</button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 text-zinc-500 hover:border-primary hover:text-primary"
                    >
                      <Camera className="h-6 w-6" />
                      <span className="text-[10px]">Agregar</span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={tomarFoto} className="hidden" />
                  </div>
                </div>

                {/* Error */}
                {trabajo.error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-400">{trabajo.error}</div>
                )}

                {/* Guardar */}
                <button
                  onClick={guardar}
                  disabled={trabajo.guardando}
                  className="w-full rounded-xl bg-primary py-3.5 font-bold text-zinc-900 hover:bg-primary/90 disabled:opacity-50"
                >
                  {trabajo.guardando ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : '✓ Guardar trabajo'}
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

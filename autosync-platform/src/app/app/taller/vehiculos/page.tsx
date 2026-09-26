'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Car, Search, Loader2, Plus, Calendar, Gauge, MessageCircle, User } from 'lucide-react'
import { authFetch } from '@/lib/auth-client'

interface Vehiculo {
  id: string
  patente: string
  marca: string
  modelo: string
  anio: number
  kilometraje: number | null
  clienteNombre?: string | null
  clienteWhatsapp?: string | null
  totalTrabajosTaller?: number
  ultimoTrabajo?: string
}

export default function TallerVehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [patente, setPatente] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [resultado, setResultado] = useState<null | { encontrado: boolean; vehiculo?: Vehiculo; mensaje: string }>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    authFetch('/api/vehiculos')
      .then(r => r.json())
      .then(data => setVehiculos(data.vehiculos || []))
      .finally(() => setLoading(false))
  }, [])

  const buscarPatente = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patente || patente.length < 6) return
    setBuscando(true)
    setError('')
    setResultado(null)
    try {
      const res = await authFetch(`/api/vehiculos/buscar?patente=${encodeURIComponent(patente)}`)
      const data = await res.json()
      setResultado(data)
    } catch {
      setError('Error al buscar')
    } finally {
      setBuscando(false)
    }
  }

  const abrirWhatsapp = (e: React.MouseEvent, telefono: string, patente: string, nombre?: string) => {
    e.preventDefault()
    e.stopPropagation()
    const numero = telefono.replace(/\D/g, '')
    if (!numero) return
    const numeroCompleto = numero.startsWith('54') ? numero : `54${numero}`
    const saludo = nombre ? `Hola ${nombre}, ` : 'Hola, '
    const mensaje = encodeURIComponent(`${saludo}te contacto desde el taller por tu vehículo patente ${patente}.`)
    window.open(`https://wa.me/${numeroCompleto}?text=${mensaje}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vehículos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Buscá un vehículo por patente para cargar trabajos o ver tu historial.</p>
      </div>

      {/* Búsqueda por patente */}
      <div className="rounded-xl border border-border bg-card p-4">
        <form onSubmit={buscarPatente} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={patente}
              onChange={(e) => setPatente(e.target.value.toUpperCase())}
              placeholder="Ingresá la patente (ej: AB123CD)"
              className="w-full rounded-lg border border-border py-2.5 pl-10 pr-3 text-lg uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={7}
            />
          </div>
          <button type="submit" disabled={buscando} className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {buscando ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Buscar'}
          </button>
        </form>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        {resultado && (
          <div className="mt-4 rounded-lg border border-border p-4">
            {resultado.encontrado && resultado.vehiculo ? (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{resultado.vehiculo.marca} {resultado.vehiculo.modelo} ({resultado.vehiculo.anio})</p>
                    <p className="text-sm text-muted-foreground">{resultado.mensaje}</p>
                  </div>
                  <Link href={`/app/taller/vehiculos/${resultado.vehiculo.id}`} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                    Ver vehículo →
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">{resultado.mensaje}</p>
                <button onClick={() => {
                  authFetch('/api/vehiculos/reclamar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ patente, marca: 'Desconocida', modelo: 'Desconocido', anio: 2000 }),
                  }).then(r => r.json()).then(data => {
                    if (data.vehiculo) window.location.href = `/app/taller/vehiculos/${data.vehiculo.id}`
                  })
                }} className="mt-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5">
                  Cargar este vehículo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lista de vehículos trabajados */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Vehículos que trabajaste</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : vehiculos.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Car className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Todavía no trabajaste en ningún vehículo. Buscá una patente arriba para empezar.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {vehiculos.map((v) => (
              <Link key={v.id} href={`/app/taller/vehiculos/${v.id}`} className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{v.marca} {v.modelo}</p>
                      <p className="text-sm text-muted-foreground">{v.anio} · <span className="font-mono">{v.patente}</span></p>
                    </div>
                  </div>
                  {v.clienteWhatsapp && (
                    <button
                      onClick={(e) => abrirWhatsapp(e, v.clienteWhatsapp!, v.patente, v.clienteNombre || undefined)}
                      className="shrink-0 rounded-lg border border-emerald-300 bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      title={`Enviar WhatsApp a ${v.clienteNombre || 'cliente'}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Info del cliente (nombre + whatsapp) */}
                {(v.clienteNombre || v.clienteWhatsapp) && (
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {v.clienteNombre && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3 w-3" />
                        {v.clienteNombre}
                      </span>
                    )}
                    {v.clienteWhatsapp && (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <MessageCircle className="h-3 w-3" />
                        {v.clienteWhatsapp}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  {v.kilometraje != null && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.kilometraje.toLocaleString('es-AR')} km</span>}
                  {v.ultimoTrabajo && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(v.ultimoTrabajo).toLocaleDateString('es-AR')}</span>}
                  {v.totalTrabajosTaller != null && <span>{v.totalTrabajosTaller} trabajo(s)</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

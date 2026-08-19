'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, Plus, FileText, Trash2, Send, Check, X, Car, Phone } from 'lucide-react'
import { authFetch } from '@/lib/auth-client'

interface Presupuesto {
  id: string
  clienteNombre: string
  clienteTelefono: string
  vehiculoPatente: string | null
  vehiculoMarca: string | null
  vehiculoModelo: string | null
  total: number
  estado: string
  creadoEn: string
}

export default function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cargar = () => authFetch('/api/presupuestos').then(r => r.json()).then(d => {
    if (d.error) setError(d.error)
    setPresupuestos(d.presupuestos || [])
    setLoading(false)
  })
  useEffect(() => { cargar() }, [])

  const cambiarEstado = async (id: string, estado: string) => {
    await authFetch(`/api/presupuestos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }) })
    cargar()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar presupuesto?')) return
    await authFetch(`/api/presupuestos/${id}`, { method: 'DELETE' })
    cargar()
  }

  const estadoColor: Record<string, string> = {
    BORRADOR: 'bg-zinc-100 text-zinc-700', ENVIADO: 'bg-blue-100 text-blue-700',
    APROBADO: 'bg-emerald-100 text-emerald-700', RECHAZADO: 'bg-red-100 text-red-700', VENCIDO: 'bg-amber-100 text-amber-700',
  }

  if (error) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Presupuestos</h1>
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-6 text-center">
        <p className="font-semibold text-amber-800">Plan Premium requerido</p>
        <p className="mt-1 text-sm text-amber-700">Los presupuestos están disponibles solo en el plan Premium.</p>
        <Link href="/app/taller/perfil" className="mt-3 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Mejorar a Premium</Link>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Presupuestos</h1><p className="text-sm text-muted-foreground">{presupuestos.length} presupuestos</p></div>
        <Link href="/app/taller/presupuestos/nuevo" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="mr-2 inline h-4 w-4" />Nuevo</Link>
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> :
        presupuestos.length === 0 ? <div className="rounded-xl border-2 border-dashed p-8 text-center"><FileText className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">Sin presupuestos creados.</p></div> :
        <div className="space-y-2">
          {presupuestos.map(p => (
            <div key={p.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{p.clienteNombre}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${estadoColor[p.estado]}`}>{p.estado}</span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.clienteTelefono}</span>
                    {p.vehiculoPatente && <span className="flex items-center gap-1"><Car className="h-3 w-3" />{p.vehiculoMarca} {p.vehiculoModelo} · <span className="font-mono">{p.vehiculoPatente}</span></span>}
                    <span className="font-bold text-foreground">${p.total.toLocaleString('es-AR')}</span>
                    <span>{new Date(p.creadoEn).toLocaleDateString('es-AR')}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {p.estado === 'BORRADOR' && <button onClick={() => cambiarEstado(p.id, 'ENVIADO')} className="rounded p-2 text-blue-600 hover:bg-blue-50" title="Marcar enviado"><Send className="h-4 w-4" /></button>}
                  {p.estado === 'ENVIADO' && <>
                    <button onClick={() => cambiarEstado(p.id, 'APROBADO')} className="rounded p-2 text-emerald-600 hover:bg-emerald-50" title="Aprobado"><Check className="h-4 w-4" /></button>
                    <button onClick={() => cambiarEstado(p.id, 'RECHAZADO')} className="rounded p-2 text-red-600 hover:bg-red-50" title="Rechazado"><X className="h-4 w-4" /></button>
                  </>}
                  <button onClick={() => eliminar(p.id)} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}

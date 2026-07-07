'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { formatPrecio, formatFecha, normalizarPatente } from '@/lib/format'
import {
  Search,
  Car,
  User,
  Phone,
  Wrench,
  Calendar,
  Loader2,
  FileX2,
  AlertCircle,
} from 'lucide-react'

interface Trabajo {
  id: string
  titulo: string
  descripcion: string
  precio: number
  estado: string
  fecha: string
  proximo: string | null
  servicio: { nombre: string; categoria: string } | null
}

interface Vehiculo {
  id: string
  marca: string
  modelo: string
  anio: number
  patente: string
  color: string | null
  kilometraje: number | null
  tipo: string
  combustible: string | null
  notas: string | null
  cliente: {
    nombre: string
    telefono: string
    email: string | null
  }
  trabajos: Trabajo[]
}

const ESTADO_COLORS: Record<string, string> = {
  Completado: 'bg-emerald-100 text-emerald-800',
  'En proceso': 'bg-amber-100 text-amber-800',
  Pendiente: 'bg-zinc-100 text-zinc-800',
}

export function ConsultarHistorial() {
  const { toast } = useToast()
  const [patente, setPatente] = useState('')
  const [loading, setLoading] = useState(false)
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null)
  const [noEncontrado, setNoEncontrado] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const p = normalizarPatente(patente)
    if (p.length < 6) {
      toast({
        title: 'Patente inválida',
        description: 'Ingresá una patente válida (ej: AB123CD o ABC123).',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setVehiculo(null)
    setNoEncontrado(false)

    try {
      const res = await fetch(`/api/vehiculos?patente=${encodeURIComponent(p)}`)
      if (res.status === 404) {
        setNoEncontrado(true)
        return
      }
      const data = await res.json()
      setVehiculo(data.vehiculo)
    } catch {
      toast({
        title: 'Error de conexión',
        description: 'No pudimos consultar el historial. Intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="historial"
      className="border-b border-border/60 bg-muted/30 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3">
            Mi historial
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Consultá el historial de tu vehículo
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ingresá la patente de tu auto y mirá todos los trabajos que le
            fuimos realizando, con fecha, descripción y precio.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={patente}
              onChange={(e) => setPatente(e.target.value.toUpperCase())}
              placeholder="Ingresá tu patente (ej: AB123CD)"
              className="pl-10 uppercase"
              maxLength={7}
            />
          </div>
          <Button type="submit" disabled={loading} className="shrink-0">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Consultar
              </>
            )}
          </Button>
        </form>

        {/* Estado: cargando */}
        {loading && (
          <div className="mx-auto mt-8 max-w-3xl">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        )}

        {/* Estado: no encontrado */}
        {noEncontrado && !loading && (
          <Card className="mx-auto mt-8 max-w-3xl border-amber-200 bg-amber-50">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900">
                No encontramos un vehículo con esa patente
              </h3>
              <p className="max-w-md text-sm text-amber-800">
                Es posible que todavía no esté registrado en nuestro sistema.
                Podés registrarlo desde la sección anterior o comunicarte con
                nosotros.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNoEncontrado(false)
                    document
                      .querySelector('#registrar')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Registrar mi vehículo
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setNoEncontrado(false)}
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado: resultado */}
        {vehiculo && !loading && (
          <div className="mx-auto mt-8 max-w-4xl space-y-6">
            {/* Resumen del vehículo */}
            <Card className="border-border/60">
              <CardHeader className="bg-zinc-900 text-zinc-50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Car className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-zinc-50">
                        {vehiculo.marca} {vehiculo.modelo}
                      </CardTitle>
                      <p className="mt-0.5 text-sm text-zinc-300">
                        {vehiculo.anio} · {vehiculo.tipo}
                        {vehiculo.combustible && ` · ${vehiculo.combustible}`}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-zinc-800 px-4 py-2 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">
                      Patente
                    </p>
                    <p className="text-lg font-bold tracking-wider text-primary">
                      {vehiculo.patente}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoItem
                    icon={User}
                    label="Titular"
                    value={vehiculo.cliente.nombre}
                  />
                  <InfoItem
                    icon={Phone}
                    label="Teléfono"
                    value={vehiculo.cliente.telefono}
                  />
                  <InfoItem
                    icon={Car}
                    label="Color"
                    value={vehiculo.color || '—'}
                  />
                  <InfoItem
                    icon={Wrench}
                    label="Kilometraje"
                    value={
                      vehiculo.kilometraje
                        ? `${vehiculo.kilometraje.toLocaleString('es-AR')} km`
                        : '—'
                    }
                  />
                </div>
                {vehiculo.notas && (
                  <div className="mt-4 rounded-lg bg-muted p-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Notas registradas
                    </p>
                    <p className="mt-1 text-sm">{vehiculo.notas}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de trabajos */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Wrench className="h-5 w-5 text-primary" />
                  Trabajos realizados
                  <Badge variant="secondary">
                    {vehiculo.trabajos.length}
                  </Badge>
                </h3>
              </div>

              {vehiculo.trabajos.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                    <FileX2 className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Sin trabajos registrados aún</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Cuando realicemos el primer trabajo en tu vehículo, lo
                        vas a ver acá.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ol className="space-y-3">
                  {vehiculo.trabajos.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-xl border border-border/60 bg-card p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold">{t.titulo}</h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                ESTADO_COLORS[t.estado] ||
                                'bg-muted text-muted-foreground'
                              }`}
                            >
                              {t.estado}
                            </span>
                            {t.servicio && (
                              <Badge variant="outline">
                                {t.servicio.categoria}
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1.5 text-sm text-muted-foreground">
                            {t.descripcion}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatFecha(t.fecha)}
                            </span>
                            {t.proximo && (
                              <span className="flex items-center gap-1 font-medium text-primary">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Próximo: {t.proximo}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Precio
                          </p>
                          <p className="text-lg font-bold">
                            {formatPrecio(t.precio)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

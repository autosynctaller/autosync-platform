'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { formatFecha, normalizarPatente } from '@/lib/format'
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
  Gauge,
  X,
  MapPin,
  Fuel,
  Palette,
  Camera,
  Clock,
  Edit,
  Save,
  FileDown,
} from 'lucide-react'
import { generarPDFHistorial } from '@/lib/pdf-historial'

interface Trabajo {
  id: string
  titulo: string
  descripcion: string
  estado: string
  fecha: string
  kilometraje: number | null
  proximo: string | null
  servicio: { nombre: string; categoria: string } | null
}

interface Foto {
  id: string
  url: string
  descripcion: string | null
  createdAt: string
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
  vtvVencimiento: string | null
  gncVencimiento: string | null
  cliente: {
    nombre: string
    telefono: string
    email: string | null
  }
  trabajos: Trabajo[]
  fotos: Foto[]
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
  const [fotoAmpliada, setFotoAmpliada] = useState<Foto | null>(null)

  // Edición cliente
  const [editando, setEditando] = useState(false)
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)
  const [formEdicion, setFormEdicion] = useState({
    color: '',
    kilometraje: '',
    notas: '',
  })

  const abrirEdicion = () => {
    if (!vehiculo) return
    setFormEdicion({
      color: vehiculo.color || '',
      kilometraje:
        vehiculo.kilometraje != null ? String(vehiculo.kilometraje) : '',
      notas: vehiculo.notas || '',
    })
    setEditando(true)
  }

  const guardarEdicionCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehiculo) return
    setGuardandoEdicion(true)
    try {
      const res = await fetch(`/api/vehiculos/${vehiculo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: true,
          color: formEdicion.color || null,
          kilometraje: formEdicion.kilometraje
            ? Number(formEdicion.kilometraje)
            : null,
          notas: formEdicion.notas || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      setVehiculo({ ...vehiculo, ...data.vehiculo })
      toast({
        title: 'Datos actualizados',
        description: 'Tu vehículo se actualizó correctamente.',
      })
      setEditando(false)
    } catch (err: unknown) {
      toast({
        title: 'No se pudo guardar',
        description:
          err instanceof Error ? err.message : 'Intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setGuardandoEdicion(false)
    }
  }

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
            fuimos realizando, con fecha y descripción detallada de cada uno.
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

        {loading && (
          <div className="mx-auto mt-8 max-w-3xl">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        )}

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

        {vehiculo && !loading && (
          <div className="mx-auto mt-8 max-w-4xl space-y-6">
            {/* Tarjeta principal del vehículo */}
            <Card className="overflow-hidden border-border/60">
              <CardHeader className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 text-zinc-50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Car className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-zinc-50 sm:text-2xl">
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

              {/* Galería de fotos (si existen) */}
              {vehiculo.fotos.length > 0 && (
                <div className="border-b border-border/60 bg-muted/30 p-4 sm:p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Camera className="h-4 w-4 text-primary" />
                    Fotos del vehículo ({vehiculo.fotos.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {vehiculo.fotos.map((foto) => (
                      <button
                        key={foto.id}
                        onClick={() => setFotoAmpliada(foto)}
                        className="group relative aspect-square overflow-hidden rounded-md border border-border/60 bg-card transition-transform hover:scale-105"
                      >
                        <img
                          src={foto.url}
                          alt={foto.descripcion || 'Foto del vehículo'}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <CardContent className="p-6">
                {/* Ficha técnica */}
                <div className="mb-5">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ficha técnica
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <FichaItem
                      icon={User}
                      label="Titular"
                      value={vehiculo.cliente.nombre}
                    />
                    <FichaItem
                      icon={Phone}
                      label="Teléfono"
                      value={vehiculo.cliente.telefono}
                    />
                    <FichaItem
                      icon={Palette}
                      label="Color"
                      value={vehiculo.color || '—'}
                    />
                    <FichaItem
                      icon={Gauge}
                      label="Kilometraje"
                      value={
                        vehiculo.kilometraje
                          ? `${vehiculo.kilometraje.toLocaleString('es-AR')} km`
                          : '—'
                      }
                    />
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <FichaItem
                      icon={Car}
                      label="Tipo"
                      value={vehiculo.tipo}
                    />
                    {vehiculo.combustible && (
                      <FichaItem
                        icon={Fuel}
                        label="Combustible"
                        value={vehiculo.combustible}
                      />
                    )}
                    <FichaItem
                      icon={Calendar}
                      label="Año"
                      value={String(vehiculo.anio)}
                    />
                  </div>
                </div>

                {/* Vencimientos VTV y GNC */}
                {(vehiculo.vtvVencimiento || vehiculo.gncVencimiento) && (
                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    {vehiculo.vtvVencimiento && (
                      <VencimientoCard
                        titulo="VTV"
                        fecha={vehiculo.vtvVencimiento}
                      />
                    )}
                    {vehiculo.gncVencimiento && (
                      <VencimientoCard
                        titulo="Obleta GNC"
                        fecha={vehiculo.gncVencimiento}
                      />
                    )}
                  </div>
                )}

                {vehiculo.notas && (
                  <div className="mb-5 rounded-lg border-l-4 border-primary bg-primary/5 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Notas registradas
                    </p>
                    <p className="mt-1 text-sm">{vehiculo.notas}</p>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="mb-5 flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (vehiculo) {
                        generarPDFHistorial(vehiculo)
                        toast({
                          title: 'PDF generado',
                          description: 'Revisá las descargas de tu navegador.',
                        })
                      }
                    }}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={abrirEdicion}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar mi vehículo
                  </Button>
                </div>

                {/* Timeline de trabajos */}
                <div>
                  <h3 className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      Trabajos realizados
                    </span>
                    <Badge variant="secondary">
                      {vehiculo.trabajos.length}
                    </Badge>
                  </h3>

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
                    <ol className="relative space-y-4 border-l-2 border-border/60 pl-6">
                      {vehiculo.trabajos.map((t, idx) => (
                        <li key={t.id} className="relative">
                          {/* Punto del timeline */}
                          <span className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground">
                            {vehiculo.trabajos.length - idx}
                          </span>

                          <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
                            {/* Fecha y km */}
                            <div className="mb-2 flex flex-wrap items-center gap-3 text-xs">
                              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2 py-1 font-medium text-zinc-50">
                                <Calendar className="h-3 w-3" />
                                {formatFecha(t.fecha)}
                              </span>
                              {t.kilometraje != null && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 font-medium text-primary">
                                  <Gauge className="h-3 w-3" />
                                  {t.kilometraje.toLocaleString('es-AR')} km
                                </span>
                              )}
                            </div>

                            {/* Título y badges */}
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-semibold">
                                {t.titulo}
                              </h4>
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

                            {/* Descripción */}
                            <p className="mt-2 text-sm text-muted-foreground">
                              {t.descripcion}
                            </p>

                            {/* Próxima revisión */}
                            {t.proximo && (
                              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                                <Clock className="h-3.5 w-3.5" />
                                Próxima revisión: {t.proximo}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Visor de foto ampliada */}
      {fotoAmpliada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setFotoAmpliada(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setFotoAmpliada(null)}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fotoAmpliada.url}
              alt={fotoAmpliada.descripcion || 'Foto del vehículo'}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
            {fotoAmpliada.descripcion && (
              <p className="mt-3 text-center text-sm text-white">
                {fotoAmpliada.descripcion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Diálogo de edición (cliente) */}
      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Editar mi vehículo
            </DialogTitle>
            <DialogDescription>
              Actualizá los datos de tu {vehiculo?.marca} {vehiculo?.modelo}.
              La marca, modelo, año y patente solo los puede modificar el
              taller.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={guardarEdicionCliente} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="c-color" className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" /> Color
              </Label>
              <Input
                id="c-color"
                value={formEdicion.color}
                onChange={(e) =>
                  setFormEdicion((f) => ({ ...f, color: e.target.value }))
                }
                placeholder="Ej: Gris, Blanco, Negro..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-km" className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" /> Kilometraje actual
              </Label>
              <Input
                id="c-km"
                type="number"
                min="0"
                value={formEdicion.kilometraje}
                onChange={(e) =>
                  setFormEdicion((f) => ({ ...f, kilometraje: e.target.value }))
                }
                placeholder="Ej: 95000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-notas">Notas para el taller</Label>
              <Textarea
                id="c-notas"
                value={formEdicion.notas}
                onChange={(e) =>
                  setFormEdicion((f) => ({ ...f, notas: e.target.value }))
                }
                placeholder="Avisanos si hay algún detalle, ruido o problema a revisar."
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardandoEdicion}>
                {guardandoEdicion ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function VencimientoCard({
  titulo,
  fecha,
}: {
  titulo: string
  fecha: string
}) {
  const fechaObj = new Date(fecha)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const diasRestantes = Math.ceil(
    (fechaObj.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
  )

  let estado: 'vencido' | 'hoy' | 'proximo' | 'aldia'
  let color: string
  let icono: string

  if (diasRestantes < 0) {
    estado = 'vencido'
    color = 'border-red-300 bg-red-50 text-red-800'
    icono = '⚠️'
  } else if (diasRestantes === 0) {
    estado = 'hoy'
    color = 'border-amber-300 bg-amber-50 text-amber-800'
    icono = '⏰'
  } else if (diasRestantes <= 30) {
    estado = 'proximo'
    color = 'border-amber-300 bg-amber-50 text-amber-800'
    icono = '⏰'
  } else {
    estado = 'aldia'
    color = 'border-emerald-200 bg-emerald-50 text-emerald-800'
    icono = '✓'
  }

  const textoEstado =
    estado === 'vencido'
      ? `Vencida hace ${Math.abs(diasRestantes)} día(s)`
      : estado === 'hoy'
        ? 'Vence hoy'
        : estado === 'proximo'
          ? `Vence en ${diasRestantes} día(s)`
          : 'Al día'

  return (
    <div className={`rounded-lg border-2 p-3 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
            {titulo}
          </p>
          <p className="text-sm font-bold">
            {icono} {formatFecha(fecha)}
          </p>
        </div>
        <span className="text-xs font-semibold">
          {textoEstado}
        </span>
      </div>
    </div>
  )
}

function FichaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-background/50 p-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

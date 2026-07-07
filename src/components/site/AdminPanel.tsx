'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { formatPrecio, formatFecha, normalizarPatente } from '@/lib/format'
import {
  Lock,
  Loader2,
  ShieldCheck,
  LogOut,
  Car,
  Search,
  Plus,
  Wrench,
  ChevronRight,
  ArrowLeft,
  Camera,
  Trash2,
  Image as ImageIcon,
  Gauge,
  Calendar,
  X,
} from 'lucide-react'

interface ServicioOption {
  id: string
  nombre: string
  precioBase: number | null
  categoria: string
}

interface VehiculoListItem {
  id: string
  marca: string
  modelo: string
  anio: number
  patente: string
  tipo: string
  cliente: { nombre: string; telefono: string }
  _count: { trabajos: number }
}

interface TrabajoDetalle {
  id: string
  titulo: string
  descripcion: string
  precio: number
  estado: string
  fecha: string
  kilometraje: number | null
  proximo: string | null
  servicio: { nombre: string; categoria: string } | null
}

interface FotoDetalle {
  id: string
  url: string
  descripcion: string | null
  createdAt: string
}

interface VehiculoDetalle {
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
    direccion: string | null
  }
  trabajos: TrabajoDetalle[]
  fotos: FotoDetalle[]
}

const ESTADOS = ['Completado', 'En proceso', 'Pendiente']

export function AdminPanel({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { toast } = useToast()
  const [paso, setPaso] = useState<'login' | 'lista' | 'detalle' | 'cargar'>(
    'login',
  )
  const [pin, setPin] = useState('')
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  // lista
  const [vehiculos, setVehiculos] = useState<VehiculoListItem[]>([])
  const [listaLoading, setListaLoading] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  // detalle
  const [vehiculoDetalle, setVehiculoDetalle] =
    useState<VehiculoDetalle | null>(null)
  const [detalleLoading, setDetalleLoading] = useState(false)

  // formulario nuevo trabajo
  const [servicios, setServicios] = useState<ServicioOption[]>([])
  const [nuevoTrabajo, setNuevoTrabajo] = useState({
    servicioId: '',
    titulo: '',
    descripcion: '',
    precio: '',
    estado: 'Completado',
    proximo: '',
    fecha: '', // YYYY-MM-DD
    kilometraje: '',
  })
  const [guardando, setGuardando] = useState(false)

  // fotos
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [descripcionFoto, setDescripcionFoto] = useState('')
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null)

  // Cerrar sesión
  const logout = () => {
    setAuthToken(null)
    setPin('')
    setPaso('login')
    setVehiculos([])
    setVehiculoDetalle(null)
    onOpenChange(false)
  }

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin) return
    setLoginLoading(true)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'PIN incorrecto')
      setAuthToken(data.token)
      setPaso('lista')
      toast({
        title: 'Acceso concedido',
        description: 'Bienvenido al panel de administración.',
      })
      void cargarLista(data.token)
      void cargarServicios()
    } catch (err: unknown) {
      toast({
        title: 'PIN incorrecto',
        description:
          err instanceof Error ? err.message : 'Verificá el PIN e intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setLoginLoading(false)
    }
  }

  const cargarLista = useCallback(async (token: string) => {
    setListaLoading(true)
    try {
      const res = await fetch('/api/vehiculos?admin=1')
      const data = await res.json()
      setVehiculos(data.vehiculos || [])
    } catch {
      toast({
        title: 'Error al cargar',
        description: 'No se pudieron obtener los vehículos.',
        variant: 'destructive',
      })
    } finally {
      setListaLoading(false)
    }
  }, [toast])

  const cargarServicios = useCallback(async () => {
    try {
      const res = await fetch('/api/servicios')
      const data = await res.json()
      setServicios(data.servicios || [])
    } catch {
      // silencioso
    }
  }, [])

  const verDetalle = async (v: VehiculoListItem) => {
    setDetalleLoading(true)
    setPaso('detalle')
    try {
      const res = await fetch(`/api/vehiculos/${v.id}`)
      const data = await res.json()
      setVehiculoDetalle(data.vehiculo)
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el detalle del vehículo.',
        variant: 'destructive',
      })
    } finally {
      setDetalleLoading(false)
    }
  }

  const registrarTrabajo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehiculoDetalle || !authToken) return
    if (!nuevoTrabajo.titulo || !nuevoTrabajo.descripcion || !nuevoTrabajo.precio) {
      toast({
        title: 'Faltan datos',
        description: 'Título, descripción y precio son obligatorios.',
        variant: 'destructive',
      })
      return
    }
    setGuardando(true)
    try {
      const res = await fetch('/api/trabajos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': authToken,
        },
        body: JSON.stringify({
          vehiculoId: vehiculoDetalle.id,
          servicioId: nuevoTrabajo.servicioId || null,
          titulo: nuevoTrabajo.titulo,
          descripcion: nuevoTrabajo.descripcion,
          precio: Number(nuevoTrabajo.precio),
          estado: nuevoTrabajo.estado,
          proximo: nuevoTrabajo.proximo || null,
          fecha: nuevoTrabajo.fecha || null,
          kilometraje: nuevoTrabajo.kilometraje
            ? Number(nuevoTrabajo.kilometraje)
            : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      toast({
        title: 'Trabajo registrado',
        description: 'El historial del vehículo fue actualizado.',
      })
      // Pre-cargar la fecha de hoy para el próximo trabajo
      const hoy = new Date().toISOString().split('T')[0]
      setNuevoTrabajo({
        servicioId: '',
        titulo: '',
        descripcion: '',
        precio: '',
        estado: 'Completado',
        proximo: '',
        fecha: hoy,
        kilometraje: '',
      })
      // recargar detalle
      await verDetalle(vehiculoDetalle as unknown as VehiculoListItem)
      setPaso('detalle')
    } catch (err: unknown) {
      toast({
        title: 'Error al guardar',
        description:
          err instanceof Error ? err.message : 'Intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setGuardando(false)
    }
  }

  // Subir foto
  const subirFoto = async (file: File) => {
    if (!vehiculoDetalle || !authToken) return
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Foto muy pesada',
        description: 'Máximo 5 MB por foto.',
        variant: 'destructive',
      })
      return
    }
    setSubiendoFoto(true)
    try {
      const formData = new FormData()
      formData.append('foto', file)
      formData.append('descripcion', descripcionFoto)
      const res = await fetch(`/api/vehiculos/${vehiculoDetalle.id}/fotos`, {
        method: 'POST',
        headers: { 'x-admin-pin': authToken },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir foto')
      toast({ title: 'Foto agregada', description: 'La foto se guardó correctamente.' })
      setDescripcionFoto('')
      await verDetalle(vehiculoDetalle as unknown as VehiculoListItem)
    } catch (err: unknown) {
      toast({
        title: 'Error al subir foto',
        description:
          err instanceof Error ? err.message : 'Intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setSubiendoFoto(false)
    }
  }

  // Borrar foto
  const borrarFoto = async (fotoId: string) => {
    if (!vehiculoDetalle || !authToken) return
    if (!confirm('¿Seguro que querés borrar esta foto?')) return
    try {
      const res = await fetch(
        `/api/vehiculos/${vehiculoDetalle.id}/fotos/${fotoId}`,
        {
          method: 'DELETE',
          headers: { 'x-admin-pin': authToken },
        },
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al borrar')
      }
      toast({ title: 'Foto eliminada' })
      setFotoSeleccionada(null)
      await verDetalle(vehiculoDetalle as unknown as VehiculoListItem)
    } catch (err: unknown) {
      toast({
        title: 'Error al borrar foto',
        description:
          err instanceof Error ? err.message : 'Intentá de nuevo.',
        variant: 'destructive',
      })
    }
  }

  // Filtrado de búsqueda
  const vehiculosFiltrados = vehiculos.filter((v) => {
    const q = busqueda.toLowerCase().trim()
    if (!q) return v
    return (
      v.marca.toLowerCase().includes(q) ||
      v.modelo.toLowerCase().includes(q) ||
      v.patente.toLowerCase().includes(normalizarPatente(q)) ||
      v.cliente.nombre.toLowerCase().includes(q)
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Panel de administración
          </DialogTitle>
          <DialogDescription>
            {authToken
              ? 'Gestioná los trabajos realizados en cada vehículo.'
              : 'Ingresá tu PIN para acceder al panel del taller.'}
          </DialogDescription>
        </DialogHeader>

        {/* PASO 1: LOGIN */}
        {paso === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN de acceso</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  maxLength={8}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                El PIN te lo configuran al iniciar el taller. Si lo olvidaste,
                contactá al soporte técnico.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loginLoading}>
                {loginLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* PASO 2: LISTA DE VEHÍCULOS */}
        {paso === 'lista' && authToken && (
          <div className="space-y-4 py-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por marca, patente o cliente..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </div>

            {listaLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : vehiculosFiltrados.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  {vehiculos.length === 0
                    ? 'Todavía no hay vehículos registrados. Cuando un cliente registre su vehículo aparecerá acá.'
                    : 'No se encontraron vehículos con esa búsqueda.'}
                </CardContent>
              </Card>
            ) : (
              <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                {vehiculosFiltrados.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => verDetalle(v)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border/60 bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Car className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">
                          {v.marca} {v.modelo}
                        </span>
                        <Badge variant="outline" className="font-mono">
                          {v.patente}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {v.anio}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {v.cliente.nombre} · {v.cliente.telefono} ·{' '}
                        {v._count.trabajos} trabajo(s)
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASO 3: DETALLE DEL VEHÍCULO */}
        {paso === 'detalle' && authToken && (
          <div className="space-y-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setVehiculoDetalle(null)
                setPaso('lista')
                void cargarLista(authToken)
              }}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista
            </Button>

            {detalleLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : vehiculoDetalle ? (
              <>
                <Card className="border-border/60 bg-muted/40">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-bold">
                          <Car className="h-5 w-5 text-primary" />
                          {vehiculoDetalle.marca} {vehiculoDetalle.modelo}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {vehiculoDetalle.anio} ·{' '}
                          {vehiculoDetalle.tipo} ·{' '}
                          {vehiculoDetalle.combustible || '—'}
                        </p>
                        <p className="mt-2 text-sm">
                          <span className="font-mono font-bold">
                            {vehiculoDetalle.patente}
                          </span>{' '}
                          · {vehiculoDetalle.cliente.nombre} ·{' '}
                          {vehiculoDetalle.cliente.telefono}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          // El precio lo carga el admin manualmente (control interno)
                          const hoy = new Date().toISOString().split('T')[0]
                          setNuevoTrabajo({
                            servicioId: '',
                            titulo: '',
                            descripcion: '',
                            precio: '',
                            estado: 'Completado',
                            proximo: '',
                            fecha: hoy,
                            kilometraje:
                              vehiculoDetalle.kilometraje?.toString() || '',
                          })
                          setPaso('cargar')
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Cargar trabajo
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Sección de fotos del vehículo */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Camera className="h-4 w-4 text-primary" />
                    Fotos del vehículo ({vehiculoDetalle.fotos.length}/8)
                  </h4>

                  {/* Subir nueva foto */}
                  <div className="mb-3 rounded-lg border border-dashed border-border/60 bg-muted/30 p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        value={descripcionFoto}
                        onChange={(e) => setDescripcionFoto(e.target.value)}
                        placeholder="Descripción (opcional)"
                        className="flex-1"
                      />
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        {subiendoFoto ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4" />
                            Subir foto
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          disabled={subiendoFoto || vehiculoDetalle.fotos.length >= 8}
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) subirFoto(f)
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                    {vehiculoDetalle.fotos.length >= 8 && (
                      <p className="mt-2 text-xs text-amber-600">
                        Alcanzaste el máximo de 8 fotos. Eliminá alguna para subir otra.
                      </p>
                    )}
                  </div>

                  {/* Grilla de fotos */}
                  {vehiculoDetalle.fotos.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
                        <ImageIcon className="h-8 w-8 opacity-40" />
                        <span>Aún no hay fotos de este vehículo.</span>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {vehiculoDetalle.fotos.map((foto) => (
                        <div
                          key={foto.id}
                          className="group relative aspect-square overflow-hidden rounded-md border border-border/60"
                        >
                          <img
                            src={foto.url}
                            alt={foto.descripcion || 'Foto del vehículo'}
                            className="h-full w-full cursor-pointer object-cover"
                            onClick={() => setFotoSeleccionada(foto.url)}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              borrarFoto(foto.id)
                            }}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Eliminar foto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          {foto.descripcion && (
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[10px] text-white">
                              {foto.descripcion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Visor de foto ampliada */}
                  {fotoSeleccionada && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                      onClick={() => setFotoSeleccionada(null)}
                    >
                      <button
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                        onClick={() => setFotoSeleccionada(null)}
                        aria-label="Cerrar"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <img
                        src={fotoSeleccionada}
                        alt="Foto ampliada"
                        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Wrench className="h-4 w-4 text-primary" />
                    Historial de trabajos ({vehiculoDetalle.trabajos.length})
                  </h4>
                  {vehiculoDetalle.trabajos.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="p-6 text-center text-sm text-muted-foreground">
                        Este vehículo todavía no tiene trabajos cargados.
                      </CardContent>
                    </Card>
                  ) : (
                    <ol className="max-h-[40vh] space-y-2 overflow-y-auto pr-1">
                      {vehiculoDetalle.trabajos.map((t) => (
                        <li
                          key={t.id}
                          className="rounded-lg border border-border/60 bg-card p-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold">
                                  {t.titulo}
                                </span>
                                <Badge variant="outline" className="text-[10px]">
                                  {t.estado}
                                </Badge>
                                {t.servicio && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    {t.servicio.categoria}
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {t.descripcion}
                              </p>
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatFecha(t.fecha)}
                                </span>
                                {t.kilometraje != null && (
                                  <span className="ml-2 inline-flex items-center gap-1">
                                    <Gauge className="h-3 w-3" />
                                    {t.kilometraje.toLocaleString('es-AR')} km
                                  </span>
                                )}
                                {t.proximo && ` · Próximo: ${t.proximo}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Precio
                              </p>
                              <span className="text-sm font-bold">
                                {formatPrecio(t.precio)}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No se pudo cargar el vehículo.
              </p>
            )}
          </div>
        )}

        {/* PASO 4: FORMULARIO NUEVO TRABAJO */}
        {paso === 'cargar' && authToken && vehiculoDetalle && (
          <form onSubmit={registrarTrabajo} className="space-y-4 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPaso('detalle')}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al detalle
            </Button>

            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <span className="text-muted-foreground">Vehículo: </span>
              <span className="font-semibold">
                {vehiculoDetalle.marca} {vehiculoDetalle.modelo} ·{' '}
              </span>
              <span className="font-mono">{vehiculoDetalle.patente}</span>
            </div>

            <div className="space-y-2">
              <Label>Servicio (opcional)</Label>
              <Select
                value={nuevoTrabajo.servicioId}
                onValueChange={(v) => {
                  const servicio = servicios.find((s) => s.id === v)
                  setNuevoTrabajo((nt) => ({
                    ...nt,
                    servicioId: v,
                    titulo: servicio?.nombre || nt.titulo,
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná un servicio del catálogo" />
                </SelectTrigger>
                <SelectContent>
                  {servicios.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nombre} — {s.categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-titulo">Título del trabajo *</Label>
              <Input
                id="t-titulo"
                value={nuevoTrabajo.titulo}
                onChange={(e) =>
                  setNuevoTrabajo((nt) => ({ ...nt, titulo: e.target.value }))
                }
                placeholder="Ej: Cambio de pastillas de freno"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-desc">Descripción *</Label>
              <Textarea
                id="t-desc"
                value={nuevoTrabajo.descripcion}
                onChange={(e) =>
                  setNuevoTrabajo((nt) => ({
                    ...nt,
                    descripcion: e.target.value,
                  }))
                }
                placeholder="Detallá qué se hizo, repuestos usados, observaciones..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="t-fecha" className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Fecha del trabajo *
                </Label>
                <Input
                  id="t-fecha"
                  type="date"
                  value={nuevoTrabajo.fecha}
                  onChange={(e) =>
                    setNuevoTrabajo((nt) => ({ ...nt, fecha: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-km" className="flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" /> Kilometraje (opcional)
                </Label>
                <Input
                  id="t-km"
                  type="number"
                  min="0"
                  value={nuevoTrabajo.kilometraje}
                  onChange={(e) =>
                    setNuevoTrabajo((nt) => ({
                      ...nt,
                      kilometraje: e.target.value,
                    }))
                  }
                  placeholder="Ej: 85400"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="t-precio">Precio (ARS) *</Label>
                <Input
                  id="t-precio"
                  type="number"
                  min="0"
                  value={nuevoTrabajo.precio}
                  onChange={(e) =>
                    setNuevoTrabajo((nt) => ({
                      ...nt,
                      precio: e.target.value,
                    }))
                  }
                  placeholder="35000"
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={nuevoTrabajo.estado}
                  onValueChange={(v) =>
                    setNuevoTrabajo((nt) => ({ ...nt, estado: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-prox">Próxima revisión</Label>
                <Input
                  id="t-prox"
                  value={nuevoTrabajo.proximo}
                  onChange={(e) =>
                    setNuevoTrabajo((nt) => ({
                      ...nt,
                      proximo: e.target.value,
                    }))
                  }
                  placeholder="Ej: a los 90.000 km"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaso('detalle')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar trabajo'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

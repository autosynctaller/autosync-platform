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
  Edit,
  Clock,
  Bell,
  MessageCircle,
  FileText,
  Download,
  Check,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Stethoscope,
  AlertCircle,
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
  notas: string | null
  notasActualizadasEn: string | null
  vtvVencimiento: string | null
  gncVencimiento: string | null
  combustible: string | null
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
  recordatorio: string | null
  notasInternas: string | null
  servicio: { nombre: string; categoria: string } | null
}

interface FotoDetalle {
  id: string
  url: string
  descripcion: string | null
  esPrivada: boolean
  categoria: string
  createdAt: string
}

interface DocumentoDetalle {
  id: string
  url: string
  nombre: string
  tipo: string
  tamaño: number
  descripcion: string | null
  createdAt: string
}

interface DiagnosticoDetalle {
  id: string
  titulo: string
  sintoma: string
  pruebasRealizadas: string | null
  resultadoPrueba: string | null
  diagnostico: string | null
  solucion: string | null
  resultadoFinal: string | null
  estado: string
  kilometraje: number | null
  fecha: string
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
  notasInternas: string | null
  notasActualizadasEn: string | null
  vtvVencimiento: string | null
  gncVencimiento: string | null
  cliente: {
    nombre: string
    telefono: string
    email: string | null
    direccion: string | null
  }
  trabajos: TrabajoDetalle[]
  fotos: FotoDetalle[]
  documentos: DocumentoDetalle[]
  diagnosticos: DiagnosticoDetalle[]
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
  const [paso, setPaso] = useState<
    'login' | 'lista' | 'detalle' | 'cargar' | 'editar-trabajo' | 'editar-vehiculo' | 'recordatorios' | 'estadisticas' | 'buscar-sintomas' | 'diagnostico-nuevo' | 'diagnostico-editar'
  >('login')
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
    recordatorio: '', // YYYY-MM-DD (opcional)
    notasInternas: '', // Notas solo para el taller
  })
  const [guardando, setGuardando] = useState(false)

  // fotos
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [descripcionFoto, setDescripcionFoto] = useState('')
  const [fotoPrivada, setFotoPrivada] = useState(false)
  const [fotoCategoria, setFotoCategoria] = useState('general')
  const [filtroFotos, setFiltroFotos] = useState('todas')
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null)

  // documentos
  const [subiendoDoc, setSubiendoDoc] = useState(false)
  const [descripcionDoc, setDescripcionDoc] = useState('')

  // recordatorios
  const [recordatorios, setRecordatorios] = useState<Array<{
    id: string
    tipo: 'trabajo' | 'vtv' | 'gnc'
    tituloTrabajo: string
    proximoTexto: string | null
    fechaTrabajo: string
    fechaRecordatorio: string
    diasRestantes: number
    estado: 'vencido' | 'hoy' | 'proximo' | 'futuro'
    vehiculo: {
      id: string
      marca: string
      modelo: string
      patente: string
      kilometraje: number | null
    }
    cliente: {
      nombre: string
      telefono: string
      email: string | null
    }
  }>>([])
  const [cargandoRecordatorios, setCargandoRecordatorios] = useState(false)

  // estadísticas
  const [estadisticas, setEstadisticas] = useState<{
    totales: {
      vehiculos: number
      clientes: number
      trabajos: number
      trabajosMes: number
      trabajosAnio: number
      ingresosMes: number
      ingresosAnio: number
      ingresosTotales: number
      variacionTrabajos: number
      variacionIngresos: number
    }
    trabajosPorEstado: Array<{ estado: string; cantidad: number }>
    trabajosPorMes: Array<{ mes: string; cantidad: number; ingresos: number }>
    serviciosMasRealizados: Array<{ nombre: string; cantidad: number }>
    titulosMasUsados: Array<{ titulo: string; cantidad: number }>
    vencimientos: {
      vtvVencida: number
      vtvProxima: number
      gncVencida: number
      gncProxima: number
      recordatoriosPendientes: number
    }
  } | null>(null)
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false)

  // diagnósticos
  const [nuevoDiag, setNuevoDiag] = useState({
    titulo: '',
    sintoma: '',
    pruebasRealizadas: '',
    resultadoPrueba: '',
    diagnostico: '',
    solucion: '',
    resultadoFinal: '',
    estado: 'En diagnóstico',
    kilometraje: '',
    fecha: '',
  })
  const [diagEditando, setDiagEditando] = useState<DiagnosticoDetalle | null>(null)
  const [guardandoDiag, setGuardandoDiag] = useState(false)

  // búsqueda global de síntomas
  const [busquedaSintoma, setBusquedaSintoma] = useState('')
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Array<{
    id: string
    titulo: string
    sintoma: string
    diagnostico: string | null
    solucion: string | null
    resultadoFinal: string | null
    estado: string
    fecha: string
    kilometraje: number | null
    vehiculo: { id: string; marca: string; modelo: string; patente: string; anio: number }
    cliente: { nombre: string }
    camposEncontrados: string[]
  }>>([])
  const [buscando, setBuscando] = useState(false)
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)

  // cronograma sugerido
  const [cronogramaSugerido, setCronogramaSugerido] = useState<{
    marca: string
    modelo: string
    kilometraje: number
    items: string
    notas: string | null
  } | null>(null)
  const [cronogramaProximo, setCronogramaProximo] = useState<{
    marca: string
    modelo: string
    kilometraje: number
    items: string
    notas: string | null
  } | null>(null)
  const [cargandoCronograma, setCargandoCronograma] = useState(false)

  // edición
  const [trabajoEditando, setTrabajoEditando] = useState<TrabajoDetalle | null>(null)
  const [editVehiculo, setEditVehiculo] = useState({
    marca: '',
    modelo: '',
    anio: '',
    color: '',
    kilometraje: '',
    tipo: 'Auto',
    combustible: 'Nafta',
    notas: '',
    notasInternas: '',
    vtvVencimiento: '',
    gncVencimiento: '',
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_email: '',
    cliente_direccion: '',
  })

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

  const cargarRecordatorios = useCallback(async (token: string) => {
    setCargandoRecordatorios(true)
    try {
      const res = await fetch('/api/recordatorios', {
        headers: { 'x-admin-pin': token },
      })
      const data = await res.json()
      if (res.ok) {
        setRecordatorios(data.recordatorios || [])
      }
    } catch {
      // silencioso
    } finally {
      setCargandoRecordatorios(false)
    }
  }, [])

  const cargarEstadisticas = useCallback(async (token: string) => {
    setCargandoEstadisticas(true)
    try {
      const res = await fetch('/api/estadisticas', {
        headers: { 'x-admin-pin': token },
      })
      const data = await res.json()
      if (res.ok) {
        setEstadisticas(data)
      }
    } catch {
      // silencioso
    } finally {
      setCargandoEstadisticas(false)
    }
  }, [])

  const verDetalle = async (v: VehiculoListItem) => {
    setDetalleLoading(true)
    setPaso('detalle')
    setCronogramaSugerido(null)
    setCronogramaProximo(null)
    try {
      const res = await fetch(`/api/vehiculos/${v.id}`)
      const data = await res.json()
      setVehiculoDetalle(data.vehiculo)

      // Cargar cronograma sugerido según marca y km
      if (data.vehiculo?.marca && data.vehiculo?.kilometraje != null && authToken) {
        setCargandoCronograma(true)
        try {
          const params = new URLSearchParams({
            marca: data.vehiculo.marca,
            modelo: data.vehiculo.modelo,
            km: String(data.vehiculo.kilometraje),
          })
          const cr = await fetch(`/api/cronogramas?${params}`, {
            headers: { 'x-admin-pin': authToken },
          })
          const crData = await cr.json()
          if (cr.ok) {
            setCronogramaSugerido(crData.sugerido || null)
            setCronogramaProximo(crData.proximo || null)
          }
        } catch {
          // silencioso
        } finally {
          setCargandoCronograma(false)
        }
      }
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
          recordatorio: nuevoTrabajo.recordatorio || null,
          notasInternas: nuevoTrabajo.notasInternas || null,
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
        recordatorio: '',
        notasInternas: '',
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
      formData.append('esPrivada', String(fotoPrivada))
      formData.append('categoria', fotoCategoria)
      const res = await fetch(`/api/vehiculos/${vehiculoDetalle.id}/fotos`, {
        method: 'POST',
        headers: { 'x-admin-pin': authToken },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir foto')
      toast({ title: 'Foto agregada', description: 'La foto se guardó correctamente.' })
      setDescripcionFoto('')
      setFotoPrivada(false)
      setFotoCategoria('general')
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

  // Subir documento (PDF)
  const subirDocumento = async (file: File) => {
    if (!vehiculoDetalle || !authToken) return
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Archivo muy pesado',
        description: 'Máximo 10 MB por documento.',
        variant: 'destructive',
      })
      return
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      toast({
        title: 'Tipo no permitido',
        description: 'Solo PDF, JPG, PNG o WEBP.',
        variant: 'destructive',
      })
      return
    }
    setSubiendoDoc(true)
    try {
      const formData = new FormData()
      formData.append('documento', file)
      formData.append('descripcion', descripcionDoc)
      const res = await fetch(`/api/vehiculos/${vehiculoDetalle.id}/documentos`, {
        method: 'POST',
        headers: { 'x-admin-pin': authToken },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir documento')
      toast({ title: 'Documento agregado', description: 'El archivo se guardó correctamente.' })
      setDescripcionDoc('')
      await verDetalle(vehiculoDetalle as unknown as VehiculoListItem)
    } catch (err: unknown) {
      toast({
        title: 'Error al subir documento',
        description:
          err instanceof Error ? err.message : 'Intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setSubiendoDoc(false)
    }
  }

  // Borrar documento
  const borrarDocumento = async (docId: string) => {
    if (!vehiculoDetalle || !authToken) return
    if (!confirm('¿Seguro que querés borrar este documento?')) return
    try {
      const res = await fetch(
        `/api/vehiculos/${vehiculoDetalle.id}/documentos/${docId}`,
        {
          method: 'DELETE',
          headers: { 'x-admin-pin': authToken },
        },
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al borrar')
      }
      toast({ title: 'Documento eliminado' })
      await verDetalle(vehiculoDetalle as unknown as VehiculoListItem)
    } catch (err: unknown) {
      toast({
        title: 'Error al borrar documento',
        description:
          err instanceof Error ? err.message : 'Intentá de nuevo.',
        variant: 'destructive',
      })
    }
  }

  // Marcar notas del cliente como ya revisadas (quitar el aviso)
  const marcarNotasRevisadas = async () => {
    if (!vehiculoDetalle || !authToken) return
    try {
      const res = await fetch(`/api/vehiculos/${vehiculoDetalle.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': authToken,
        },
        body: JSON.stringify({ marcarNotasRevisadas: true }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar')
      }
      toast({ title: 'Notas marcadas como revisadas' })
      await verDetalle(vehiculoDetalle as unknown as VehiculoListItem)
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Intentá de nuevo.',
        variant: 'destructive',
      })
    }
  }

  // Crear o editar diagnóstico
  const guardarDiagnostico = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehiculoDetalle || !authToken) return
    if (!nuevoDiag.titulo || !nuevoDiag.sintoma) {
      toast({
        title: 'Faltan datos',
        description: 'Título y síntoma son obligatorios.',
        variant: 'destructive',
      })
      return
    }
    setGuardandoDiag(true)
    try {
      const url = diagEditando
        ? `/api/vehiculos/${vehiculoDetalle.id}/diagnosticos`
        : `/api/vehiculos/${vehiculoDetalle.id}/diagnosticos`
      const method = diagEditando ? 'PATCH' : 'POST'
      // Nota: PATCH no está implementado en este endpoint todavía, usamos POST para crear
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': authToken,
        },
        body: JSON.stringify({
          titulo: nuevoDiag.titulo,
          sintoma: nuevoDiag.sintoma,
          pruebasRealizadas: nuevoDiag.pruebasRealizadas || null,
          resultadoPrueba: nuevoDiag.resultadoPrueba || null,
          diagnostico: nuevoDiag.diagnostico || null,
          solucion: nuevoDiag.solucion || null,
          resultadoFinal: nuevoDiag.resultadoFinal || null,
          estado: nuevoDiag.estado,
          kilometraje: nuevoDiag.kilometraje
            ? Number(nuevoDiag.kilometraje)
            : null,
          fecha: nuevoDiag.fecha || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      toast({
        title: diagEditando ? 'Diagnóstico actualizado' : 'Diagnóstico creado',
        description: 'Se guardó correctamente.',
      })
      setNuevoDiag({
        titulo: '',
        sintoma: '',
        pruebasRealizadas: '',
        resultadoPrueba: '',
        diagnostico: '',
        solucion: '',
        resultadoFinal: '',
        estado: 'En diagnóstico',
        kilometraje: '',
        fecha: new Date().toISOString().split('T')[0],
      })
      setDiagEditando(null)
      await verDetalle(vehiculoDetalle as unknown as VehiculoListItem)
      setPaso('detalle')
    } catch (err: unknown) {
      toast({
        title: 'Error al guardar diagnóstico',
        description:
          err instanceof Error ? err.message : 'Intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setGuardandoDiag(false)
    }
  }

  // Iniciar edición de diagnóstico (cargar en el form)
  const iniciarEditarDiag = (d: DiagnosticoDetalle) => {
    setDiagEditando(d)
    setNuevoDiag({
      titulo: d.titulo,
      sintoma: d.sintoma,
      pruebasRealizadas: d.pruebasRealizadas || '',
      resultadoPrueba: d.resultadoPrueba || '',
      diagnostico: d.diagnostico || '',
      solucion: d.solucion || '',
      resultadoFinal: d.resultadoFinal || '',
      estado: d.estado,
      kilometraje: d.kilometraje != null ? String(d.kilometraje) : '',
      fecha: d.fecha.split('T')[0],
    })
    setPaso('diagnostico-editar')
  }

  // Búsqueda global de síntomas
  const buscarSintomas = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authToken || busquedaSintoma.trim().length < 2) {
      toast({
        title: 'Muy corto',
        description: 'Ingresá al menos 2 caracteres.',
        variant: 'destructive',
      })
      return
    }
    setBuscando(true)
    setBusquedaRealizada(true)
    try {
      const res = await fetch(
        `/api/diagnosticos/buscar?q=${encodeURIComponent(busquedaSintoma)}`,
        { headers: { 'x-admin-pin': authToken } },
      )
      const data = await res.json()
      if (res.ok) {
        setResultadosBusqueda(data.resultados || [])
        if (data.resultados.length === 0) {
          toast({
            title: 'Sin resultados',
            description: `No encontramos diagnósticos con "${busquedaSintoma}".`,
          })
        } else {
          toast({
            title: 'Búsqueda completada',
            description: `${data.resultados.length} resultado(s) encontrado(s).`,
          })
        }
      } else {
        throw new Error(data.error || 'Error en la búsqueda')
      }
    } catch (err: unknown) {
      toast({
        title: 'Error en la búsqueda',
        description:
          err instanceof Error ? err.message : 'Intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setBuscando(false)
    }
  }

  // Iniciar edición de un trabajo
  const iniciarEditarTrabajo = (t: TrabajoDetalle) => {
    setTrabajoEditando(t)
    setNuevoTrabajo({
      servicioId: t.servicio?.id || '',
      titulo: t.titulo,
      descripcion: t.descripcion,
      precio: String(t.precio),
      estado: t.estado,
      proximo: t.proximo || '',
      fecha: t.fecha.split('T')[0],
      kilometraje: t.kilometraje != null ? String(t.kilometraje) : '',
      recordatorio: t.recordatorio ? t.recordatorio.split('T')[0] : '',
      notasInternas: t.notasInternas || '',
    })
    setPaso('editar-trabajo')
  }

  // Guardar cambios en trabajo editado
  const guardarEdicionTrabajo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trabajoEditando || !authToken || !vehiculoDetalle) return
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
      const res = await fetch(`/api/trabajos/${trabajoEditando.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': authToken,
        },
        body: JSON.stringify({
          titulo: nuevoTrabajo.titulo,
          descripcion: nuevoTrabajo.descripcion,
          precio: Number(nuevoTrabajo.precio),
          estado: nuevoTrabajo.estado,
          proximo: nuevoTrabajo.proximo || null,
          fecha: nuevoTrabajo.fecha || null,
          kilometraje: nuevoTrabajo.kilometraje
            ? Number(nuevoTrabajo.kilometraje)
            : null,
          recordatorio: nuevoTrabajo.recordatorio || null,
          notasInternas: nuevoTrabajo.notasInternas || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      toast({
        title: 'Trabajo actualizado',
        description: 'Los cambios se guardaron correctamente.',
      })
      setTrabajoEditando(null)
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

  // Eliminar trabajo
  const eliminarTrabajo = async (trabajoId: string) => {
    if (!authToken || !vehiculoDetalle) return
    if (!confirm('¿Seguro que querés eliminar este trabajo? Esta acción no se puede deshacer.')) return
    try {
      const res = await fetch(`/api/trabajos/${trabajoId}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': authToken },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al eliminar')
      }
      toast({ title: 'Trabajo eliminado' })
      await verDetalle(vehiculoDetalle as unknown as VehiculoListItem)
    } catch (err: unknown) {
      toast({
        title: 'Error al eliminar',
        description:
          err instanceof Error ? err.message : 'Intentá de nuevo.',
        variant: 'destructive',
      })
    }
  }

  // Iniciar edición de datos del vehículo
  const iniciarEditarVehiculo = () => {
    if (!vehiculoDetalle) return
    setEditVehiculo({
      marca: vehiculoDetalle.marca,
      modelo: vehiculoDetalle.modelo,
      anio: String(vehiculoDetalle.anio),
      color: vehiculoDetalle.color || '',
      kilometraje:
        vehiculoDetalle.kilometraje != null
          ? String(vehiculoDetalle.kilometraje)
          : '',
      tipo: vehiculoDetalle.tipo,
      combustible: vehiculoDetalle.combustible || 'Nafta',
      notas: vehiculoDetalle.notas || '',
      notasInternas: vehiculoDetalle.notasInternas || '',
      vtvVencimiento: vehiculoDetalle.vtvVencimiento
        ? vehiculoDetalle.vtvVencimiento.split('T')[0]
        : '',
      gncVencimiento: vehiculoDetalle.gncVencimiento
        ? vehiculoDetalle.gncVencimiento.split('T')[0]
        : '',
      cliente_nombre: vehiculoDetalle.cliente.nombre,
      cliente_telefono: vehiculoDetalle.cliente.telefono,
      cliente_email: vehiculoDetalle.cliente.email || '',
      cliente_direccion: vehiculoDetalle.cliente.direccion || '',
    })
    setPaso('editar-vehiculo')
  }

  // Guardar cambios en el vehículo
  const guardarEdicionVehiculo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authToken || !vehiculoDetalle) return
    if (!editVehiculo.marca || !editVehiculo.modelo || !editVehiculo.anio) {
      toast({
        title: 'Faltan datos',
        description: 'Marca, modelo y año son obligatorios.',
        variant: 'destructive',
      })
      return
    }
    setGuardando(true)
    try {
      const res = await fetch(`/api/vehiculos/${vehiculoDetalle.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': authToken,
        },
        body: JSON.stringify({
          marca: editVehiculo.marca,
          modelo: editVehiculo.modelo,
          anio: Number(editVehiculo.anio),
          color: editVehiculo.color || null,
          kilometraje: editVehiculo.kilometraje
            ? Number(editVehiculo.kilometraje)
            : null,
          tipo: editVehiculo.tipo,
          combustible: editVehiculo.combustible || null,
          notas: editVehiculo.notas || null,
          notasInternas: editVehiculo.notasInternas || null,
          vtvVencimiento: editVehiculo.vtvVencimiento || null,
          gncVencimiento: editVehiculo.gncVencimiento || null,
          cliente_nombre: editVehiculo.cliente_nombre,
          cliente_telefono: editVehiculo.cliente_telefono,
          cliente_email: editVehiculo.cliente_email,
          cliente_direccion: editVehiculo.cliente_direccion,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      toast({
        title: 'Vehículo actualizado',
        description: 'Los cambios se guardaron correctamente.',
      })
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void cargarEstadisticas(authToken)
                    setPaso('estadisticas')
                  }}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Estadísticas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBusquedaSintoma('')
                    setResultadosBusqueda([])
                    setBusquedaRealizada(false)
                    setPaso('buscar-sintomas')
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Buscar síntomas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void cargarRecordatorios(authToken)
                    setPaso('recordatorios')
                  }}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Recordatorios
                </Button>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Salir
                </Button>
              </div>
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
                {vehiculosFiltrados.map((v) => {
                  const tieneNotaNueva = !!v.notasActualizadasEn
                  const fechaNota = tieneNotaNueva
                    ? new Date(v.notasActualizadasEn as string)
                    : null
                  const diasNota = fechaNota
                    ? Math.floor(
                        (Date.now() - fechaNota.getTime()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : 0
                  return (
                    <button
                      key={v.id}
                      onClick={() => verDetalle(v)}
                      className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors hover:border-primary/40 ${
                        tieneNotaNueva
                          ? 'border-amber-400 bg-amber-50 hover:bg-amber-100'
                          : 'border-border/60 bg-card hover:bg-muted/40'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          tieneNotaNueva
                            ? 'bg-amber-500 text-white'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
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
                          {tieneNotaNueva && (
                            <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                              <Bell className="mr-1 h-3 w-3" />
                              {diasNota === 0
                                ? 'Nota nueva hoy'
                                : `Nota nueva hace ${diasNota}d`}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {v.cliente.nombre} · {v.cliente.telefono} ·{' '}
                          {v._count.trabajos} trabajo(s)
                        </p>
                        {tieneNotaNueva && v.notas && (
                          <p className="mt-1 truncate text-xs italic text-amber-800">
                            💬 "{v.notas}"
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  )
                })}
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
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={iniciarEditarVehiculo}
                        >
                          <Wrench className="mr-2 h-4 w-4" />
                          Editar datos
                        </Button>
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
                              recordatorio: '',
                              notasInternas: '',
                            })
                            setPaso('cargar')
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Cargar trabajo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Aviso de nota nueva del cliente */}
                {vehiculoDetalle.notasActualizadasEn && (
                  <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                          <Bell className="h-4 w-4" />
                          El cliente actualizó sus notas
                        </h4>
                        {vehiculoDetalle.notas ? (
                          <p className="text-sm italic text-amber-900">
                            💬 "{vehiculoDetalle.notas}"
                          </p>
                        ) : (
                          <p className="text-sm text-amber-800">
                            El cliente borró sus notas.
                          </p>
                        )}
                        <p className="mt-2 text-[10px] uppercase tracking-wider text-amber-700">
                          Actualizado:{' '}
                          {formatFecha(vehiculoDetalle.notasActualizadasEn)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={marcarNotasRevisadas}
                        className="border-amber-400 bg-white text-amber-800 hover:bg-amber-100"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Marcar como revisada
                      </Button>
                    </div>
                  </div>
                )}

                {/* Vencimientos VTV y GNC */}
                {(vehiculoDetalle.vtvVencimiento || vehiculoDetalle.gncVencimiento) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {vehiculoDetalle.vtvVencimiento && (
                      <AdminVencimientoCard
                        titulo="VTV"
                        fecha={vehiculoDetalle.vtvVencimiento}
                      />
                    )}
                    {vehiculoDetalle.gncVencimiento && (
                      <AdminVencimientoCard
                        titulo="Obleta GNC"
                        fecha={vehiculoDetalle.gncVencimiento}
                      />
                    )}
                  </div>
                )}

                {/* Notas internas del vehículo (solo taller) */}
                {vehiculoDetalle.notasInternas && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                      <Lock className="h-4 w-4" />
                      Notas internas del taller
                    </h4>
                    <p className="text-sm whitespace-pre-wrap text-amber-900">
                      {vehiculoDetalle.notasInternas}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-amber-700">
                      🔒 Solo visible para el taller
                    </p>
                  </div>
                )}

                {/* Cronograma de service sugerido por el fabricante */}
                {vehiculoDetalle.kilometraje != null && (
                  <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                    <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
                      <Calendar className="h-4 w-4" />
                      Cronograma de services - {vehiculoDetalle.marca}
                    </h4>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Según los {vehiculoDetalle.kilometraje.toLocaleString('es-AR')} km actuales.
                      🔒 Solo para el taller.
                    </p>

                    {cargandoCronograma ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Cargando cronograma...
                      </div>
                    ) : !cronogramaSugerido && !cronogramaProximo ? (
                      <div className="rounded border border-dashed border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
                        No hay cronograma pre-cargado para {vehiculoDetalle.marca}.{' '}
                        Podés cargarlo desde la sección de Cronogramas.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Service que le tocaría según los km */}
                        {cronogramaSugerido && (
                          <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
                              ⚠️ Service de los {cronogramaSugerido.kilometraje.toLocaleString('es-AR')} km - Le corresponde ahora
                            </p>
                            <ul className="space-y-1 text-xs text-amber-900">
                              {cronogramaSugerido.items.split('\n').map((item, i) => (
                                <li key={i} className="flex gap-1.5">
                                  <span className="text-amber-600">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                            {cronogramaSugerido.notas && (
                              <p className="mt-2 rounded bg-amber-100 p-2 text-[11px] italic text-amber-800">
                                💡 {cronogramaSugerido.notas}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Próximo service que le tocará */}
                        {cronogramaProximo && (
                          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                              ✓ Próximo service: a los {cronogramaProximo.kilometraje.toLocaleString('es-AR')} km
                              {vehiculoDetalle.kilometraje != null && (
                                <span className="ml-1 font-normal text-emerald-600">
                                  (faltan {(cronogramaProximo.kilometraje - vehiculoDetalle.kilometraje).toLocaleString('es-AR')} km)
                                </span>
                              )}
                            </p>
                            <ul className="space-y-1 text-xs text-emerald-900">
                              {cronogramaProximo.items.split('\n').map((item, i) => (
                                <li key={i} className="flex gap-1.5">
                                  <span className="text-emerald-600">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                            {cronogramaProximo.notas && (
                              <p className="mt-2 rounded bg-emerald-100 p-2 text-[11px] italic text-emerald-800">
                                💡 {cronogramaProximo.notas}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Botón para cargar el service sugerido como trabajo */}
                        {cronogramaSugerido && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              const hoy = new Date().toISOString().split('T')[0]
                              setNuevoTrabajo({
                                servicioId: '',
                                titulo: `Service de los ${cronogramaSugerido.kilometraje.toLocaleString('es-AR')} km`,
                                descripcion: cronogramaSugerido.items,
                                precio: '',
                                estado: 'Completado',
                                proximo: cronogramaProximo
                                  ? `A los ${cronogramaProximo.kilometraje.toLocaleString('es-AR')} km`
                                  : '',
                                fecha: hoy,
                                kilometraje: vehiculoDetalle.kilometraje?.toString() || '',
                                recordatorio: '',
                                notasInternas: '',
                              })
                              setPaso('cargar')
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Cargar este service como trabajo
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Sección de fotos del vehículo */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Camera className="h-4 w-4 text-primary" />
                    Fotos del vehículo ({vehiculoDetalle.fotos.length})
                  </h4>

                  {/* Subir nueva foto */}
                  <div className="mb-3 rounded-lg border border-dashed border-border/60 bg-muted/30 p-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          value={descripcionFoto}
                          onChange={(e) => setDescripcionFoto(e.target.value)}
                          placeholder="Descripción (opcional)"
                          className="flex-1"
                        />
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
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
                            disabled={subiendoFoto || (fotoCategoria !== 'todas' && vehiculoDetalle.fotos.filter((f) => f.categoria === fotoCategoria).length >= 8)}
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) subirFoto(f)
                              e.target.value = ''
                            }}
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Select
                          value={fotoCategoria}
                          onValueChange={setFotoCategoria}
                        >
                          <SelectTrigger className="h-8 w-auto text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">📷 General</SelectItem>
                            <SelectItem value="dano">⚠️ Daño</SelectItem>
                            <SelectItem value="repuesto">🔧 Repuesto</SelectItem>
                            <SelectItem value="trabajo_terminado">✅ Trabajo terminado</SelectItem>
                          </SelectContent>
                        </Select>
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={fotoPrivada}
                            onChange={(e) => setFotoPrivada(e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-border"
                          />
                          Foto <strong className="text-foreground">privada</strong> (solo taller)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Filtros por categoría con contador X/8 */}
                  {vehiculoDetalle.fotos.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {['todas', 'general', 'dano', 'repuesto', 'trabajo_terminado'].map((cat) => {
                        const count = cat === 'todas'
                          ? vehiculoDetalle.fotos.length
                          : vehiculoDetalle.fotos.filter((f) => f.categoria === cat).length
                        if (cat !== 'todas' && count === 0) return null
                        const labels: Record<string, string> = {
                          todas: '📷 Todas',
                          general: '📷 General',
                          dano: '⚠️ Daños',
                          repuesto: '🔧 Repuestos',
                          trabajo_terminado: '✅ Trabajo terminado',
                        }
                        const contador = cat === 'todas'
                          ? `${count}`
                          : `${count}/8`
                        return (
                          <button
                            key={cat}
                            onClick={() => setFiltroFotos(cat)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                              filtroFotos === cat
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {labels[cat]} ({contador})
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Grilla de fotos */}
                  {vehiculoDetalle.fotos.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
                        <ImageIcon className="h-8 w-8 opacity-40" />
                        <span>Aún no hay fotos de este vehículo.</span>
                      </CardContent>
                    </Card>
                  ) : (
                    (() => {
                      const fotosFiltradas = filtroFotos === 'todas'
                        ? vehiculoDetalle.fotos
                        : vehiculoDetalle.fotos.filter((f) => f.categoria === filtroFotos)
                      const catLabels: Record<string, { label: string; color: string }> = {
                        general: { label: 'General', color: 'bg-blue-500' },
                        dano: { label: 'Daño', color: 'bg-red-500' },
                        repuesto: { label: 'Repuesto', color: 'bg-amber-500' },
                        trabajo_terminado: { label: 'Trabajo', color: 'bg-emerald-500' },
                      }
                      if (fotosFiltradas.length === 0) {
                        return (
                          <p className="py-6 text-center text-xs text-muted-foreground">
                            No hay fotos en esta categoría.
                          </p>
                        )
                      }
                      return (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {fotosFiltradas.map((foto) => {
                            const cat = catLabels[foto.categoria] || catLabels.general
                            return (
                              <div
                                key={foto.id}
                                className={`group relative aspect-square overflow-hidden rounded-md border-2 ${
                                  foto.esPrivada
                                    ? 'border-amber-400'
                                    : 'border-border/60'
                                }`}
                              >
                                <img
                                  src={foto.url}
                                  alt={foto.descripcion || 'Foto del vehículo'}
                                  className="h-full w-full cursor-pointer object-cover"
                                  onClick={() => setFotoSeleccionada(foto.url)}
                                />
                                <div className="absolute left-1 top-1 flex flex-col gap-0.5">
                                  <span className={`rounded px-1 py-0.5 text-[8px] font-bold uppercase text-white ${cat.color}`}>
                                    {cat.label}
                                  </span>
                                  {foto.esPrivada && (
                                    <span className="rounded bg-amber-500 px-1 py-0.5 text-[8px] font-bold uppercase text-white">
                                      Privada
                                    </span>
                                  )}
                                </div>
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
                            )
                          })}
                        </div>
                      )
                    })()
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

                {/* Sección de documentos (PDFs, informes de scanner, etc.) */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4 text-primary" />
                    Documentos ({vehiculoDetalle.documentos.length}/20)
                    <Lock className="h-3 w-3 text-amber-600" />
                    <span className="text-[10px] font-normal text-amber-700">
                      Solo taller
                    </span>
                  </h4>

                  {/* Subir nuevo documento */}
                  <div className="mb-3 rounded-lg border border-dashed border-border/60 bg-muted/30 p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        value={descripcionDoc}
                        onChange={(e) => setDescripcionDoc(e.target.value)}
                        placeholder="Descripción (opcional) - Ej: Informe de scanner, presupuesto..."
                        className="flex-1"
                      />
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        {subiendoDoc ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            Subir documento
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                          className="hidden"
                          disabled={subiendoDoc || vehiculoDetalle.documentos.length >= 20}
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) subirDocumento(f)
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Subí informes de scanner, presupuestos, facturas, etc. PDF,
                      JPG o PNG (máx 10 MB). 🔒 Solo vos los ves.
                    </p>
                  </div>

                  {/* Lista de documentos */}
                  {vehiculoDetalle.documentos.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
                        <FileText className="h-8 w-8 opacity-40" />
                        <span>Aún no hay documentos cargados.</span>
                      </CardContent>
                    </Card>
                  ) : (
                    <ul className="space-y-2">
                      {vehiculoDetalle.documentos.map((doc) => {
                        const esPdf = doc.tipo === 'application/pdf' || doc.nombre.toLowerCase().endsWith('.pdf')
                        const tamañoKB = Math.round(doc.tamaño / 1024)
                        return (
                          <li
                            key={doc.id}
                            className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3"
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                                esPdf
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}
                            >
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {doc.nombre}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tamañoKB < 1024
                                  ? `${tamañoKB} KB`
                                  : `${(tamañoKB / 1024).toFixed(1)} MB`}
                                {doc.descripcion && ` · ${doc.descripcion}`}
                                {' · '}{formatFecha(doc.createdAt)}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <a
                                href={doc.url}
                                download={doc.nombre}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-primary"
                                aria-label="Descargar documento"
                                title="Descargar"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => borrarDocumento(doc.id)}
                                className="rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label="Eliminar documento"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>

                {/* Sección de Diagnósticos */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      Diagnósticos ({vehiculoDetalle.diagnosticos.length})
                      <Lock className="h-3 w-3 text-amber-600" />
                      <span className="text-[10px] font-normal text-amber-700">
                        Solo taller
                      </span>
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDiagEditando(null)
                        setNuevoDiag({
                          titulo: '',
                          sintoma: '',
                          pruebasRealizadas: '',
                          resultadoPrueba: '',
                          diagnostico: '',
                          solucion: '',
                          resultadoFinal: '',
                          estado: 'En diagnóstico',
                          kilometraje: vehiculoDetalle.kilometraje?.toString() || '',
                          fecha: new Date().toISOString().split('T')[0],
                        })
                        setPaso('diagnostico-nuevo')
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo diagnóstico
                    </Button>
                  </div>

                  {vehiculoDetalle.diagnosticos.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
                        <Stethoscope className="h-8 w-8 opacity-40" />
                        <span>Aún no hay diagnósticos registrados.</span>
                      </CardContent>
                    </Card>
                  ) : (
                    <ol className="max-h-[40vh] space-y-2 overflow-y-auto pr-1">
                      {vehiculoDetalle.diagnosticos.map((d) => {
                        const estadoColor: Record<string, string> = {
                          'En diagnóstico': 'bg-amber-100 text-amber-800',
                          'Resuelto': 'bg-emerald-100 text-emerald-800',
                          'Pendiente repuesto': 'bg-blue-100 text-blue-800',
                          'Sin solución': 'bg-red-100 text-red-800',
                        }
                        return (
                          <li
                            key={d.id}
                            className="rounded-lg border border-border/60 bg-card p-3"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold">{d.titulo}</span>
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${estadoColor[d.estado] || 'bg-muted text-muted-foreground'}`}>
                                    {d.estado}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  <span className="font-semibold">Síntoma:</span> {d.sintoma}
                                </p>
                                {d.diagnostico && (
                                  <p className="mt-1 text-xs">
                                    <span className="font-semibold text-muted-foreground">Diagnóstico:</span> {d.diagnostico}
                                  </p>
                                )}
                                {d.solucion && (
                                  <p className="mt-1 text-xs">
                                    <span className="font-semibold text-emerald-600">Solución:</span> {d.solucion}
                                  </p>
                                )}
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                  {formatFecha(d.fecha)}
                                  {d.kilometraje != null && ` · ${d.kilometraje.toLocaleString('es-AR')} km`}
                                </p>
                              </div>
                              <button
                                onClick={() => iniciarEditarDiag(d)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-primary"
                                title="Ver/editar detalle"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ol>
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
                              {t.notasInternas && (
                                <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
                                  🔒 {t.notasInternas}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Precio
                              </p>
                              <span className="text-sm font-bold">
                                {formatPrecio(t.precio)}
                              </span>
                              <div className="mt-2 flex flex-col gap-1">
                                <button
                                  onClick={() => iniciarEditarTrabajo(t)}
                                  className="rounded-md border border-border/60 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10"
                                  aria-label="Editar trabajo"
                                >
                                  <Edit className="mr-1 inline h-3 w-3" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => eliminarTrabajo(t.id)}
                                  className="rounded-md border border-border/60 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/10"
                                  aria-label="Eliminar trabajo"
                                >
                                  <Trash2 className="mr-1 inline h-3 w-3" />
                                  Eliminar
                                </button>
                              </div>
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

            <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <Label htmlFor="t-rec" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Recordatorio (opcional)
              </Label>
              <Input
                id="t-rec"
                type="date"
                value={nuevoTrabajo.recordatorio}
                onChange={(e) =>
                  setNuevoTrabajo((nt) => ({
                    ...nt,
                    recordatorio: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Elegí una fecha y el trabajo aparecerá en la sección "Recordatorios"
                del panel cuando se acerque ese día. Ej: si hiciste cambio de aceite,
                programá el recordatorio para dentro de 6 meses.
              </p>
              {nuevoTrabajo.recordatorio && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    setNuevoTrabajo((nt) => ({ ...nt, recordatorio: '' }))
                  }
                >
                  Quitar recordatorio
                </Button>
              )}
            </div>

            <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <Label htmlFor="t-ni" className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-600" /> Notas internas del taller
              </Label>
              <Textarea
                id="t-ni"
                value={nuevoTrabajo.notasInternas}
                onChange={(e) =>
                  setNuevoTrabajo((nt) => ({
                    ...nt,
                    notasInternas: e.target.value,
                  }))
                }
                placeholder="Solo vos ves esto. Ej: cliente moroso, repuesto pedido, observaciones técnicas..."
                rows={2}
              />
              <p className="text-xs text-amber-700">
                🔒 Estas notas son privadas, el cliente no las ve.
              </p>
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

        {/* PASO 5: EDITAR TRABAJO EXISTENTE */}
        {paso === 'editar-trabajo' && authToken && vehiculoDetalle && trabajoEditando && (
          <form onSubmit={guardarEdicionTrabajo} className="space-y-4 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setTrabajoEditando(null)
                setPaso('detalle')
              }}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al detalle
            </Button>

            <div className="rounded-lg bg-primary/5 p-3 text-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Editando trabajo
              </p>
              <span className="font-semibold">{trabajoEditando.titulo}</span>
              <span className="ml-2 text-muted-foreground">
                · {vehiculoDetalle.marca} {vehiculoDetalle.modelo} ·{' '}
                <span className="font-mono">{vehiculoDetalle.patente}</span>
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="et-fecha" className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Fecha del trabajo *
                </Label>
                <Input
                  id="et-fecha"
                  type="date"
                  value={nuevoTrabajo.fecha}
                  onChange={(e) =>
                    setNuevoTrabajo((nt) => ({ ...nt, fecha: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="et-km" className="flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" /> Kilometraje (opcional)
                </Label>
                <Input
                  id="et-km"
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

            <div className="space-y-2">
              <Label htmlFor="et-titulo">Título del trabajo *</Label>
              <Input
                id="et-titulo"
                value={nuevoTrabajo.titulo}
                onChange={(e) =>
                  setNuevoTrabajo((nt) => ({ ...nt, titulo: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="et-desc">Descripción *</Label>
              <Textarea
                id="et-desc"
                value={nuevoTrabajo.descripcion}
                onChange={(e) =>
                  setNuevoTrabajo((nt) => ({
                    ...nt,
                    descripcion: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="et-precio">Precio (ARS) *</Label>
                <Input
                  id="et-precio"
                  type="number"
                  min="0"
                  value={nuevoTrabajo.precio}
                  onChange={(e) =>
                    setNuevoTrabajo((nt) => ({
                      ...nt,
                      precio: e.target.value,
                    }))
                  }
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
                <Label htmlFor="et-prox">Próxima revisión</Label>
                <Input
                  id="et-prox"
                  value={nuevoTrabajo.proximo}
                  onChange={(e) =>
                    setNuevoTrabajo((nt) => ({
                      ...nt,
                      proximo: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <Label htmlFor="et-rec" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Recordatorio (opcional)
              </Label>
              <Input
                id="et-rec"
                type="date"
                value={nuevoTrabajo.recordatorio}
                onChange={(e) =>
                  setNuevoTrabajo((nt) => ({
                    ...nt,
                    recordatorio: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Cuando se acerque esta fecha, el trabajo aparecerá en la sección
                "Recordatorios" del panel.
              </p>
              {nuevoTrabajo.recordatorio && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    setNuevoTrabajo((nt) => ({ ...nt, recordatorio: '' }))
                  }
                >
                  Quitar recordatorio
                </Button>
              )}
            </div>

            <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <Label htmlFor="et-ni" className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-600" /> Notas internas del taller
              </Label>
              <Textarea
                id="et-ni"
                value={nuevoTrabajo.notasInternas}
                onChange={(e) =>
                  setNuevoTrabajo((nt) => ({
                    ...nt,
                    notasInternas: e.target.value,
                  }))
                }
                placeholder="Solo vos ves esto. Ej: cliente moroso, repuesto pedido, observaciones técnicas..."
                rows={2}
              />
              <p className="text-xs text-amber-700">
                🔒 Estas notas son privadas, el cliente no las ve.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTrabajoEditando(null)
                  setPaso('detalle')
                }}
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
                  'Guardar cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* PASO 6: EDITAR DATOS DEL VEHÍCULO */}
        {paso === 'editar-vehiculo' && authToken && vehiculoDetalle && (
          <form onSubmit={guardarEdicionVehiculo} className="space-y-4 py-2">
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

            <div className="rounded-lg bg-primary/5 p-3 text-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Editando datos de
              </p>
              <span className="font-semibold">
                {vehiculoDetalle.marca} {vehiculoDetalle.modelo}
              </span>
              <span className="ml-2 font-mono">{vehiculoDetalle.patente}</span>
              <p className="mt-1 text-xs text-muted-foreground">
                La patente no se puede modificar.
              </p>
            </div>

            {/* Datos del titular */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Datos del titular</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nombre y apellido</Label>
                  <Input
                    value={editVehiculo.cliente_nombre}
                    onChange={(e) =>
                      setEditVehiculo((ev) => ({
                        ...ev,
                        cliente_nombre: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Teléfono</Label>
                  <Input
                    value={editVehiculo.cliente_telefono}
                    onChange={(e) =>
                      setEditVehiculo((ev) => ({
                        ...ev,
                        cliente_telefono: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    value={editVehiculo.cliente_email}
                    onChange={(e) =>
                      setEditVehiculo((ev) => ({
                        ...ev,
                        cliente_email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Dirección</Label>
                  <Input
                    value={editVehiculo.cliente_direccion}
                    onChange={(e) =>
                      setEditVehiculo((ev) => ({
                        ...ev,
                        cliente_direccion: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </fieldset>

            {/* Datos del vehículo */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Datos del vehículo</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Marca</Label>
                  <Input
                    value={editVehiculo.marca}
                    onChange={(e) =>
                      setEditVehiculo((ev) => ({ ...ev, marca: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Modelo</Label>
                  <Input
                    value={editVehiculo.modelo}
                    onChange={(e) =>
                      setEditVehiculo((ev) => ({ ...ev, modelo: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Año</Label>
                  <Input
                    type="number"
                    min="1950"
                    max="2030"
                    value={editVehiculo.anio}
                    onChange={(e) =>
                      setEditVehiculo((ev) => ({ ...ev, anio: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Color</Label>
                  <Input
                    value={editVehiculo.color}
                    onChange={(e) =>
                      setEditVehiculo((ev) => ({ ...ev, color: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Kilometraje</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editVehiculo.kilometraje}
                    onChange={(e) =>
                      setEditVehiculo((ev) => ({
                        ...ev,
                        kilometraje: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo</Label>
                  <Select
                    value={editVehiculo.tipo}
                    onValueChange={(v) =>
                      setEditVehiculo((ev) => ({ ...ev, tipo: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Auto">Auto</SelectItem>
                      <SelectItem value="Camioneta">Camioneta</SelectItem>
                      <SelectItem value="Moto">Moto</SelectItem>
                      <SelectItem value="Utilitario">Utilitario</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Combustible</Label>
                  <Select
                    value={editVehiculo.combustible}
                    onValueChange={(v) =>
                      setEditVehiculo((ev) => ({ ...ev, combustible: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nafta">Nafta</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="GNC">GNC</SelectItem>
                      <SelectItem value="Eléctrico">Eléctrico</SelectItem>
                      <SelectItem value="Híbrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notas visibles para el cliente</Label>
                <Textarea
                  value={editVehiculo.notas}
                  onChange={(e) =>
                    setEditVehiculo((ev) => ({ ...ev, notas: e.target.value }))
                  }
                  rows={2}
                  placeholder="Notas que el cliente verá en su historial"
                />
              </div>

              {/* Vencimientos */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Vencimiento VTV</Label>
                  <Input
                    type="date"
                    value={editVehiculo.vtvVencimiento}
                    onChange={(e) =>
                      setEditVehiculo((ev) => ({
                        ...ev,
                        vtvVencimiento: e.target.value,
                      }))
                    }
                  />
                </div>
                {editVehiculo.combustible === 'GNC' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Vencimiento obleta GNC</Label>
                    <Input
                      type="date"
                      value={editVehiculo.gncVencimiento}
                      onChange={(e) =>
                        setEditVehiculo((ev) => ({
                          ...ev,
                          gncVencimiento: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5 rounded-lg border border-amber-300 bg-amber-50 p-2">
                <Label className="flex items-center gap-1.5 text-xs text-amber-700">
                  <Lock className="h-3 w-3" /> Notas internas (solo taller)
                </Label>
                <Textarea
                  value={editVehiculo.notasInternas}
                  onChange={(e) =>
                    setEditVehiculo((ev) => ({
                      ...ev,
                      notasInternas: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="🔒 Solo vos ves esto. Ej: cliente moroso, historial de pagos, observaciones técnicas..."
                  className="border-amber-300"
                />
              </div>
            </fieldset>

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
                  'Guardar cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* PASO 7: RECORDATORIOS */}
        {paso === 'recordatorios' && authToken && (
          <div className="space-y-4 py-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Bell className="h-5 w-5 text-primary" />
                  Recordatorios
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Trabajos con fecha de recordatorio configurada. Los que están
                  vencidos o próximos aparecen arriba.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaso('lista')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </div>

            {cargandoRecordatorios ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recordatorios.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Bell className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium">
                    No hay recordatorios configurados
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cuando cargues un trabajo con fecha de recordatorio, va a
                    aparecer acá para que le avises al cliente.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {recordatorios.map((r) => {
                  const telefonoLimpio = r.cliente.telefono
                    .replace(/[^0-9]/g, '')
                    .replace(/^0/, '549')
                  const mensaje = r.tipo === 'vtv'
                    ? `Hola ${r.cliente.nombre}! Te recordamos que la VTV de tu ${r.vehiculo.marca} ${r.vehiculo.modelo} (patente ${r.vehiculo.patente}) vence el ${formatFecha(r.fechaRecordatorio)}. Recordá realizar la Verificación Técnica Vehicular. AutoSync - Taller Mecánico.`
                    : r.tipo === 'gnc'
                      ? `Hola ${r.cliente.nombre}! Te recordamos que la obleta GNC de tu ${r.vehiculo.marca} ${r.vehiculo.modelo} (patente ${r.vehiculo.patente}) vence el ${formatFecha(r.fechaRecordatorio)}. Recordá renovar la obleta de GNC. AutoSync - Taller Mecánico.`
                      : `Hola ${r.cliente.nombre}! Te recordamos que tu ${r.vehiculo.marca} ${r.vehiculo.modelo} (patente ${r.vehiculo.patente}) tiene pendiente: ${r.tituloTrabajo}. ${r.proximoTexto ? `Próximo: ${r.proximoTexto}.` : ''} AutoSync - Taller Mecánico.`
                  const urlWa = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`

                  return (
                    <div
                      key={r.id}
                      className={`rounded-lg border-2 p-4 ${
                        r.estado === 'vencido'
                          ? 'border-red-300 bg-red-50'
                          : r.estado === 'hoy'
                            ? 'border-amber-300 bg-amber-50'
                            : r.estado === 'proximo'
                              ? 'border-yellow-200 bg-yellow-50'
                              : 'border-border/60 bg-card'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">
                              {r.tituloTrabajo}
                            </span>
                            <Badge
                              variant={
                                r.tipo === 'trabajo'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="text-[10px]"
                            >
                              {r.tipo === 'vtv'
                                ? 'VTV'
                                : r.tipo === 'gnc'
                                  ? 'GNC'
                                  : 'Trabajo'}
                            </Badge>
                            <Badge
                              variant={
                                r.estado === 'vencido'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-[10px]"
                            >
                              {r.estado === 'vencido'
                                ? `Vencido ${Math.abs(r.diasRestantes)} día(s)`
                                : r.estado === 'hoy'
                                  ? 'Hoy'
                                  : r.estado === 'proximo'
                                    ? `En ${r.diasRestantes} día(s)`
                                    : `En ${r.diasRestantes} día(s)`}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {r.vehiculo.marca} {r.vehiculo.modelo} ·{' '}
                            <span className="font-mono">
                              {r.vehiculo.patente}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Cliente: {r.cliente.nombre} · {r.cliente.telefono}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Trabajo realizado el {formatFecha(r.fechaTrabajo)} ·
                            Recordatorio para el{' '}
                            <strong>{formatFecha(r.fechaRecordatorio)}</strong>
                          </p>
                          {r.proximoTexto && (
                            <p className="mt-1 text-xs text-primary">
                              Nota: {r.proximoTexto}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button asChild size="sm">
                          <a
                            href={urlWa}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Enviar por WhatsApp
                          </a>
                        </Button>
                        {r.cliente.email && (
                          <Button asChild variant="outline" size="sm">
                            <a href={`mailto:${r.cliente.email}?subject=${encodeURIComponent('Recordatorio - AutoSync')}&body=${encodeURIComponent(mensaje)}`}>
                              Enviar por Email
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Ir al detalle del vehículo
                            void verDetalle({
                              id: r.vehiculo.id,
                              marca: r.vehiculo.marca,
                              modelo: r.vehiculo.modelo,
                              anio: 0,
                              patente: r.vehiculo.patente,
                              tipo: '',
                              cliente: {
                                nombre: r.cliente.nombre,
                                telefono: r.cliente.telefono,
                              },
                              _count: { trabajos: 0 },
                            })
                          }}
                        >
                          Ver vehículo →
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* PASO 8: ESTADÍSTICAS */}
        {paso === 'estadisticas' && authToken && (
          <div className="space-y-4 py-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Estadísticas del taller
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Resumen general de actividad e ingresos (solo para el taller).
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaso('lista')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </div>

            {cargandoEstadisticas ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : estadisticas ? (
              <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
                {/* Tarjetas principales */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatCard
                    icon={Car}
                    label="Vehículos"
                    value={String(estadisticas.totales.vehiculos)}
                    color="bg-blue-500/10 text-blue-600"
                  />
                  <StatCard
                    icon={Users}
                    label="Clientes"
                    value={String(estadisticas.totales.clientes)}
                    color="bg-purple-500/10 text-purple-600"
                  />
                  <StatCard
                    icon={Wrench}
                    label="Trabajos totales"
                    value={String(estadisticas.totales.trabajos)}
                    color="bg-emerald-500/10 text-emerald-600"
                  />
                  <StatCard
                    icon={Wallet}
                    label="Ingresos totales"
                    value={formatPrecio(estadisticas.totales.ingresosTotales)}
                    color="bg-amber-500/10 text-amber-600"
                    small
                  />
                </div>

                {/* Tarjetas del mes con variación */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border-2 border-border/60 bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Trabajos este mes
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {estadisticas.totales.trabajosMes}
                      </p>
                      {estadisticas.totales.variacionTrabajos !== 0 && (
                        <span
                          className={`flex items-center gap-0.5 text-xs font-medium ${
                            estadisticas.totales.variacionTrabajos > 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          {estadisticas.totales.variacionTrabajos > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(estadisticas.totales.variacionTrabajos)}% vs mes anterior
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg border-2 border-border/60 bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ingresos este mes
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {formatPrecio(estadisticas.totales.ingresosMes)}
                      </p>
                      {estadisticas.totales.variacionIngresos !== 0 && (
                        <span
                          className={`flex items-center gap-0.5 text-xs font-medium ${
                            estadisticas.totales.variacionIngresos > 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          {estadisticas.totales.variacionIngresos > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(estadisticas.totales.variacionIngresos)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gráfico de barras: trabajos por mes */}
                <div className="rounded-lg border-2 border-border/60 bg-card p-4">
                  <h4 className="mb-3 text-sm font-semibold">
                    Trabajos por mes (últimos 6 meses)
                  </h4>
                  <div className="flex h-32 items-end justify-around gap-2">
                    {estadisticas.trabajosPorMes.map((m, i) => {
                      const max = Math.max(
                        ...estadisticas.trabajosPorMes.map((x) => x.cantidad),
                        1,
                      )
                      const altura = (m.cantidad / max) * 100
                      return (
                        <div
                          key={i}
                          className="flex flex-1 flex-col items-center gap-1"
                        >
                          <span className="text-xs font-bold">
                            {m.cantidad}
                          </span>
                          <div
                            className="w-full rounded-t bg-primary transition-all"
                            style={{ height: `${Math.max(altura, 4)}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {m.mes}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Ingresos por mes */}
                <div className="rounded-lg border-2 border-border/60 bg-card p-4">
                  <h4 className="mb-3 text-sm font-semibold">
                    Ingresos por mes (últimos 6 meses)
                  </h4>
                  <div className="flex h-32 items-end justify-around gap-2">
                    {estadisticas.trabajosPorMes.map((m, i) => {
                      const max = Math.max(
                        ...estadisticas.trabajosPorMes.map((x) => x.ingresos),
                        1,
                      )
                      const altura = (m.ingresos / max) * 100
                      return (
                        <div
                          key={i}
                          className="flex flex-1 flex-col items-center gap-1"
                        >
                          <span className="text-[10px] font-bold">
                            {m.ingresos > 0
                              ? formatPrecio(m.ingresos).replace(/\s?\$?/, '')
                              : '0'}
                          </span>
                          <div
                            className="w-full rounded-t bg-emerald-500 transition-all"
                            style={{ height: `${Math.max(altura, 4)}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {m.mes}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Estado de trabajos */}
                <div className="rounded-lg border-2 border-border/60 bg-card p-4">
                  <h4 className="mb-3 text-sm font-semibold">
                    Trabajos por estado
                  </h4>
                  <div className="space-y-2">
                    {estadisticas.trabajosPorEstado.map((t) => {
                      const total = estadisticas.trabajosPorEstado.reduce(
                        (acc, x) => acc + x.cantidad,
                        0,
                      )
                      const pct =
                        total > 0
                          ? Math.round((t.cantidad / total) * 100)
                          : 0
                      const color =
                        t.estado === 'Completado'
                          ? 'bg-emerald-500'
                          : t.estado === 'En proceso'
                            ? 'bg-amber-500'
                            : 'bg-zinc-400'
                      return (
                        <div key={t.estado}>
                          <div className="flex items-center justify-between text-xs">
                            <span>{t.estado}</span>
                            <span className="font-medium">
                              {t.cantidad} ({pct}%)
                            </span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full ${color}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Servicios más realizados */}
                {estadisticas.serviciosMasRealizados.length > 0 && (
                  <div className="rounded-lg border-2 border-border/60 bg-card p-4">
                    <h4 className="mb-3 text-sm font-semibold">
                      Servicios más realizados
                    </h4>
                    <div className="space-y-2">
                      {estadisticas.serviciosMasRealizados.map((s, i) => {
                        const max = Math.max(
                          ...estadisticas.serviciosMasRealizados.map(
                            (x) => x.cantidad,
                          ),
                        )
                        const pct = (s.cantidad / max) * 100
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-5 text-xs font-bold text-muted-foreground">
                              {i + 1}.
                            </span>
                            <span className="flex-1 truncate text-xs">
                              {s.nombre}
                            </span>
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs font-bold">
                              {s.cantidad}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Trabajos más realizados (por título) */}
                {estadisticas.titulosMasUsados.length > 0 && (
                  <div className="rounded-lg border-2 border-border/60 bg-card p-4">
                    <h4 className="mb-3 text-sm font-semibold">
                      Trabajos más realizados (por título)
                    </h4>
                    <div className="space-y-2">
                      {estadisticas.titulosMasUsados.map((t, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-bold text-muted-foreground">
                              {i + 1}.
                            </span>
                            {t.titulo}
                          </span>
                          <span className="font-bold">{t.cantidad}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vencimientos y recordatorios */}
                <div className="rounded-lg border-2 border-border/60 bg-card p-4">
                  <h4 className="mb-3 text-sm font-semibold">
                    Vencimientos y recordatorios pendientes
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-red-50 p-2 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-red-600">
                        VTV vencida
                      </p>
                      <p className="text-xl font-bold text-red-700">
                        {estadisticas.vencimientos.vtvVencida}
                      </p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-2 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-amber-600">
                        VTV por vencer
                      </p>
                      <p className="text-xl font-bold text-amber-700">
                        {estadisticas.vencimientos.vtvProxima}
                      </p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-2 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-red-600">
                        GNC vencida
                      </p>
                      <p className="text-xl font-bold text-red-700">
                        {estadisticas.vencimientos.gncVencida}
                      </p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-2 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-amber-600">
                        GNC por vencer
                      </p>
                      <p className="text-xl font-bold text-amber-700">
                        {estadisticas.vencimientos.gncProxima}
                      </p>
                    </div>
                    <div className="col-span-2 rounded-lg bg-primary/10 p-2 text-center sm:col-span-1">
                      <p className="text-[10px] uppercase tracking-wider text-primary">
                        Recordatorios pendientes
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {estadisticas.vencimientos.recordatoriosPendientes}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Totales del año */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border-2 border-border/60 bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Trabajos del año
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {estadisticas.totales.trabajosAnio}
                    </p>
                  </div>
                  <div className="rounded-lg border-2 border-border/60 bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ingresos del año
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {formatPrecio(estadisticas.totales.ingresosAnio)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No se pudieron cargar las estadísticas.
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* PASO 9: NUEVO/EDITAR DIAGNÓSTICO */}
        {(paso === 'diagnostico-nuevo' || paso === 'diagnostico-editar') && authToken && vehiculoDetalle && (
          <form onSubmit={guardarDiagnostico} className="space-y-4 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setDiagEditando(null)
                setPaso('detalle')
              }}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al detalle
            </Button>

            <div className="rounded-lg bg-primary/5 p-3 text-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {diagEditando ? 'Editando diagnóstico de' : 'Nuevo diagnóstico para'}
              </p>
              <span className="font-semibold">
                {vehiculoDetalle.marca} {vehiculoDetalle.modelo}
              </span>
              <span className="ml-2 font-mono">{vehiculoDetalle.patente}</span>
              <p className="mt-1 text-xs text-muted-foreground">
                🔒 Solo visible para el taller
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="d-titulo">Título *</Label>
                <Input
                  id="d-titulo"
                  value={nuevoDiag.titulo}
                  onChange={(e) => setNuevoDiag((nd) => ({ ...nd, titulo: e.target.value }))}
                  placeholder="Ej: Ruido al frenar / Falla en ralenti / No arranca"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={nuevoDiag.estado}
                  onValueChange={(v) => setNuevoDiag((nd) => ({ ...nd, estado: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En diagnóstico">En diagnóstico</SelectItem>
                    <SelectItem value="Resuelto">Resuelto</SelectItem>
                    <SelectItem value="Pendiente repuesto">Pendiente repuesto</SelectItem>
                    <SelectItem value="Sin solución">Sin solución</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="d-fecha">Fecha</Label>
                <Input
                  id="d-fecha"
                  type="date"
                  value={nuevoDiag.fecha}
                  onChange={(e) => setNuevoDiag((nd) => ({ ...nd, fecha: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-km">Kilometraje (opcional)</Label>
                <Input
                  id="d-km"
                  type="number"
                  min="0"
                  value={nuevoDiag.kilometraje}
                  onChange={(e) => setNuevoDiag((nd) => ({ ...nd, kilometraje: e.target.value }))}
                  placeholder="Ej: 95000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="d-sintoma" className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                Síntoma informado *
              </Label>
              <Textarea
                id="d-sintoma"
                value={nuevoDiag.sintoma}
                onChange={(e) => setNuevoDiag((nd) => ({ ...nd, sintoma: e.target.value }))}
                placeholder="Describí el síntoma que reporta el cliente o que detectaste. Ej: 'El cliente reporta ruido metálico al frenar desde hace 2 semanas, principalmente al frenar de alta velocidad.'"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="d-pruebas" className="flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-blue-500" />
                Pruebas realizadas
              </Label>
              <Textarea
                id="d-pruebas"
                value={nuevoDiag.pruebasRealizadas}
                onChange={(e) => setNuevoDiag((nd) => ({ ...nd, pruebasRealizadas: e.target.value }))}
                placeholder="Ej: 'Inspección visual de pastillas y discos. Medición de espesor de pastilla. Prueba de frenado en banco. Diagnóstico computarizado ABS.'"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="d-resultado" className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-purple-500" />
                Resultado de las pruebas
              </Label>
              <Textarea
                id="d-resultado"
                value={nuevoDiag.resultadoPrueba}
                onChange={(e) => setNuevoDiag((nd) => ({ ...nd, resultadoPrueba: e.target.value }))}
                placeholder="Ej: 'Pastillas delanteras con 2mm de espesor (límite 3mm). Discos con surcos profundos. Sin códigos de falla en ABS.'"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="d-diag" className="flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-red-500" />
                Diagnóstico
              </Label>
              <Textarea
                id="d-diag"
                value={nuevoDiag.diagnostico}
                onChange={(e) => setNuevoDiag((nd) => ({ ...nd, diagnostico: e.target.value }))}
                placeholder="Ej: 'Pastillas de freno delanteras agotadas y discos dañados por desgaste excesivo. Requiere reemplazo de ambas pastillas y rectificación/cambio de discos.'"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="d-solucion" className="flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-emerald-500" />
                Solución aplicada
              </Label>
              <Textarea
                id="d-solucion"
                value={nuevoDiag.solucion}
                onChange={(e) => setNuevoDiag((nd) => ({ ...nd, solucion: e.target.value }))}
                placeholder="Ej: 'Se reemplazaron pastillas delanteras (Bosch) y se rectificaron los discos. Se purgó el sistema de frenos.'"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="d-final" className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Resultado final
              </Label>
              <Textarea
                id="d-final"
                value={nuevoDiag.resultadoFinal}
                onChange={(e) => setNuevoDiag((nd) => ({ ...nd, resultadoFinal: e.target.value }))}
                placeholder="Ej: 'Vehículo frenando correctamente. Cliente conforma. Se recomienda revisión en 10.000 km.'"
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDiagEditando(null)
                  setPaso('detalle')
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardandoDiag}>
                {guardandoDiag ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  diagEditando ? 'Guardar cambios' : 'Crear diagnóstico'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* PASO 10: BÚSQUEDA GLOBAL DE SÍNTOMAS */}
        {paso === 'buscar-sintomas' && authToken && (
          <div className="space-y-4 py-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Search className="h-5 w-5 text-primary" />
                  Buscar síntomas
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Busca en todos los diagnósticos cargados. Encuentra casos
                  similares en cualquier vehículo.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaso('lista')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </div>

            <form onSubmit={buscarSintomas} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={busquedaSintoma}
                  onChange={(e) => setBusquedaSintoma(e.target.value)}
                  placeholder="Ej: ruido al frenar / no arranca / pierde agua / falla en ralenti..."
                  className="pl-10"
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={buscando}>
                {buscando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Buscar'
                )}
              </Button>
            </form>

            {/* Sugerencias de búsqueda rápida */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground">Búsquedas rápidas:</span>
              {['ruido', 'freno', 'no arranca', 'agua', 'aceite', 'luz', 'calentamiento'].map((sug) => (
                <button
                  key={sug}
                  onClick={() => {
                    setBusquedaSintoma(sug)
                    setTimeout(() => {
                      const form = document.querySelector('form')
                      form?.requestSubmit()
                    }, 100)
                  }}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Resultados */}
            {buscando ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : busquedaRealizada && resultadosBusqueda.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Search className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium">Sin resultados</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    No encontramos diagnósticos con "{busquedaSintoma}".
                    Probá con otras palabras.
                  </p>
                </CardContent>
              </Card>
            ) : resultadosBusqueda.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {resultadosBusqueda.length} resultado(s) encontrado(s) para "{busquedaSintoma}"
                </p>
                <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                  {resultadosBusqueda.map((r) => {
                    const estadoColor: Record<string, string> = {
                      'En diagnóstico': 'bg-amber-100 text-amber-800',
                      'Resuelto': 'bg-emerald-100 text-emerald-800',
                      'Pendiente repuesto': 'bg-blue-100 text-blue-800',
                      'Sin solución': 'bg-red-100 text-red-800',
                    }
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          void verDetalle({
                            id: r.vehiculo.id,
                            marca: r.vehiculo.marca,
                            modelo: r.vehiculo.modelo,
                            anio: r.vehiculo.anio,
                            patente: r.vehiculo.patente,
                            tipo: '',
                            cliente: { nombre: r.cliente.nombre, telefono: '' },
                            _count: { trabajos: 0 },
                          })
                        }}
                        className="block w-full rounded-lg border border-border/60 bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold">{r.titulo}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${estadoColor[r.estado] || 'bg-muted text-muted-foreground'}`}>
                                {r.estado}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              <span className="font-semibold">Vehículo:</span> {r.vehiculo.marca} {r.vehiculo.modelo} ({r.vehiculo.patente})
                              <span className="ml-2">· {r.cliente.nombre}</span>
                            </p>
                            <p className="mt-1 text-xs">
                              <span className="font-semibold text-muted-foreground">Síntoma:</span>{' '}
                              <span className="italic">{r.sintoma}</span>
                            </p>
                            {r.diagnostico && (
                              <p className="mt-1 text-xs">
                                <span className="font-semibold text-red-600">Diagnóstico:</span> {r.diagnostico}
                              </p>
                            )}
                            {r.solucion && (
                              <p className="mt-1 text-xs">
                                <span className="font-semibold text-emerald-600">Solución:</span> {r.solucion}
                              </p>
                            )}
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                              <span>{formatFecha(r.fecha)}</span>
                              {r.kilometraje != null && <span>· {r.kilometraje.toLocaleString('es-AR')} km</span>}
                              <span>· Encontrado en: {r.camposEncontrados.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function AdminVencimientoCard({
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

  let color: string
  let texto: string

  if (diasRestantes < 0) {
    color = 'border-red-400 bg-red-50 text-red-800'
    texto = `Vencida hace ${Math.abs(diasRestantes)} día(s) ⚠️`
  } else if (diasRestantes === 0) {
    color = 'border-amber-400 bg-amber-50 text-amber-800'
    texto = 'Vence hoy ⏰'
  } else if (diasRestantes <= 30) {
    color = 'border-amber-400 bg-amber-50 text-amber-800'
    texto = `Vence en ${diasRestantes} día(s) ⏰`
  } else if (diasRestantes <= 60) {
    color = 'border-yellow-300 bg-yellow-50 text-yellow-800'
    texto = `Vence en ${diasRestantes} día(s)`
  } else {
    color = 'border-emerald-200 bg-emerald-50 text-emerald-800'
    texto = 'Al día ✓'
  }

  return (
    <div className={`rounded-lg border-2 p-3 ${color}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
        {titulo}
      </p>
      <p className="text-sm font-bold">{formatFecha(fecha)}</p>
      <p className="mt-1 text-xs font-medium">{texto}</p>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  small,
}: {
  icon: typeof Car
  label: string
  value: string
  color: string
  small?: boolean
}) {
  return (
    <div className="rounded-lg border-2 border-border/60 bg-card p-3">
      <div className={`mb-1 flex h-8 w-8 items-center justify-center rounded-md ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`font-bold ${small ? 'text-sm' : 'text-xl'}`}>{value}</p>
    </div>
  )
}

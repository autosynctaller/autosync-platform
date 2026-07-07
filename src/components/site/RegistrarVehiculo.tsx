'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Car, User, CheckCircle2, Loader2 } from 'lucide-react'

const TIPOS = ['Auto', 'Camioneta', 'Moto', 'Utilitario', 'Otro']
const COMBUSTIBLES = ['Nafta', 'Diesel', 'GNC', 'Eléctrico', 'Híbrido']

export function RegistrarVehiculo() {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [ok, setOk] = useState(false)
  const [patenteIngresada, setPatenteIngresada] = useState('')

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    marca: '',
    modelo: '',
    anio: '',
    patente: '',
    color: '',
    kilometraje: '',
    tipo: 'Auto',
    combustible: 'Nafta',
    notas: '',
  })

  const update = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !form.nombre ||
      !form.telefono ||
      !form.marca ||
      !form.modelo ||
      !form.anio ||
      !form.patente
    ) {
      toast({
        title: 'Faltan datos',
        description: 'Completá los campos obligatorios marcados con *.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar')
      }

      setPatenteIngresada(form.patente.toUpperCase())
      setOk(true)
      toast({
        title: 'Vehículo registrado',
        description:
          '¡Listo! Ya podés consultar el historial cuando quieras con tu patente.',
      })
      setForm({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        marca: '',
        modelo: '',
        anio: '',
        patente: '',
        color: '',
        kilometraje: '',
        tipo: 'Auto',
        combustible: 'Nafta',
        notas: '',
      })
    } catch (err: unknown) {
      toast({
        title: 'No se pudo registrar',
        description:
          err instanceof Error ? err.message : 'Intentá nuevamente en un minuto.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const resetOk = () => {
    setOk(false)
    setPatenteIngresada('')
  }

  return (
    <section
      id="registrar"
      className="border-b border-border/60 bg-background py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3">
            Registro de vehículo
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Cargá los datos de tu vehículo
          </h2>
          <p className="mt-4 text-muted-foreground">
            Dejanos tus datos de contacto y la información de tu auto. Así
            podremos mantener un historial digital de todos los trabajos que le
            vayamos realizando.
          </p>
        </div>

        {ok ? (
          <Card className="mx-auto mt-10 max-w-2xl border-emerald-200 bg-emerald-50">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-900">
                  ¡Vehículo registrado con éxito!
                </h3>
                <p className="mt-1 text-sm text-emerald-800">
                  Guardá tu patente <strong>{patenteIngresada}</strong> para
                  consultar el historial cuando quieras.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetOk()
                    document
                      .querySelector('#historial')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Ver mi historial
                </Button>
                <Button onClick={resetOk}>Registrar otro vehículo</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mx-auto mt-10 max-w-3xl border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Formulario de registro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Datos del cliente */}
                <fieldset className="space-y-4">
                  <legend className="flex items-center gap-2 text-sm font-semibold">
                    <User className="h-4 w-4 text-primary" />
                    Datos del titular
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nombre y apellido *">
                      <Input
                        value={form.nombre}
                        onChange={(e) => update('nombre', e.target.value)}
                        placeholder="Juan Pérez"
                      />
                    </Field>
                    <Field label="Teléfono *">
                      <Input
                        value={form.telefono}
                        onChange={(e) => update('telefono', e.target.value)}
                        placeholder="(0223) 15X-XXXXXX"
                      />
                    </Field>
                    <Field label="Email (opcional)">
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="juan@email.com"
                      />
                    </Field>
                    <Field label="Dirección (opcional)">
                      <Input
                        value={form.direccion}
                        onChange={(e) => update('direccion', e.target.value)}
                        placeholder="Calle 1234, Mar del Plata"
                      />
                    </Field>
                  </div>
                </fieldset>

                {/* Datos del vehículo */}
                <fieldset className="space-y-4">
                  <legend className="flex items-center gap-2 text-sm font-semibold">
                    <Car className="h-4 w-4 text-primary" />
                    Datos del vehículo
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Marca *">
                      <Input
                        value={form.marca}
                        onChange={(e) => update('marca', e.target.value)}
                        placeholder="Toyota, Ford, Volkswagen..."
                      />
                    </Field>
                    <Field label="Modelo *">
                      <Input
                        value={form.modelo}
                        onChange={(e) => update('modelo', e.target.value)}
                        placeholder="Corolla, EcoSport, Gol..."
                      />
                    </Field>
                    <Field label="Año *">
                      <Input
                        type="number"
                        min="1950"
                        max="2030"
                        value={form.anio}
                        onChange={(e) => update('anio', e.target.value)}
                        placeholder="2018"
                      />
                    </Field>
                    <Field label="Patente *">
                      <Input
                        value={form.patente}
                        onChange={(e) =>
                          update('patente', e.target.value.toUpperCase())
                        }
                        placeholder="AB123CD o ABC123"
                        maxLength={7}
                        className="uppercase"
                      />
                    </Field>
                    <Field label="Color (opcional)">
                      <Input
                        value={form.color}
                        onChange={(e) => update('color', e.target.value)}
                        placeholder="Gris, Blanco, Negro..."
                      />
                    </Field>
                    <Field label="Kilometraje (opcional)">
                      <Input
                        type="number"
                        min="0"
                        value={form.kilometraje}
                        onChange={(e) => update('kilometraje', e.target.value)}
                        placeholder="85000"
                      />
                    </Field>
                    <Field label="Tipo de vehículo">
                      <Select
                        value={form.tipo}
                        onValueChange={(v) => update('tipo', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Combustible">
                      <Select
                        value={form.combustible}
                        onValueChange={(v) => update('combustible', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMBUSTIBLES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Notas para el taller (opcional)">
                    <Textarea
                      value={form.notas}
                      onChange={(e) => update('notas', e.target.value)}
                      placeholder="Contanos si hay algún ruido, falla o detalle que debamos revisar."
                      rows={3}
                    />
                  </Field>
                </fieldset>

                <div className="flex flex-col items-center gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Tus datos se usan únicamente para gestionar el servicio y el
                    historial de tu vehículo.
                  </p>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      'Registrar vehículo'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
          Los precios de los servicios se confirman al momento del presupuesto,
          teniendo en cuenta el modelo y estado del vehículo. Te avisamos antes
          de comenzar cualquier trabajo.
        </p>
      </div>
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}

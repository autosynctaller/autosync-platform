'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Wrench,
  Gauge,
  Car,
  Battery,
  Snowflake,
  Cog,
  Sparkles,
  CircleDot,
  Disc3,
  Zap,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

interface Servicio {
  id: string
  nombre: string
  descripcion: string
  precioBase: number | null
  categoria: string
  icono: string | null
  destacado: boolean
}

const ICONOS: Record<string, LucideIcon> = {
  oil: Wrench,
  brake: CircleDot,
  scan: Gauge,
  tire: Disc3,
  suspension: Car,
  battery: Battery,
  ac: Snowflake,
  clutch: Cog,
  service: ShieldCheck,
  spark: Zap,
}

function getIcono(nombre: string | null): LucideIcon {
  if (nombre && ICONOS[nombre]) return ICONOS[nombre]
  return Sparkles
}

export function ServiciosSection() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/servicios')
      .then((r) => r.json())
      .then((data) => {
        setServicios(data.servicios || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="servicios"
      className="border-b border-border/60 bg-background py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3">
            Servicios
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Todo lo que tu vehículo necesita, en un solo lugar
          </h2>
          <p className="mt-4 text-muted-foreground">
            Contamos con equipamiento de última generación y técnicos
            especializados para atenderte en cada visita. Estos son los
            servicios que ofrecemos.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicios.map((s) => {
              const Icon = getIcono(s.icono)
              return (
                <Card
                  key={s.id}
                  className="group relative flex flex-col overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  {s.destacado && (
                    <div className="absolute right-0 top-0 bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                      Destacado
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-3 text-lg">{s.nombre}</CardTitle>
                    <Badge variant="outline" className="mt-1 w-fit">
                      {s.categoria}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <p className="text-sm text-muted-foreground">
                      {s.descripcion}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-border/60 bg-muted/40 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-semibold">
                ¿No encontrás el servicio que necesitás?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Contanos qué problema tenés y te asesoramos sin compromiso.
              </p>
            </div>
            <button
              onClick={() => scrollTo('#contacto')}
              className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Contactanos
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

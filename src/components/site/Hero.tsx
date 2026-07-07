'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wrench, ShieldCheck, Clock, Phone } from 'lucide-react'

export function Hero() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="inicio"
      className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-800 text-zinc-50"
    >
      {/* Patrón de fondo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Glow ámbar */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Badge
              variant="outline"
              className="w-fit border-primary/40 bg-primary/10 text-primary-foreground"
            >
              <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
              Taller mecánico en Mar del Plata
            </Badge>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span>Tu coche en las&nbsp;</span>
              <span className="text-primary">mejores manos</span>
              <span>, siempre.</span>
            </h1>

            <p className="max-w-xl text-lg text-zinc-300">
              Servicio automotor integral con más de 20 años de experiencia.
              Hacé tu service, diagnosticamos cualquier falla y llevamos un
              historial digital completo de cada trabajo que realizamos en tu
              vehículo.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => scrollTo('#registrar')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Registrar mi vehículo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo('#servicios')}
                className="border-zinc-600 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-white"
              >
                Ver servicios
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Garantía escrita
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Turnos rápidos
              </span>
              <span className="flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-primary" />
                Repuestos originales
              </span>
            </div>
          </div>

          {/* Card visual */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 -rotate-3 rounded-3xl bg-primary/20 blur-2xl" />
            <div className="relative rounded-3xl border border-zinc-700 bg-zinc-800/60 p-8 backdrop-blur">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-zinc-400">
                  Estado del taller
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Abierto ahora
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Años de experiencia" value="20+" />
                <StatCard label="Vehículos atendidos" value="8.500+" />
                <StatCard label="Servicios activos" value="11" />
                <StatCard label="Rating promedio" value="4.9 ★" />
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Reservá tu turno</p>
                  <p className="text-sm font-semibold text-white">
                    (0223) 594-1522
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-zinc-400">{label}</p>
    </div>
  )
}

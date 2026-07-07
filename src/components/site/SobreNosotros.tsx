'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Wrench, Award, Users, MapPin } from 'lucide-react'

export function SobreNosotros() {
  return (
    <section
      id="nosotros"
      className="border-b border-border/60 bg-muted/30 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge variant="secondary" className="mb-3">
              Sobre nosotros
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Un taller con raíces en Mar del Plata
            </h2>
            <div className="mt-6 space-y-4 text-base text-muted-foreground">
              <p>
                Somos un taller mecánico ubicado en el corazón de Mar del Plata
                con más de dos décadas de trayectoria atendiendo vehículos de
                toda la región. Nuestra filosofía es simple: hacer las cosas
                bien, con repuestos de calidad y precios honestos. Tratamos a
                cada cliente como nos gustaría que nos traten a nosotros, y por
                eso miles de marplatenses nos siguen eligiendo generación tras
                generación.
              </p>
              <p>
                Trabajamos con todas las marcas y modelos, tanto nacionales como
                importados, y nos actualizamos constantemente en las nuevas
                tecnologías del automotor. Tenemos equipos de diagnóstico de
                última generación y un equipo de técnicos capacitados para
                resolver desde un simple cambio de aceite hasta las reparaciones
                más complejas.
              </p>
              <p>
                Recientemente incorporamos un sistema digital de historial de
                servicios, para que cada cliente pueda registrar su vehículo y
                consultar online todos los trabajos que fuimos realizando. Esto
                no solo te da transparencia total, sino que también aumenta el
                valor de reventa de tu auto al contar con un registro completo
                de mantenimiento.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Pillar
                icon={Wrench}
                title="Reparaciones garantizadas"
                text="Todos nuestros trabajos cuentan con garantía escrita."
              />
              <Pillar
                icon={Award}
                title="Técnicos certificados"
                text="Personal constantemente capacitado en nuevas tecnologías."
              />
              <Pillar
                icon={Users}
                title="Atención cercana"
                text="Te explicamos qué le pasa a tu auto, en lenguaje claro."
              />
            </div>
          </div>

          <Card className="overflow-hidden border-border/60">
            <CardContent className="p-0">
              <div className="bg-zinc-900 p-8 text-zinc-50">
                <p className="text-xs uppercase tracking-widest text-zinc-400">
                  Información del taller
                </p>
                <h3 className="mt-2 text-2xl font-bold">
                  AutoSync
                </h3>
              </div>
              <div className="divide-y divide-border/60">
                <InfoRow
                  icon={MapPin}
                  label="Dirección"
                  value="Falucho 4657, Mar del Plata, Buenos Aires"
                />
                <InfoRow
                  icon={Wrench}
                  label="Horario de atención"
                  value="Lunes a Viernes de 9:00 a 18:00 · Sábados de 9:00 a 13:00"
                />
                <InfoRow
                  icon={Award}
                  label="Especialidades"
                  value="Inyección electrónica · Frenos ABS · Suspensión · Service oficial"
                />
                <InfoRow
                  icon={Users}
                  label="Equipo"
                  value="5 mecánicos especializados y 2 asesores técnicos"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function Pillar({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Wrench
  title: string
  text: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 p-5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

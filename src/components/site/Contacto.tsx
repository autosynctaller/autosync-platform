'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'

const WHATSAPP = '2235941522'
const TEL_FORMATO = '(0223) 594-1522'

export function Contacto() {
  return (
    <section
      id="contacto"
      className="border-b border-border/60 bg-background py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3">
            Contacto
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Estamos en Mar del Plata, listos para atenderte
          </h2>
          <p className="mt-4 text-muted-foreground">
            Escribinos por WhatsApp, llamanos o pasá por el taller. Te
            asesoramos sin compromiso y coordinamos un turno que se acomode a tu
            rutina.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-start gap-3 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Teléfono
                </p>
                <a
                  href={`tel:+549${WHATSAPP}`}
                  className="mt-0.5 block text-lg font-semibold hover:text-primary"
                >
                  {TEL_FORMATO}
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Atendemos llamadas en horario de taller.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="flex flex-col items-start gap-3 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  WhatsApp
                </p>
                <a
                  href={`https://wa.me/549${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 block text-lg font-semibold hover:text-emerald-600"
                >
                  +54 9 223 594-1522
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Respondemos consultas de lunes a viernes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="flex flex-col items-start gap-3 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Dirección
                </p>
                <p className="mt-0.5 text-lg font-semibold">
                  Falucho 4657
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Mar del Plata, Buenos Aires.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 overflow-hidden border-border/60">
          <CardContent className="grid gap-0 p-0 md:grid-cols-2">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Dónde estamos</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Falucho 4657, entre las calles cercanas al barrio.
                <br />
                Mar del Plata, Buenos Aires, Argentina.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Colectivos que te dejan cerca: líneas 522, 583 y 593. A 5
                minutos del centro.
              </p>

              <div className="mt-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Horarios</h3>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li className="flex justify-between">
                  <span>Lunes a Viernes</span>
                  <span className="font-medium text-foreground">
                    8:00 – 18:00
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Sábados</span>
                  <span className="font-medium text-foreground">
                    9:00 – 13:00
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Domingos y feriados</span>
                  <span className="font-medium text-foreground">Cerrado</span>
                </li>
              </ul>
            </div>

            {/* Mapa */}
            <div className="min-h-[280px] bg-muted">
              <iframe
                title="Mapa de AutoSync en Mar del Plata"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-57.5650%2C-38.0120%2C-57.5450%2C-37.9920&layer=mapnik&marker=-38.0020%2C-57.5550"
                className="h-full min-h-[280px] w-full border-0"
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wrench, Lock, MapPin, Phone, Clock } from 'lucide-react'
import { AdminPanel } from './AdminPanel'

export function Footer() {
  const [adminOpen, setAdminOpen] = useState(false)

  return (
    <footer className="mt-auto bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Marca */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Taller Mecánica MDP
                </p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Mar del Plata · Buenos Aires
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm text-zinc-400">
              Más de 20 años atendiendo vehículos en la ciudad feliz. Servicio
              automotor integral con garantía escrita y precios honestos.
            </p>
          </div>

          {/* Contacto rápido */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Contacto
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Av. Colón 1234, Mar del Plata</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href="tel:+542231234567"
                  className="hover:text-white"
                >
                  (0223) 123-4567
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>L-V 8-18 · Sáb 9-13</span>
              </li>
            </ul>
          </div>

          {/* Acceso */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Acceso interno
            </p>
            <p className="mb-3 text-xs text-zinc-500">
              Si sos del taller, accedé al panel de administración.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdminOpen(true)}
              className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white"
            >
              <Lock className="mr-2 h-4 w-4" />
              Panel admin
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-zinc-800 pt-6 text-xs text-zinc-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Taller Mecánica MDP · Todos los
            derechos reservados.
          </p>
          <p>Hecho con dedicación para los marplatenses.</p>
        </div>
      </div>

      <AdminPanel open={adminOpen} onOpenChange={setAdminOpen} />
    </footer>
  )
}

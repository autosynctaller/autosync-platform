'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu, Wrench, Phone } from 'lucide-react'

const NAV_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#registrar', label: 'Registrar Vehículo' },
  { href: '#historial', label: 'Mi Historial' },
  { href: '#contacto', label: 'Contacto' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  const scrollTo = (href: string) => {
    setOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => scrollTo('#inicio')}
          className="flex items-center gap-2"
          aria-label="Ir al inicio"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-bold tracking-tight">
              Taller Mecánica MDP
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Mar del Plata
            </span>
          </div>
        </button>

        {/* Navegación escritorio */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Button
              key={l.href}
              variant="ghost"
              size="sm"
              onClick={() => scrollTo(l.href)}
              className="text-sm"
            >
              {l.label}
            </Button>
          ))}
        </nav>

        {/* CTA escritorio */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild size="sm">
            <a href="tel:+542231234567" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Llamar
            </a>
          </Button>
        </div>

        {/* Menú móvil */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Button
                  key={l.href}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => scrollTo(l.href)}
                >
                  {l.label}
                </Button>
              ))}
              <Button asChild className="mt-3">
                <a href="tel:+542231234567" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Llamar al taller
                </a>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Car, Search, Wrench, Shield, TrendingUp, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { AdBanner } from '@/components/site/AdBanner'

export default function HomePage() {
  const [patente, setPatente] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [resultado, setResultado] = useState<null | { encontrado: boolean; vehiculo?: any; mensaje: string }>(null)

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (patente.length < 6) return
    setBuscando(true); setResultado(null)
    try {
      const res = await fetch(`/api/vehiculos/buscar?patente=${encodeURIComponent(patente)}`)
      const data = await res.json()
      setResultado(data)
    } catch {} finally { setBuscando(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><Car className="h-5 w-5" /></div>
            <span className="text-lg font-bold">AutoSync</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium hover:text-primary">Iniciar sesión</Link>
            <Link href="/login?tab=registro" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Registrarme</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-800 text-zinc-50">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">El historial digital de tu vehículo, <span className="text-primary">en un solo lugar</span></h1>
            <p className="mt-6 text-lg text-zinc-300">Consultá todos los trabajos realizados en tu auto, gestiona VTV y GNC, y conectá con talleres de confianza. Gratis para los dueños.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/login?tab=registro" className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90">Crear cuenta gratis</Link>
              <Link href="#buscar" className="rounded-lg border border-zinc-600 px-6 py-3 text-base font-semibold text-zinc-100 hover:bg-zinc-800">Buscar vehículo</Link>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER DE PUBLICIDAD */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <AdBanner tipo="BANNER_HOME" />
      </div>

      {/* Features */}
      <section className="border-b border-border/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Una plataforma para todos</h2>
            <p className="mt-4 text-muted-foreground">Diseñada para dueños de vehículos y talleres mecánicos.</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Search} title="Historial por patente" text="Consultá si un vehículo tiene historial digital cargado." />
            <FeatureCard icon={Shield} title="Tus datos protegidos" text="Cada taller solo ve sus propios trabajos." />
            <FeatureCard icon={Wrench} title="Gestión para talleres" text="Cargá trabajos, fotos, diagnósticos y documentos." />
            <FeatureCard icon={TrendingUp} title="Cronogramas de service" text="535 cronogramas de 20 marcas, hasta 500.000 km." />
            <FeatureCard icon={Car} title="Multi-taller" text="Tu vehículo acumula historial de todos los talleres." />
            <FeatureCard icon={ArrowRight} title="Recordatorios" text="Te avisamos cuando vence VTV, GNC o el próximo service." />
          </div>
        </div>
      </section>

      {/* Buscar patente + SIDEBAR */}
      <section id="buscar" className="border-b border-border/60 bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Buscador */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold tracking-tight">¿Tiene historial digital?</h2>
              <p className="mt-4 text-muted-foreground">Ingresá una patente para saber si el vehículo tiene historial cargado en AutoSync.</p>
              <form onSubmit={buscar} className="mt-8 flex gap-3">
                <input type="text" value={patente} onChange={(e) => setPatente(e.target.value.toUpperCase())} placeholder="Ej: AB123CD" maxLength={7} className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-lg uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary" />
                <button type="submit" disabled={buscando} className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{buscando ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Consultar'}</button>
              </form>
              {resultado && (
                <div className={`mt-6 rounded-xl border-2 p-6 ${resultado.encontrado ? 'border-emerald-300 bg-emerald-50' : 'border-zinc-300 bg-zinc-50'}`}>
                  {resultado.encontrado ? (
                    <div>
                      <div className="mb-2 flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-emerald-600" /><span className="text-lg font-bold text-emerald-900">{resultado.vehiculo?.marca} {resultado.vehiculo?.modelo} ({resultado.vehiculo?.anio})</span></div>
                      <p className="text-sm text-emerald-700">{resultado.mensaje}</p>
                      <Link href="/login" className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Crear cuenta para ver detalles →</Link>
                    </div>
                  ) : (
                    <div><div className="mb-2 flex items-center gap-2"><XCircle className="h-6 w-6 text-zinc-400" /><span className="text-lg font-bold text-zinc-700">Sin historial</span></div><p className="text-sm text-zinc-500">{resultado.mensaje}</p></div>
                  )}
                </div>
              )}
            </div>
            {/* SIDEBAR con publicidad */}
            <div className="space-y-4">
              <AdBanner tipo="SIDEBAR" />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-zinc-950 py-8 text-center text-sm text-zinc-500"><p>© {new Date().getFullYear()} AutoSync - Historial Digital Automotor</p></footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, text }: { icon: typeof Car; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

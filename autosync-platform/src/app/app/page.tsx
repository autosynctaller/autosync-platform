'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Loader2, LogOut, Wrench, User, Search } from 'lucide-react'

export default function AppPage() {
  const router = useRouter()
  const [user, setUser] = useState<null | { id: string; nombre: string; email: string; rol: string; taller?: { id: string; nombre: string } | null }>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user) {
          router.push('/login')
        } else {
          setUser(data.user)
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Car className="h-5 w-5" />
            </div>
            <span className="font-bold">AutoSync</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.nombre}</span>
            <button onClick={handleLogout} className="rounded-md p-2 hover:bg-muted">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">¡Bienvenido, {user.nombre}!</h1>
        <p className="mt-1 text-muted-foreground">
          Rol: <span className="font-medium">{user.rol}</span>
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {user.rol === 'TALLER' && (
            <>
              <DashCard icon={Wrench} title="Gestión de taller" text="Cargar trabajos, fotos, diagnósticos" href="#" />
              <DashCard icon={Car} title="Vehículos" text="Buscar y cargar trabajos por patente" href="#" />
              <DashCard icon={Search} title="Buscar síntomas" text="Buscar diagnósticos en todos los vehículos" href="#" />
            </>
          )}
          {user.rol === 'DUENO' && (
            <>
              <DashCard icon={Car} title="Mis vehículos" text="Ver y gestionar tus vehículos" href="#" />
              <DashCard icon={Search} title="Buscar taller" text="Encontrar talleres registrados" href="#" />
            </>
          )}
          {user.rol === 'SUPER_ADMIN' && (
            <>
              <DashCard icon={Wrench} title="Talleres" text="Gestionar talleres de la plataforma" href="#" />
              <DashCard icon={Car} title="Vehículos" text="Ver todos los vehículos" href="#" />
            </>
          )}
        </div>

        <div className="mt-8 rounded-xl border-2 border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            🚧 Panel en construcción. Las funcionalidades se irán agregando en las próximas sesiones.
          </p>
        </div>
      </main>
    </div>
  )
}

function DashCard({ icon: Icon, title, text, href }: { icon: typeof Car; title: string; text: string; href: string }) {
  return (
    <a href={href} className="block rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </a>
  )
}

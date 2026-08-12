'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Car, Wrench, Search, FileText, BarChart3, User, LogOut, Loader2, Settings, Bell } from 'lucide-react'

interface UserTaller {
  id: string
  nombre: string
  email: string
  rol: string
  taller: { id: string; nombre: string; plan: string } | null
}

export default function TallerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserTaller | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user) {
          router.push('/login')
        } else if (data.user.rol !== 'TALLER') {
          router.push('/app')
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
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!user) return null

  const links = [
    { href: '/app/taller/vehiculos', label: 'Vehículos', icon: Car },
    { href: '/app/taller/servicios', label: 'Servicios', icon: Wrench },
    { href: '/app/taller/recordatorios', label: 'Recordatorios', icon: Bell },
    { href: '/app/taller/diagnosticos', label: 'Diagnósticos', icon: Search },
    { href: '/app/taller/estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { href: '/app/taller/perfil', label: 'Mi perfil', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/app/taller/vehiculos" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight">{user.taller?.nombre || 'Taller'}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{user.taller?.plan === 'PREMIUM' ? 'Premium' : 'Plan gratis'}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:block">{user.nombre}</span>
            <button onClick={handleLogout} className="rounded-md p-2 hover:bg-muted"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-22 space-y-1">
            {links.map(link => {
              const Icon = link.icon
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-border bg-background md:hidden">
          {links.slice(0, 5).map(link => {
            const Icon = link.icon
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link key={link.href} href={link.href} className={`flex flex-col items-center gap-0.5 py-2 px-3 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{link.label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>

        {/* Content */}
        <main className="min-w-0 flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}

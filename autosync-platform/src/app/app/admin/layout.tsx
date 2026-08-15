'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, LogOut, Wrench, Car, Megaphone, BarChart3, Users } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) { router.push('/login'); return }
      if (data.user.rol !== 'SUPER_ADMIN') { router.push('/app'); return }
      setUser(data.user)
    }).finally(() => setLoading(false))
  }, [router])
  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (!user) return null
  const links = [
    { href: '/app/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/app/admin/talleres', label: 'Talleres', icon: Wrench },
    { href: '/app/admin/vehiculos', label: 'Vehículos', icon: Car },
    { href: '/app/admin/usuarios', label: 'Usuarios', icon: Users },
    { href: '/app/admin/anuncios', label: 'Anuncios', icon: Megaphone },
  ]
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-white"><Megaphone className="h-5 w-5" /></div><div><p className="text-sm font-bold">Admin Platform</p><p className="text-[10px] text-muted-foreground">AutoSync</p></div></div>
          <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/') }} className="rounded-md p-2 hover:bg-muted"><LogOut className="h-4 w-4" /></button>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-48 shrink-0 md:block"><nav className="sticky top-22 space-y-1">{links.map(l => <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><l.icon className="h-4 w-4" />{l.label}</Link>)}</nav></aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}

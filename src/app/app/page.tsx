'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AppRedirect() {
  const router = useRouter()
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user) { router.push('/login'); return }
        if (data.user.rol === 'TALLER') router.push('/app/taller/vehiculos')
        else if (data.user.rol === 'DUENO') router.push('/app/dueno')
        else router.push('/app/admin')
      })
  }, [router])

  return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
}

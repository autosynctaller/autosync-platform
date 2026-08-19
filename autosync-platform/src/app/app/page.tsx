'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { authFetch, getToken, getStoredUser } from '@/lib/auth-client'

export default function AppRedirect() {
  const router = useRouter()
  useEffect(() => {
    const storedUser = getStoredUser()
    const token = getToken()
    
    if (storedUser && token) {
      if (storedUser.rol === 'TALLER') router.push('/app/taller/vehiculos')
      else if (storedUser.rol === 'DUENO') router.push('/app/dueno')
      else router.push('/app/admin')
      return
    }
    
    authFetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user) { router.push('/login'); return }
        if (data.user.rol === 'TALLER') router.push('/app/taller/vehiculos')
        else if (data.user.rol === 'DUENO') router.push('/app/dueno')
        else router.push('/app/admin')
      })
      .catch(() => router.push('/login'))
  }, [router])

  return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
}

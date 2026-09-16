import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

// POST: cerrar sesión
export async function POST() {
  await clearAuthCookie()
  return NextResponse.json({ ok: true })
}

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { db } from './db'
import type { RolUsuario } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me'
const COOKIE_NAME = 'autosync_token'
const SESSION_DURATION = 30 * 24 * 60 * 60 // 30 días en segundos

// ============ HASH DE CONTRASEÑAS ============

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ============ JWT Y SESIONES ============

interface TokenPayload {
  userId: string
  email: string
  rol: RolUsuario
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${SESSION_DURATION}s` })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

// ============ COOKIES ============

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}

// ============ OBTENER USUARIO ACTUAL ============

export async function getCurrentUser() {
  const token = await getTokenFromCookie()
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      rol: true,
      nombre: true,
      telefono: true,
      taller: true,
    },
  })

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autenticado')
  }
  return user
}

export async function requireRole(...roles: RolUsuario[]) {
  const user = await requireAuth()
  if (!roles.includes(user.rol)) {
    throw new Error('No autorizado')
  }
  return user
}

// ============ SLUG PARA TALLERES ============

export function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // quitar caracteres especiales
    .replace(/[\s_-]+/g, '-') // espacios y guiones → un guión
    .replace(/^-+|-+$/g, '') // quitar guiones del inicio/final
}

export async function uniqueSlug(nombre: string): Promise<string> {
  const baseSlug = generateSlug(nombre)
  let slug = baseSlug
  let counter = 1
  while (await db.taller.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  return slug
}

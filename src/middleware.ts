import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes qui NE NÉCESSITENT PAS d'authentification
const publicRoutes = new Set([
  '/', '/login', '/signup', '/verify-email',
  '/forgot-password', '/reset-password', '/pricing',
  '/getting-started',
])

// Routes API qui ne nécessitent pas d'auth
const publicApiPrefixes = ['/api/auth/', '/api/plans', '/api/public/']

// Routes API qui nécessitent une vérification
const protectedApiPrefixes = ['/api/admin/', '/api/subscription']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ressources statiques toujours autorisées
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  // API routes : on laisse TOUTES passer, elles gèrent leur propre auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Pages publiques
  if (publicRoutes.has(pathname)) {
    return NextResponse.next()
  }

  // Routes protégées — pages privées
  const protectedPages = ['/dashboard', '/compta', '/commercial', '/stocks', '/paie', '/fiscalite', '/etats', '/chat-ohada', '/admin', '/auth/new-company']
  for (const route of protectedPages) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      const token = request.cookies.get('token')?.value
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      try {
        const jwt = require('jsonwebtoken')
        jwt.verify(token, process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026')
        const res = NextResponse.next()
        res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
        return res
      } catch {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

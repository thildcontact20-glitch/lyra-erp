import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques accessibles sans authentification
const publicRoutes = new Set([
  '/', '/login', '/signup', '/verify-email',
  '/forgot-password', '/reset-password', '/pricing',
])

// Routes protégées — pages privées uniquement
const protectedRoutes = [
  '/dashboard', '/compta', '/commercial', '/stocks',
  '/paie', '/fiscalite', '/etats', '/chat-ohada',
  '/admin', '/auth/new-company',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ressources statiques toujours autorisées
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  // Toutes les routes API sont publiques — elles gèrent leur propre auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Routes publiques
  if (publicRoutes.has(pathname)) {
    const res = NextResponse.next()
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return res
  }

  // Routes protégées — vérifier le cookie token
  for (const route of protectedRoutes) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      const token = request.cookies.get('token')?.value
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      // Vérification simple du JWT
      try {
        const jwt = require('jsonwebtoken')
        jwt.verify(token, process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026')
      } catch {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      const res = NextResponse.next()
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

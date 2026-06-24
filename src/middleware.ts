import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026';

// Routes publiques accessibles sans authentification
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/pricing',
  '/getting-started',
];

// Préfixes de routes publiques (toutes les sous-routes)
const publicPrefixes = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/verify-email',
  '/api/auth/resend-code',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/plans',
  '/api/public/',
];

// Routes protégées (privées)
const protectedRoutes = [
  '/dashboard',
  '/compta',
  '/commercial',
  '/stocks',
  '/paie',
  '/fiscalite',
  '/etats',
  '/chat-ohada',
  '/admin',
  '/api/subscription',
  '/api/admin',
  '/api/accounting',
  '/api/commercial',
  '/api/stocks',
  '/api/payroll',
  '/api/tax',
  '/api/financial',
  '/api/companies',
  '/api/chat',
  '/api/seed',
  '/auth/new-company',
];

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true;
  for (const prefix of publicPrefixes) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

function isProtectedRoute(pathname: string): boolean {
  for (const route of protectedRoutes) {
    if (pathname === route || pathname.startsWith(route + '/')) return true;
  }
  return false;
}

function verifyToken(token: string): { userId: string } | null {
  try {
    // Dynamique import pour éviter les problèmes de bundle
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes statiques Next.js (_next) toujours autorisées
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // Si la route n'est ni publique ni protégée, on laisse passer
  if (!isPublicRoute(pathname) && !isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Routes publiques: laisser passer
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }

  // Routes protégées: vérifier le token
  const token = request.cookies.get('token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Ajouter des headers anti-cache pour les pages protégées
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}

export const config = {
  matcher: [
    // Exclure les ressources statiques
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

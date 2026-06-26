import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026';

// Routes publiques — ne jamais bloquer
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/pricing',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/contact',
  '/api/auth',
  '/api/plans',
  '/api/seed',
];

// Vérifie si le chemin commence par une route publique ou un préfixe autorisé
function isPublicRoute(pathname: string): boolean {
  // Assets statiques Next.js
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/img/') ||
    pathname.startsWith('/public/') ||
    pathname === '/favicon.ico'
  ) {
    return true;
  }

  // Routes API publiques (toutes les routes sous /api/auth/*)
  if (pathname.startsWith('/api/auth/') || pathname === '/api/auth') {
    return true;
  }
  if (pathname === '/api/plans' || pathname.startsWith('/api/plans/')) {
    return true;
  }
  if (pathname === '/api/seed' || pathname.startsWith('/api/seed/')) {
    return true;
  }

  // Routes API privées — ne PAS bloquer ici (elles ont leur propre auth 401)
  // Le middleware ne doit pas rediriger les APIs vers /login en HTML
  if (pathname.startsWith('/api/')) {
    return true;
  }

  // Routes pages publiques
  for (const route of PUBLIC_ROUTES) {
    if (pathname === route) {
      return true;
    }
  }

  return false;
}

// Décodage edge-safe du payload JWT (sans dépendance lourde)
function decodeJwtPayload(token: string): { userId: string; email: string; companyId?: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));

    // Vérification basique de la structure
    if (!payload.userId || !payload.email || !payload.exp) return null;

    return {
      userId: payload.userId,
      email: payload.email,
      companyId: payload.companyId || null,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ne pas bloquer les routes publiques
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Lire le token depuis les cookies
  const token = request.cookies.get('token')?.value;

  // Pas de token → redirect vers /login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Décoder le payload JWT (edge-safe)
  const payload = decodeJwtPayload(token);

  // Token invalide → redirect vers /login
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token expiré → redirect vers /login
  if (payload.exp * 1000 < Date.now()) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token valide → continuer
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

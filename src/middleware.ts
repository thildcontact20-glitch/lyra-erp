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

  // ========== HEADERS DE SÉCURITÉ ==========
  const response = NextResponse.next();

  // Ajouter les headers de sécurité à toutes les réponses HTML
  if (!pathname.startsWith('/_next/')) {
    // Content Security Policy - empêche l'injection de scripts et le vol de données
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none';"
    );

    // Anti-Clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Protection XSS
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer Policy - ne pas fuiter l'URL
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // HSTS - force HTTPS
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // Permissions Policy - limiter les API navigateur
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );
  }

  // ========== ANTI-VOL : Watermark serveur invisible ==========
  // Ajouter un header qui identifie l'instance serveur (détectable côté client)
  if (pathname === '/') {
    response.headers.set('X-LYRA-INSTANCE', 'vivalys-prod');
  }

  // ========== VÉRIFICATION AUTH ==========
  // Ne pas bloquer les routes publiques
  if (isPublicRoute(pathname)) {
    return response;
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

  // Token valide → continuer avec les headers de sécurité
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

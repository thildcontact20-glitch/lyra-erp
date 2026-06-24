import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string | null;
  emailVerified: boolean;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Vérifier d'abord le cookie httpOnly
  const cookieToken = request.cookies.get('token')?.value;
  if (cookieToken) return cookieToken;

  // Fallback sur le header Authorization
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; companyId?: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, companyId: true, emailVerified: true },
    });

    if (!user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<{ user: AuthUser; error: null } | { user: null; error: Response }> {
  const user = await getAuthUser(request);
  if (!user) {
    return {
      user: null,
      error: new Response(JSON.stringify({ error: 'Non authentifié' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
  return { user, error: null };
}

export function signToken(payload: { userId: string; email: string; companyId?: string | null }): string {
  return jwt.sign(
    { userId: payload.userId, email: payload.email, companyId: payload.companyId },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // MODE VENTE: créer un compte automatiquement
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          id: 'u-' + Date.now(),
          email,
          password: hashedPassword,
          name: email.split('@')[0] || 'Client',
          role: 'USER',
          emailVerified: true,
        },
      });
    } else {
      // VÉRIFIER le mot de passe pour les comptes existants
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
      }

      // VÉRIFIER si l'email a été vérifié
      if (!user.emailVerified) {
        return NextResponse.json({
          error: 'EMAIL_NOT_VERIFIED',
          email: user.email,
          message: 'Veuillez vérifier votre email avant de vous connecter'
        }, { status: 403 });
      }
    }

    // VÉRIFIER que l'abonnement de l'entreprise n'est pas suspendu ou expiré
    if (user.companyId) {
      const blockSub = await prisma.subscription.findFirst({
        where: {
          companyId: user.companyId,
          status: { in: ['suspended', 'expired'] },
        },
        select: { id: true },
      });
      if (blockSub) {
        return NextResponse.json({
          error: 'SUBSCRIPTION_BLOCKED',
          message: 'Votre abonnement est suspendu ou expiré. Veuillez contacter l\'administrateur.'
        }, { status: 403 });
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name?.trim(), role: user.role, companyId: user.companyId }
    });
    response.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    return response;
  } catch (error) {
    const msg = (error as Error).message;
    console.error('Login error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

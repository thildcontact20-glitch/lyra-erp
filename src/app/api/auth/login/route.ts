import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026';

async function queryDB(sql: string, params?: any[]) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } finally {
    await pool.end();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const users = await queryDB('SELECT * FROM "User" WHERE email = $1', [email]);
    let user;

    if (!users || users.length === 0) {
      // MODE VENTE: créer un compte automatiquement
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUsers = await queryDB(
        'INSERT INTO "User" (id, email, password, name, "companyId", role, "emailVerified", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) RETURNING *',
        ['u-' + Date.now(), email, hashedPassword, email.split('@')[0] || 'Client', null, 'USER', true]
      );
      user = newUsers[0];
    } else {
      user = users[0];
      // VÉRIFIER le mot de passe pour les comptes existants
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
      }

      // VÉRIFIER si l'email a été vérifié
      if (!user.emailVerified) {
        // En mode vente, les nouveaux comptes sont créés avec emailVerified=true
        // Si on a un user existant avec emailVerified=false, il vient du signup
        return NextResponse.json({
          error: 'EMAIL_NOT_VERIFIED',
          email: user.email,
          message: 'Veuillez vérifier votre email avant de vous connecter'
        }, { status: 403 });
      }
    }

    // VÉRIFIER que l'abonnement de l'entreprise n'est pas suspendu ou expiré
    if (user.companyId) {
      const subs = await queryDB(
        'SELECT status FROM "Subscription" WHERE companyid = $1 AND (status = $2 OR status = $3) LIMIT 1',
        [user.companyId, 'suspended', 'expired']
      )
      if (subs && subs.length > 0) {
        return NextResponse.json({
          error: 'SUBSCRIPTION_BLOCKED',
          message: 'Votre abonnement est suspendu ou expiré. Veuillez contacter l\'administrateur.'
        }, { status: 403 })
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

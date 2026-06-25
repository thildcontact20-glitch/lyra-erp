import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

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
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    const userName = name || email.split('@')[0] || 'Client';

    // Vérifier si l'utilisateur existe déjà
    const existing = await queryDB('SELECT * FROM "User" WHERE email = $1', [email]);
    
    if (existing.length > 0) {
      // Mode vente: si l'utilisateur existe déjà, on ne crée pas de doublon
      // mais on renvoie une erreur pour qu'il aille sur /login
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet email. Connectez-vous.' },
        { status: 409 }
      );
    }

    // Hasher le vrai mot de passe de l'utilisateur
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'u-' + Date.now();

    // Générer un code de vérification à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const exp = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // +1h

    // Créer l'utilisateur avec emailVerified: false + verifyToken
    await queryDB(
      'INSERT INTO "User" (id, email, password, name, role, "emailVerified", "verifyToken", "verifyTokenExp", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())',
      [userId, email, hashedPassword, userName, 'USER', false, code, exp]
    );

    // NE PAS connecter automatiquement — renvoyer vers /verify-email
    // Envoyer l'email de vérification
    await sendVerificationEmail(email, code)

    // En développement, on inclut dev_code pour faciliter le test
    const isDev = process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      success: true,
      email,
      message: 'Code de vérification envoyé',
      ...(isDev ? { dev_code: code } : {}),
    });
  } catch (error) {
    const msg = (error as Error).message;
    console.error('Signup error:', msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

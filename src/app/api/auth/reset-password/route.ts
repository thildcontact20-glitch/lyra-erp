import { NextRequest, NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');

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
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, code et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur avec ce code
    const users = await queryDB(
      'SELECT * FROM "User" WHERE email = $1 AND "verifyToken" = $2',
      [email, code]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Code invalide ou expiré' },
        { status: 400 }
      );
    }

    const user = users[0];

    // Vérifier que le code n'est pas expiré
    const now = new Date();
    const exp = new Date(user.verifyTokenExp);
    if (now > exp) {
      return NextResponse.json(
        { error: 'Code expiré. Veuillez demander un nouveau code.' },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe et effacer le token
    await queryDB(
      'UPDATE "User" SET password = $1, "verifyToken" = NULL, "verifyTokenExp" = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    });
  } catch (error) {
    const msg = (error as Error).message;
    console.error('Reset password error:', msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email'

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
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur avec ce code de vérification
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
        { error: 'Code expiré. Demandez un nouveau code.' },
        { status: 400 }
      );
    }

    // Valider l'email : emailVerified=true, effacer le token
    await queryDB(
      'UPDATE "User" SET "emailVerified" = true, "verifyToken" = NULL, "verifyTokenExp" = NULL WHERE id = $1',
      [user.id]
    );

    // Envoyer l'email de bienvenue
    await sendWelcomeEmail(email, user.name || email.split('@')[0])

    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès',
    });
  } catch (error) {
    const msg = (error as Error).message;
    console.error('Verify email error:', msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

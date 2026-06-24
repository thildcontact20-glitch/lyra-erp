import { NextRequest, NextResponse } from 'next/server';
import { sendResetPasswordEmail } from '../../../../lib/email';

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

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const users = await queryDB('SELECT * FROM "User" WHERE email = $1', [email]);
    if (users.length === 0) {
      // Ne pas divulguer si l'email existe ou non, mais en dev on peut être plus permissif
      const isDev = process.env.NODE_ENV !== 'production';
      return NextResponse.json({
        success: true,
        message: 'Si un compte existe avec cet email, un code de réinitialisation a été envoyé.',
        ...(isDev ? { dev_code: null, note: 'Aucun compte trouvé avec cet email' } : {}),
      });
    }

    const user = users[0];

    // Générer un code à 6 chiffres + expiration 1h
    const code = generateCode();
    const exp = new Date(Date.now() + 60 * 60 * 1000);

    await queryDB(
      'UPDATE "User" SET "verifyToken" = $1, "verifyTokenExp" = $2 WHERE id = $3',
      [code, exp.toISOString(), user.id]
    );

    // Envoyer l'email (best-effort)
    await sendResetPasswordEmail(email, code);

    const isDev = process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      success: true,
      message: 'Email envoyé',
      ...(isDev ? { dev_code: code } : {}),
    });
  } catch (error) {
    const msg = (error as Error).message;
    console.error('Forgot password error:', msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

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
      return NextResponse.json(
        { error: 'Aucun compte trouvé avec cet email' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Si déjà vérifié, pas besoin de nouveau code
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Cet email est déjà vérifié' },
        { status: 400 }
      );
    }

    // Générer un nouveau code à 6 chiffres
    const code = generateCode();
    const exp = new Date(Date.now() + 60 * 60 * 1000); // +1h

    await queryDB(
      'UPDATE "User" SET "verifyToken" = $1, "verifyTokenExp" = $2 WHERE id = $3',
      [code, exp.toISOString(), user.id]
    );

    // En mode développement, on renvoie le code dans la réponse
    const isDev = process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      success: true,
      message: 'Nouveau code envoyé',
      ...(isDev ? { dev_code: code } : {}),
    });
  } catch (error) {
    const msg = (error as Error).message;
    console.error('Resend code error:', msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

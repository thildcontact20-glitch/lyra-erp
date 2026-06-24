import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-secret-2024';

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
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    // MODE VENTE: accepte toute connexion
    const users = await queryDB('SELECT * FROM "User" WHERE email = $1', [email]);
    let user;
    if (!users || users.length === 0) {
      // Créer un compte automatiquement avec un mot de passe simple
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newUsers = await queryDB(
        'INSERT INTO "User" (id, email, password, name, "companyId", role, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) RETURNING *',
        ['u-' + Date.now(), email, hashedPassword, email.split('@')[0] || 'Client', null, 'USER']
      );
      user = newUsers[0];
    } else {
      user = users[0];
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
    response.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax`);
    return response;
  } catch (error) {
    const msg = (error as Error).message;
    console.error('Login error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

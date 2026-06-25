import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026'

async function queryDB(sql: string, params?: any[]) {
  const { Pool } = require('pg')
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try {
    const result = await pool.query(sql, params)
    return result.rows
  } finally {
    await pool.end()
  }
}

export async function GET() {
  try {
    // Créer un compte entreprise premium
    const hash = bcrypt.hashSync('lyra2026', 10)
    const id = 'ua-enterprise-' + Date.now()

    // Supprimer l'ancien s'il existe
    await queryDB('DELETE FROM "User" WHERE email = $1', ['ceo@vivalys.ci'])

    // Créer le compte
    await queryDB(
      `INSERT INTO "User" (id, email, password, name, role, "companyId", "emailVerified", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())`,
      [id, 'ceo@vivalys.ci', hash, 'CEO Vivalys', 'ADMIN', null, true]
    )

    // Générer le token
    const token = jwt.sign(
      { userId: id, email: 'ceo@vivalys.ci', companyId: null },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    // Rediriger vers le dashboard avec cookie
    const response = NextResponse.redirect(new URL('/dashboard?plan=enterprise', new URL('https://lyra-erp.vercel.app')))
    response.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`)
    return response
  } catch (error) {
    const msg = (error as Error).message
    return new NextResponse(`Erreur: ${msg}`, { status: 500 })
  }
}

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

export async function GET(request: NextRequest) {
  try {
    const email = 'admin@lyra.ci'
    const users = await queryDB('SELECT * FROM "User" WHERE email = $1', [email])
    if (!users || users.length === 0) {
      return new NextResponse('Admin non trouvé', { status: 404 })
    }
    const user = users[0]
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Rediriger vers le dashboard avec le cookie
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)
    return response
  } catch (error) {
    const msg = (error as Error).message
    return new NextResponse(`Erreur: ${msg}`, { status: 500 })
  }
}

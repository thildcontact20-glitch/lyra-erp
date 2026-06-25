import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026'

function normalizeRow(row: any): any {
  if (!row) return row
  const out: any = {}
  for (const [k, v] of Object.entries(row)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v
  }
  return out
}

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

export async function PUT(request: NextRequest) {
  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const jwt = require('jsonwebtoken')
    const decoded: any = jwt.verify(token, JWT_SECRET)

    // Vérifier que l'utilisateur est ADMIN
    const users = await queryDB('SELECT id, email, role FROM "User" WHERE id = $1', [decoded.userId])
    if (!users || users.length === 0 || users[0].role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const { subscriptionId, status } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId requis' }, { status: 400 })
    }

    const validStatuses = ['pending_payment', 'paid', 'active', 'suspended']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Mettre à jour le statut dans la table Subscription
    const updated = await queryDB(
      `UPDATE "Subscription" SET status = $1, updatedat = NOW() WHERE id = $2 RETURNING *`,
      [status, subscriptionId]
    )

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Abonnement introuvable' }, { status: 404 })
    }

    const subscription = normalizeRow(updated[0])

    return NextResponse.json({ data: subscription })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur', details: String(e) }, { status: 500 })
  }
}

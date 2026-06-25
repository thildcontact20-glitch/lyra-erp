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

export async function GET(request: NextRequest) {
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

    // Récupérer toutes les subscriptions avec les infos company et plan
    const rows = await queryDB(`
      SELECT
        s.id,
        s.companyid,
        s.planid,
        s.status,
        s.paymentperiod,
        s.startdate,
        s.enddate,
        s.createdat,
        s.updatedat,
        c.id AS c_id,
        c.name AS c_name,
        c.email AS c_email,
        c."rcNumber" AS c_rcnumber,
        c."ciNumber" AS c_cinumber,
        c.phone AS c_phone,
        sp.id AS sp_id,
        sp.name AS sp_name,
        sp.code AS sp_code,
        sp.description AS sp_description,
        sp."priceMonthly" AS sp_pricemonthly,
        sp."priceYearly" AS sp_priceyearly,
        sp."maxUsers" AS sp_maxusers,
        sp."maxCompanies" AS sp_maxcompanies,
        sp.features AS sp_features
      FROM "Subscription" s
      JOIN "Company" c ON s.companyid = c.id
      JOIN "SubscriptionPlan" sp ON s.planid = sp.id
      ORDER BY s.createdat DESC
    `)

    const subscriptions = rows.map((row: any) => {
      const s = normalizeRow(row)
      return {
        id: s.id,
        companyId: s.companyid || s.companyId,
        planId: s.planid || s.planId,
        status: s.status,
        paymentPeriod: s.paymentperiod || s.paymentPeriod,
        startDate: s.startdate || s.startDate,
        endDate: s.enddate || s.endDate,
        createdAt: s.createdat || s.createdAt,
        updatedAt: s.updatedat || s.updatedAt,
        company: {
          id: s.c_id,
          name: s.c_name,
          email: s.c_email,
          rcNumber: s.c_rcnumber,
          ciNumber: s.c_cinumber,
          phone: s.c_phone,
        },
        plan: {
          id: s.sp_id,
          name: s.sp_name,
          code: s.sp_code,
          description: s.sp_description,
          priceMonthly: s.sp_pricemonthly,
          priceYearly: s.sp_priceyearly,
          maxUsers: s.sp_maxusers,
          maxCompanies: s.sp_maxcompanies,
          features: s.sp_features ? (() => {
            try { return JSON.parse(s.sp_features) } catch { return s.sp_features }
          })() : [],
        },
      }
    })

    return NextResponse.json({ data: subscriptions })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur', details: String(e) }, { status: 500 })
  }
}

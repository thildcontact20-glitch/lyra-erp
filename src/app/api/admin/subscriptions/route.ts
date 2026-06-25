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

/** Cherche une valeur de colonne par plusieurs noms possibles (casing) */
function val(row: any, ...keys: string[]) {
  for (const k of keys) {
    const v = row[k] ?? row[k.toLowerCase()] ?? row[k.toUpperCase()]
    if (v !== undefined && v !== null) return v
  }
  return null
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

    const users = await queryDB('SELECT id, email, role FROM "User" WHERE id = $1', [decoded.userId])
    if (!users || users.length === 0 || users[0].role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    // SELECT * pour éviter le problème de casing — on normalise en JS
    const rows = await queryDB(`
      SELECT s.*, 
             row_to_json(c.*) as company_json,
             row_to_json(sp.*) as plan_json
      FROM "Subscription" s
      JOIN "Company" c ON s.companyid = c.id
      JOIN "SubscriptionPlan" sp ON s.planid = sp.id
      ORDER BY s.createdat DESC
    `)

    const subscriptions = rows.map((row: any) => {
      const s = normalizeRow(row)
      const company = normalizeRow(s.company_json || {})
      const plan = normalizeRow(s.plan_json || {})

      let features: string[] = []
      const rawFeatures = val(plan, 'features')
      if (rawFeatures) {
        try { features = typeof rawFeatures === 'string' ? JSON.parse(rawFeatures) : rawFeatures }
        catch { features = [] }
      }

      return {
        id: val(s, 'id'),
        companyId: val(s, 'companyid', 'companyId'),
        planId: val(s, 'planid', 'planId'),
        status: val(s, 'status'),
        paymentPeriod: val(s, 'paymentperiod', 'paymentPeriod'),
        startDate: val(s, 'startdate', 'startDate'),
        endDate: val(s, 'enddate', 'endDate'),
        createdAt: val(s, 'createdat', 'createdAt'),
        updatedAt: val(s, 'updatedat', 'updatedAt'),
        company: {
          id: val(company, 'id'),
          name: val(company, 'name'),
          email: val(company, 'email'),
          phone: val(company, 'phone'),
        },
        plan: {
          id: val(plan, 'id'),
          name: val(plan, 'name'),
          code: val(plan, 'code'),
          description: val(plan, 'description'),
          priceMonthly: val(plan, 'pricemonthly', 'priceMonthly'),
          priceYearly: val(plan, 'priceyearly', 'priceYearly'),
          maxUsers: val(plan, 'maxusers', 'maxUsers'),
          maxCompanies: val(plan, 'maxcompanies', 'maxCompanies'),
          features,
        },
      }
    })

    return NextResponse.json({ data: subscriptions })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur', details: String(e) }, { status: 500 })
  }
}

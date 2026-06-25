import { NextRequest, NextResponse } from 'next/server'

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

/** Lit une valeur en essayant plusieurs variantes de casing */
function pick(row: any, ...keys: string[]) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null) return row[k]
  }
  return null
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

    // Récupérer Subscription + Company + Plan via SELECTs séparés pour éviter row_to_json
    const subs = await queryDB(`
      SELECT id, companyid, planid, status, paymentperiod, 
             startdate, enddate, createdat, updatedat
      FROM "Subscription"
      ORDER BY createdat DESC
    `)

    // Enrichir chaque subscription avec les infos company et plan
    const result = []
    for (const sub of subs) {
      let company: any = {}
      if (sub.companyid) {
        const companies = await queryDB('SELECT id, name, email, phone FROM "Company" WHERE id = $1', [sub.companyid])
        if (companies.length > 0) company = companies[0]
      }

      let plan: any = {}
      if (sub.planid) {
        const plans = await queryDB('SELECT * FROM "SubscriptionPlan" WHERE id = $1', [sub.planid])
        if (plans.length > 0) plan = plans[0]
      }

      let features: string[] = []
      const rawF = pick(plan, 'features')
      if (rawF) {
        try { features = typeof rawF === 'string' ? JSON.parse(rawF) : rawF }
        catch { features = [] }
      }

      result.push({
        id: sub.id,
        companyId: sub.companyid,
        planId: sub.planid,
        status: sub.status,
        paymentPeriod: sub.paymentperiod,
        startDate: sub.startdate,
        endDate: sub.enddate,
        company: {
          id: company.id,
          name: company.name,
          email: company.email,
          phone: company.phone,
        },
        plan: {
          id: plan.id,
          name: plan.name,
          code: plan.code,
          description: plan.description,
          priceMonthly: pick(plan, 'pricemonthly', 'priceMonthly'),
          priceYearly: pick(plan, 'priceyearly', 'priceYearly'),
          maxUsers: pick(plan, 'maxusers', 'maxUsers'),
          maxCompanies: pick(plan, 'maxcompanies', 'maxCompanies'),
          features,
        },
      })
    }

    return NextResponse.json({ data: result })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur', details: String(e) }, { status: 500 })
  }
}

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

function parseFeatures(val: any): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  try { return JSON.parse(val) } catch { return [] }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ data: null, defaultPlan: 'starter' })
  
  try {
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, JWT_SECRET)
    const companyId = decoded.companyId
    if (!companyId) return NextResponse.json({ data: null })
    
    const subscriptions = await queryDB(`
      SELECT s.*, sp.id as plan_id, sp.name as plan_name, sp.code as plan_code,
             sp.features as plan_features, sp.description as plan_description,
             sp.pricemonthly, sp.priceyearly, sp.maxusers, sp.maxcompanies
      FROM "Subscription" s
      JOIN "SubscriptionPlan" sp ON s.planid = sp.id
      WHERE s.companyid = $1
      LIMIT 1
    `, [companyId])
    
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ data: null, defaultPlan: 'starter' })
    }
    
    const sub = normalizeRow(subscriptions[0])
    
    return NextResponse.json({ 
      data: { 
        id: sub.id,
        companyId: sub.companyid || sub.companyId,
        planId: sub.planid || sub.planId,
        status: sub.status,
        paymentPeriod: sub.paymentperiod || sub.paymentPeriod,
        startDate: sub.startdate || sub.startDate,
        endDate: sub.enddate || sub.endDate,
        plan: {
          id: sub.plan_id,
          name: sub.plan_name,
          code: sub.plan_code,
          features: parseFeatures(sub.plan_features),
          description: sub.plan_description,
          priceMonthly: sub.pricemonthly,
          priceYearly: sub.priceyearly,
          maxUsers: sub.maxusers,
          maxCompanies: sub.maxcompanies,
        }
      } 
    })
  } catch {
    return NextResponse.json({ data: null })
  }
}

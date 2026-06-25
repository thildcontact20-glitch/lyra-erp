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

function parsePlanFeatures(plan: any) {
  if (!plan) return null
  let features: string[] = []
  if (typeof plan.features === 'string') {
    try { features = JSON.parse(plan.features) } catch { features = [] }
  } else if (Array.isArray(plan.features)) {
    features = plan.features
  }
  return { ...plan, features }
}

export async function GET(request: NextRequest) {
  // Extraire token du cookie
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
             sp."priceMonthly", sp."priceYearly", sp."maxUsers", sp."maxCompanies"
      FROM "Subscription" s
      JOIN "SubscriptionPlan" sp ON s."planId" = sp.id
      WHERE s."companyId" = $1
      LIMIT 1
    `, [companyId])
    
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ data: null, defaultPlan: 'starter' })
    }
    
    const sub = subscriptions[0]
    
    return NextResponse.json({ 
      data: { 
        id: sub.id,
        companyId: sub.companyId,
        planId: sub.planId,
        status: sub.status,
        paymentPeriod: sub.paymentPeriod,
        startDate: sub.startDate,
        endDate: sub.endDate,
        plan: {
          id: sub.plan_id,
          name: sub.plan_name,
          code: sub.plan_code,
          features: parsePlanFeatures({ features: sub.plan_features }),
          description: sub.plan_description,
          priceMonthly: sub.priceMonthly,
          priceYearly: sub.priceYearly,
          maxUsers: sub.maxUsers,
          maxCompanies: sub.maxCompanies,
        }
      } 
    })
  } catch {
    return NextResponse.json({ data: null })
  }
}

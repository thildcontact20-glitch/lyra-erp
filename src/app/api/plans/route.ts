import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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
    const plans = await queryDB(
      'SELECT * FROM "SubscriptionPlan" WHERE isActive = true ORDER BY "priceMonthly" ASC'
    )
    // Parse les features JSON pour chaque plan
    const parsed = plans.map((p: any) => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
    }))
    return NextResponse.json({ data: parsed })
  } catch (error: any) {
    console.error('Plans GET error:', error?.message || error)
    return NextResponse.json({ data: [] })
  }
}

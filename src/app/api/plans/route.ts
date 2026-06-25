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
      'SELECT * FROM "SubscriptionPlan" WHERE "isActive" = true ORDER BY "priceMonthly" ASC'
    )
    // Parse les features JSON pour chaque plan
    const parsed = plans.map((p: any) => {
      // Normaliser les clés (certaines peuvent être en camelCase, d'autres en minuscules)
      const normalized: any = {}
      for (const [k, v] of Object.entries(p)) {
        const camelKey = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
        normalized[camelKey] = v
      }
      return {
        ...normalized,
        features: typeof normalized.features === 'string' ? JSON.parse(normalized.features) : normalized.features,
      }
    })
    return NextResponse.json({ data: parsed, debug: plans.length + ' plans found' })
  } catch (error: any) {
    console.error('Plans GET error:', error?.message || error)
    return NextResponse.json({ data: [], error: error?.message || String(error) })
  }
}

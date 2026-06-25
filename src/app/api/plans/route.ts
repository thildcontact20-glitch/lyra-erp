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

/** Normalise les clés DB (toujours en minuscules avec pooler Supabase) en camelCase */
function normalizeRow(row: any): any {
  if (!row) return row
  const out: any = {}
  for (const [k, v] of Object.entries(row)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v
  }
  return out
}

export async function GET() {
  try {
    // Forcer une requête qui fonctionne quel que soit le casing
    // en listant les colonnes explicitement avec information_schema
    const plans = await queryDB(`SELECT * FROM "SubscriptionPlan"`)
    
    // Filtrer isActive=true en JS (pas en SQL pour éviter le problème de casing)
    const parsed = plans
      .filter((p: any) => {
        const isActive = p.isactive ?? p.isActive ?? p.is_active ?? true
        return isActive === true || isActive === 'true' || isActive === 1 || isActive === '1'
      })
      .sort((a: any, b: any) => {
        const pa = parseFloat(a.pricemonthly ?? a.priceMonthly ?? 0)
        const pb = parseFloat(b.pricemonthly ?? b.priceMonthly ?? 0)
        return pa - pb
      })
      .map((p: any) => {
        const n = normalizeRow(p)
        return {
          ...n,
          features: typeof n.features === 'string' ? JSON.parse(n.features) : (n.features || []),
        }
      })
    
    return NextResponse.json({ data: parsed })
  } catch (error: any) {
    console.error('Plans GET error:', error?.message || error)
    return NextResponse.json({ data: [], error: error?.message || String(error) })
  }
}

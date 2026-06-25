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

export async function POST(request: NextRequest) {
  // Vérifier admin
  const token = request.cookies.get('token')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  
  try {
    const jwt = require('jsonwebtoken')
    const decoded: any = jwt.verify(token, JWT_SECRET)
    
    const users = await queryDB('SELECT id, email, role FROM "User" WHERE id = $1', [decoded.userId])
    if (!users || users.length === 0 || users[0].role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }
    
    const { companyId, planCode, paymentPeriod, companyName, companyEmail } = await request.json()
    
    // Trouver le plan
    const plans = await queryDB('SELECT id, name, code, features FROM "SubscriptionPlan" WHERE code = $1', [planCode])
    if (!plans || plans.length === 0) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    const plan = plans[0]
    
    // Si création d'une nouvelle société
    let targetCompanyId = companyId
    if (!companyId || companyId === 'new') {
      if (!companyName) return NextResponse.json({ error: 'Nom de société requis' }, { status: 400 })
      const newCompanies = await queryDB(
        'INSERT INTO "Company" (id, name, email) VALUES ($1, $2, $3) RETURNING id',
        ['c-' + Date.now(), companyName, companyEmail || '']
      )
      targetCompanyId = newCompanies[0].id
    }
    
    // Créer ou mettre à jour l'abonnement
    const endDate = paymentPeriod === 'yearly' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    
    const subscriptions = await queryDB(`
      INSERT INTO "Subscription" (id, "companyId", "planId", status, "paymentPeriod", "endDate")
      VALUES ($1, $2, $3, 'active', $4, $5)
      ON CONFLICT ("companyId") DO UPDATE SET
        "planId" = $3, status = 'active', "paymentPeriod" = $4, "endDate" = $5
      RETURNING *
    `, ['sub-' + Date.now(), targetCompanyId, plan.id, paymentPeriod || 'monthly', endDate])
    
    const subscription = subscriptions[0]
    
    return NextResponse.json({ 
      data: { 
        ...subscription, 
        plan: { name: plan.name, code: plan.code, features: JSON.parse(plan.features || '[]') } 
      } 
    })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur', details: String(e) }, { status: 500 })
  }
}

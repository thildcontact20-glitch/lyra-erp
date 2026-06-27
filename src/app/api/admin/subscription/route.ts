import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSubscriptionActivatedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  
  try {
    const jwt = require('jsonwebtoken')
    const decoded: any = jwt.verify(token, JWT_SECRET)
    
    const users = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    })
    if (!users || users.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }
    
    const { companyId, planCode, paymentPeriod, companyName, companyEmail } = await request.json()
    
    // Trouver le plan
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { code: { equals: planCode, mode: 'insensitive' } },
    })
    if (!plan) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    
    let targetCompanyId = companyId
    if (!companyId || companyId === 'new') {
      if (!companyName) return NextResponse.json({ error: 'Nom de société requis' }, { status: 400 })
      const newCompany = await prisma.company.create({
        data: {
          id: 'c-' + Date.now(),
          name: companyName,
          email: companyEmail || '',
        },
      })
      targetCompanyId = newCompany.id
    }
    
    const endDate = paymentPeriod === 'yearly' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    
    // Upsert subscription via Prisma
    const subscription = await prisma.subscription.upsert({
      where: { companyId: targetCompanyId },
      create: {
        id: 'sub-' + Date.now(),
        companyId: targetCompanyId,
        planId: plan.id,
        status: 'active',
        paymentPeriod: paymentPeriod || 'monthly',
        endDate,
      },
      update: {
        planId: plan.id,
        status: 'active',
        paymentPeriod: paymentPeriod || 'monthly',
        endDate,
      },
    })

    // Envoyer l'email de confirmation d'activation d'abonnement
    const recipientEmail = companyEmail || users.email
    await sendSubscriptionActivatedEmail(recipientEmail, plan.name, companyName || 'Votre société')

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

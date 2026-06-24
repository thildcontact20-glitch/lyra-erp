import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Vérifier admin
  const token = request.cookies.get('token')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'lyra-secret-2024')
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }
    
    const { companyId, planCode, paymentPeriod, companyName, companyEmail } = await request.json()
    
    // Trouver le plan
    const plan = await prisma.subscriptionPlan.findUnique({ where: { code: planCode } })
    if (!plan) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    
    // Si création d'une nouvelle société
    let targetCompanyId = companyId
    if (!companyId || companyId === 'new') {
      if (!companyName) return NextResponse.json({ error: 'Nom de société requis' }, { status: 400 })
      const newCompany = await prisma.company.create({
        data: { name: companyName, email: companyEmail || '' }
      })
      targetCompanyId = newCompany.id
    }
    
    // Créer ou mettre à jour l'abonnement
    const subscription = await prisma.subscription.upsert({
      where: { companyId: targetCompanyId },
      update: {
        planId: plan.id,
        status: 'active',
        paymentPeriod: paymentPeriod || 'monthly',
        endDate: paymentPeriod === 'yearly' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) 
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      create: {
        companyId: targetCompanyId,
        planId: plan.id,
        status: 'active',
        paymentPeriod: paymentPeriod || 'monthly',
        endDate: paymentPeriod === 'yearly' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) 
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: { plan: true },
    })
    
    return NextResponse.json({ data: { ...subscription, plan: { ...subscription.plan, features: JSON.parse(subscription.plan.features) } } })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur', details: String(e) }, { status: 500 })
  }
}

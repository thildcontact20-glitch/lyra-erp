import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ data: null, defaultPlan: 'starter' })
  
  try {
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, JWT_SECRET)
    const companyId = decoded.companyId
    if (!companyId) return NextResponse.json({ data: null })
    
    const subscription = await prisma.subscription.findFirst({
      where: { companyId },
      include: {
        plan: true,
      },
    })
    
    if (!subscription) {
      return NextResponse.json({ data: null, defaultPlan: 'starter' })
    }
    
    let features: string[] = []
    if (subscription.plan.features) {
      try { features = typeof subscription.plan.features === 'string' ? JSON.parse(subscription.plan.features) : subscription.plan.features }
      catch { features = [] }
    }
    
    return NextResponse.json({ 
      data: { 
        id: subscription.id,
        companyId: subscription.companyId,
        planId: subscription.planId,
        status: subscription.status,
        paymentPeriod: subscription.paymentPeriod,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        plan: {
          id: subscription.plan.id,
          name: subscription.plan.name,
          code: subscription.plan.code,
          features,
          description: subscription.plan.description,
          priceMonthly: subscription.plan.priceMonthly,
          priceYearly: subscription.plan.priceYearly,
          maxUsers: subscription.plan.maxUsers,
          maxCompanies: subscription.plan.maxCompanies,
        }
      } 
    })
  } catch {
    return NextResponse.json({ data: null })
  }
}

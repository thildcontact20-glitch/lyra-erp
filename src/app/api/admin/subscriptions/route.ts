import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026'

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

    const users = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    })
    if (!users || users.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    // Récupérer les subscriptions avec company et plan via Prisma
    const subs = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: { id: true, name: true, email: true, phone: true },
        },
        plan: true,
      },
    })

    const result = subs.map((sub) => {
      let features: string[] = []
      if (sub.plan.features) {
        try { features = typeof sub.plan.features === 'string' ? JSON.parse(sub.plan.features) : sub.plan.features }
        catch { features = [] }
      }
      return {
        id: sub.id,
        companyId: sub.companyId,
        planId: sub.planId,
        status: sub.status,
        paymentPeriod: sub.paymentPeriod,
        startDate: sub.startDate,
        endDate: sub.endDate,
        company: {
          id: sub.company.id,
          name: sub.company.name,
          email: sub.company.email,
          phone: sub.company.phone,
        },
        plan: {
          id: sub.plan.id,
          name: sub.plan.name,
          code: sub.plan.code,
          description: sub.plan.description,
          priceMonthly: sub.plan.priceMonthly,
          priceYearly: sub.plan.priceYearly,
          maxUsers: sub.plan.maxUsers,
          maxCompanies: sub.plan.maxCompanies,
          features,
        },
      }
    })

    return NextResponse.json({ data: result })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur', details: String(e) }, { status: 500 })
  }
}

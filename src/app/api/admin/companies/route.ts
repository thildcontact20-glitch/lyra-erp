import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'lyra-secret-2024')
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé' }, { status: 403 })
    }
    
    const companies = await prisma.company.findMany({
      include: {
        subscription: { include: { plan: true } },
        _count: { select: { users: true } }
      },
      orderBy: { createdAt: 'desc' },
    })
    
    const data = companies.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      userCount: c._count.users,
      subscription: c.subscription ? {
        status: c.subscription.status,
        planName: c.subscription.plan.name,
        planCode: c.subscription.plan.code,
        paymentPeriod: c.subscription.paymentPeriod,
        endDate: c.subscription.endDate,
      } : null,
      createdAt: c.createdAt,
    }))
    
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

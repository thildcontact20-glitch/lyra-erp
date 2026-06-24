import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' },
  })
  // Parse les features JSON pour chaque plan
  const parsed = plans.map(p => ({ ...p, features: JSON.parse(p.features) }))
  return NextResponse.json({ data: parsed })
}

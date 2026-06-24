import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    })
    // Parse les features JSON pour chaque plan
    const parsed = plans.map(p => ({ ...p, features: JSON.parse(p.features) }))
    return NextResponse.json({ data: parsed })
  } catch (error) {
    console.error('Plans GET error:', error)
    return NextResponse.json({ data: [] })
  }
}

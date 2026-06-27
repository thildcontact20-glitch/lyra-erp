import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    })
    
    const parsed = plans.map((p) => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || []),
    }))
    
    return NextResponse.json({ data: parsed })
  } catch (error: any) {
    console.error('Plans GET error:', error?.message || error)
    return NextResponse.json({ data: [], error: error?.message || String(error) })
  }
}

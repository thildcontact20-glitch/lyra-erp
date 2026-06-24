import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getActiveSubscription } from '@/services/subscriptionsService'

export async function GET(request: NextRequest) {
  // Extraire token du cookie
  const token = request.cookies.get('token')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ data: null, defaultPlan: 'starter' })
  
  try {
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lyra-secret-2024')
    const companyId = decoded.companyId
    if (!companyId) return NextResponse.json({ data: null })
    
    const sub = await getActiveSubscription(companyId)
    if (!sub) return NextResponse.json({ data: null, defaultPlan: 'starter' })
    
    return NextResponse.json({ 
      data: { 
        ...sub, 
        plan: { ...sub.plan, features: JSON.parse(sub.plan.features) } 
      } 
    })
  } catch {
    return NextResponse.json({ data: null })
  }
}

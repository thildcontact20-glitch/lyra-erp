import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-prod-secret-vivalys-2026'

export async function PUT(request: NextRequest) {
  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const jwt = require('jsonwebtoken')
    const decoded: any = jwt.verify(token, JWT_SECRET)

    // Vérifier que l'utilisateur est ADMIN
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    })
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const { subscriptionId, status } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId requis' }, { status: 400 })
    }

    const validStatuses = ['pending_payment', 'paid', 'active', 'suspended']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Mettre à jour le statut via Prisma
    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status },
    })

    return NextResponse.json({ data: updated })
  } catch (e) {
    // Vérifier si l'erreur est due à un abonnement introuvable
    const errMsg = String(e)
    if (errMsg.includes('Record to update not found') || errMsg.includes('not found')) {
      return NextResponse.json({ error: 'Abonnement introuvable' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erreur serveur', details: errMsg }, { status: 500 })
  }
}

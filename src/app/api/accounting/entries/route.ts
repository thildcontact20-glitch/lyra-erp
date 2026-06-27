import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const entries = await prisma.entry.findMany({
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      take: 50,
      include: {
        lines: true,
      },
    })

    return NextResponse.json({ data: entries })
  } catch (error) {
    console.error('Entries GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { journalId, date, reference, label, lines } = await request.json()

    if (!journalId || !date || !lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { error: 'journalId, date, and at least one line are required' },
        { status: 400 }
      )
    }

    const ref = reference || `EC-${Date.now()}`
    const lbl = label || ''
    const entryDate = new Date(date)

    // Create entry with lines in a transaction
    const entry = await prisma.entry.create({
      data: {
        id: `e-${Date.now()}`,
        journalId,
        date: entryDate,
        reference: ref,
        label: lbl,
        lines: {
          create: lines.map((line: any) => ({
            id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            accountId: line.accountId,
            accountCode: line.accountCode,
            accountLabel: line.accountLabel || '',
            debit: line.debit || 0,
            credit: line.credit || 0,
          })),
        },
      },
      include: {
        lines: true,
      },
    })

    return NextResponse.json({ data: entry }, { status: 201 })
  } catch (error) {
    console.error('Entries POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

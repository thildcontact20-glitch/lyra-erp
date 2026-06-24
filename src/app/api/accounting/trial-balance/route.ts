import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const entries = await prisma.entry.findMany({
      take: 100,
      orderBy: { date: 'desc' },
      include: {
        lines: {
          orderBy: { accountCode: 'asc' },
        },
      },
    });

    const trialBalance = entries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      reference: entry.reference,
      label: entry.label,
      lines: entry.lines.map((line) => ({
        accountCode: line.accountCode,
        accountLabel: line.accountLabel,
        debit: line.debit,
        credit: line.credit,
      })),
      totalDebit: entry.lines.reduce((sum, l) => sum + l.debit, 0),
      totalCredit: entry.lines.reduce((sum, l) => sum + l.credit, 0),
    }));

    return NextResponse.json({ data: trialBalance });
  } catch (error) {
    console.error('Trial balance GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

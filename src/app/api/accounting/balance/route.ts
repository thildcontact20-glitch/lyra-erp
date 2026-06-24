import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const lines = await prisma.entryLine.groupBy({
      by: ['accountCode'],
      _sum: {
        debit: true,
        credit: true,
      },
      orderBy: { accountCode: 'asc' },
    });

    const balance = lines.map((line) => ({
      accountCode: line.accountCode,
      totalDebit: line._sum.debit || 0,
      totalCredit: line._sum.credit || 0,
      balance: (line._sum.debit || 0) - (line._sum.credit || 0),
    }));

    return NextResponse.json({ data: balance });
  } catch (error) {
    console.error('Balance GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

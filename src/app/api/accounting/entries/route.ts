import prisma from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const entries = await prisma.entry.findMany({
      take: 50,
      orderBy: { date: 'desc' },
      include: { lines: true },
    });

    return NextResponse.json({ data: entries });
  } catch (error) {
    console.error('Entries GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { journalId, date, reference, label, lines } = await request.json();

    if (!journalId || !date || !lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { error: 'journalId, date, and at least one line are required' },
        { status: 400 }
      );
    }

    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.entry.create({
        data: {
          journalId,
          date: new Date(date),
          reference: reference || `EC-${Date.now()}`,
          label: label || '',
          lines: {
            create: lines.map((line: { accountId: string; accountCode: string; accountLabel: string; debit: number; credit: number }) => ({
              accountId: line.accountId,
              accountCode: line.accountCode,
              accountLabel: line.accountLabel || '',
              debit: line.debit || 0,
              credit: line.credit || 0,
            })),
          },
        },
        include: { lines: true },
      });
      return created;
    });

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    console.error('Entries POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

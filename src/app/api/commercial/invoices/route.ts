import prisma from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const invoices = await prisma.invoice.findMany({
      take: 50,
      orderBy: { date: 'desc' },
      include: {
        customer: true,
        lines: true,
      },
    });

    return NextResponse.json({ data: invoices });
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyId, customerId, date, dueDate, number, lines } = await request.json();

    if (!companyId || !customerId || !lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { error: 'companyId, customerId, and at least one line are required' },
        { status: 400 }
      );
    }

    let totalHT = 0;
    let totalTVA = 0;

    const lineData = lines.map(
      (line: { itemId?: string; label: string; quantity: number; unitPrice: number; tvaRate?: number }) => {
        const lineHT = line.quantity * line.unitPrice;
        const tvaRate = line.tvaRate || 18;
        const lineTVA = lineHT * (tvaRate / 100);
        totalHT += lineHT;
        totalTVA += lineTVA;
        return {
          itemId: line.itemId || null,
          label: line.label || '',
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          tvaRate,
          totalHT: lineHT,
        };
      }
    );

    const totalTTC = totalHT + totalTVA;

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          companyId,
          customerId,
          date: date ? new Date(date) : new Date(),
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          number: number || `INV-${Date.now()}`,
          totalHT,
          totalTVA,
          totalTTC,
          status: 'DRAFT',
          lines: {
            create: lineData,
          },
        },
        include: {
          customer: true,
          lines: true,
        },
      });
      return created;
    });

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error) {
    console.error('Invoices POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

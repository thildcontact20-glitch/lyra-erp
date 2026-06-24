import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const declarations = await prisma.taxDeclaration.findMany({
      take: 50,
      orderBy: { period: 'desc' },
    });

    return NextResponse.json({ data: declarations });
  } catch (error) {
    console.error('Tax declarations GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyId, period } = await request.json();

    if (!companyId || !period) {
      return NextResponse.json(
        { error: 'companyId and period are required (e.g. 2024-01)' },
        { status: 400 }
      );
    }

    // Calculate VAT from invoice data for the period
    const periodStart = new Date(`${period}-01`);
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const invoices = await prisma.invoice.findMany({
      where: {
        companyId,
        date: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
    });

    const totalCollected = invoices.reduce((sum, inv) => sum + inv.totalTVA, 0);
    const totalDeductible = 0; // In a full implementation, would sum purchase-side TVA
    const netDue = totalCollected - totalDeductible;

    const declaration = await prisma.taxDeclaration.create({
      data: {
        companyId,
        period,
        totalCollected,
        totalDeductible,
        netDue,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ data: declaration }, { status: 201 });
  } catch (error) {
    console.error('Tax declarations POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

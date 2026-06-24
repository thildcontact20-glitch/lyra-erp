import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const items = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error('Items GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyId, code, label, unit, price, stock, warehouseId } = await request.json();

    if (!companyId || !code || !label) {
      return NextResponse.json(
        { error: 'companyId, code, and label are required' },
        { status: 400 }
      );
    }

    const item = await prisma.item.create({
      data: {
        companyId,
        code,
        label,
        unit: unit || 'U',
        price: price || 0,
        stock: stock || 0,
        warehouseId: warehouseId || null,
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    console.error('Items POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

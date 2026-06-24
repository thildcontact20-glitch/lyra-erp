import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { label: 'asc' },
    });

    return NextResponse.json({ data: warehouses });
  } catch (error) {
    console.error('Warehouses GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

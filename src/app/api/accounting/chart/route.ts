import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const accounts = await prisma.chartAccount.findMany({
      orderBy: { code: 'asc' },
    });

    return NextResponse.json({ data: accounts });
  } catch (error) {
    console.error('Chart GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

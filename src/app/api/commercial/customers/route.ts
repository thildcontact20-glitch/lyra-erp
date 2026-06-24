import prisma from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: customers });
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyId, name, contact, email, phone, address } = await request.json();

    if (!companyId || !name) {
      return NextResponse.json(
        { error: 'companyId and name are required' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        companyId,
        name,
        contact: contact || '',
        email: email || '',
        phone: phone || '',
        address: address || '',
      },
    });

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error) {
    console.error('Customers POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

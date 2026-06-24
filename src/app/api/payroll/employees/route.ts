import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { hireDate: 'desc' },
    });

    return NextResponse.json({ data: employees });
  } catch (error) {
    console.error('Employees GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyId, firstName, lastName, email, phone, position, baseSalary, hireDate, contractType } = await request.json();

    if (!companyId || !firstName || !lastName || !baseSalary) {
      return NextResponse.json(
        { error: 'companyId, firstName, lastName, and baseSalary are required' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        companyId,
        firstName,
        lastName,
        email: email || '',
        phone: phone || '',
        position: position || '',
        baseSalary,
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        contractType: contractType || 'CDI',
      },
    });

    return NextResponse.json({ data: employee }, { status: 201 });
  } catch (error) {
    console.error('Employees POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

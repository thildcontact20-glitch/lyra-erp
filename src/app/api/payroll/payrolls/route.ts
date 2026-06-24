import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const payrolls = await prisma.payroll.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { employee: true },
    });

    return NextResponse.json({ data: payrolls });
  } catch (error) {
    console.error('Payrolls GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { employeeId, period, baseSalary, bonuses, indemnities } = await request.json();

    if (!employeeId || !period || !baseSalary) {
      return NextResponse.json(
        { error: 'employeeId, period, and baseSalary are required' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const totalBonuses = bonuses || 0;
    const totalIndemnities = indemnities || 0;
    const grossSalary = baseSalary + totalBonuses + totalIndemnities;

    // Cotisation CNPS (7.2% part employé, 19.1% part employeur)
    const cnpsEmployee = grossSalary * 0.072;
    const cnpsEmployer = grossSalary * 0.191;

    // IR progressive simplifié
    const taxable = grossSalary - cnpsEmployee;
    let irTax = 0;
    if (taxable > 1000000) {
      irTax = taxable * 0.30;
    } else if (taxable > 600000) {
      irTax = taxable * 0.20;
    } else if (taxable > 300000) {
      irTax = taxable * 0.10;
    }

    const netSalary = taxable - irTax;

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        period,
        baseSalary,
        bonuses: totalBonuses,
        indemnities: totalIndemnities,
        grossSalary,
        cnpsEmployee,
        cnpsEmployer,
        irTax,
        netSalary,
        status: 'DRAFT',
      },
      include: { employee: true },
    });

    return NextResponse.json({ data: payroll }, { status: 201 });
  } catch (error) {
    console.error('Payrolls POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const movements = await prisma.stockMovement.findMany({
      take: 50,
      orderBy: { date: 'desc' },
      include: {
        warehouse: true,
      },
    });

    return NextResponse.json({ data: movements });
  } catch (error) {
    console.error('Stock movements GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { warehouseId, itemId, type, quantity, date, note } = await request.json();

    if (!warehouseId || !itemId || !type || !quantity) {
      return NextResponse.json(
        { error: 'warehouseId, itemId, type, and quantity are required' },
        { status: 400 }
      );
    }

    if (!['IN', 'OUT', 'TRANSFER'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be IN, OUT, or TRANSFER' },
        { status: 400 }
      );
    }

    const movement = await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item) {
        throw new Error('Item not found');
      }

      let quantityChange = 0;
      if (type === 'IN') quantityChange = quantity;
      else if (type === 'OUT') quantityChange = -quantity;
      // TRANSFER doesn't change overall stock

      const newStock = item.stock + quantityChange;
      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      if (type !== 'TRANSFER') {
        await tx.item.update({
          where: { id: itemId },
          data: { stock: newStock },
        });
      }

      const created = await tx.stockMovement.create({
        data: {
          warehouseId,
          itemId,
          type,
          quantity,
          date: date ? new Date(date) : new Date(),
          note: note || null,
        },
        include: { warehouse: true },
      });

      return created;
    });

    return NextResponse.json({ data: movement }, { status: 201 });
  } catch (error) {
    console.error('Stock movements POST error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: message === 'Insufficient stock' || message === 'Item not found' ? 400 : 500 }
    );
  }
}

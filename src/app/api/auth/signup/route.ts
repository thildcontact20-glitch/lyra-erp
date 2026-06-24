import prisma from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-secret-2024';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, companyName } = await request.json();

    if (!email || !password || !name || !companyName) {
      return NextResponse.json(
        { error: 'Email, password, name, and companyName are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          email,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          companyId: company.id,
        },
      });

      return { user, company };
    });

    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email, companyId: result.user.companyId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        companyId: result.user.companyId,
      },
    });

    response.headers.set(
      'Set-Cookie',
      `token=${token}; Path=/; HttpOnly; SameSite=Lax`
    );

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

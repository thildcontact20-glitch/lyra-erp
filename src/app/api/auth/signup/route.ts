import prisma from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'lyra-secret-2024';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const userName = name || email.split('@')[0] || 'Client';

    // MODE VENTE: création instantanée
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: userName,
        role: 'USER',
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
    });

    response.headers.set(
      'Set-Cookie',
      `token=${token}; Path=/; HttpOnly; SameSite=Lax`
    );

    return response;
  } catch (error) {
    const msg = (error as Error).message;
    console.error('Signup error:', msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { Prisma, Role } from '@/lib/generated/prisma/client';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid registration details' },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.USER,
        subscription: {
          create: { planType: 'FREE', isActive: true },
        },
        usage: {
          create: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            validationCount: 0,
          },
        },
      },
      // Never read the password hash back out of the database.
      omit: { password: true },
      include: { subscription: true },
    });

    return NextResponse.json(
      { message: 'User created successfully', user },
      { status: 201 },
    );
  } catch (error) {
    // P2002: unique constraint violation on email.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'An account with that email already exists' },
        { status: 409 },
      );
    }

    console.error('Registration failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}

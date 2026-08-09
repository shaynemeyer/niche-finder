import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { createUser } from '@/lib/data/users';
import { Prisma } from '@/lib/generated/prisma/client';
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

    const user = await createUser(name, email, hashedPassword);

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

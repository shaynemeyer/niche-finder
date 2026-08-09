import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { auth } from '@/lib/auth';
import { getUserPasswordHash, updateUserPassword } from '@/lib/data/users';
import { updatePasswordSchema } from '@/lib/validations/profile';

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updatePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid password details' },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    const user = await getUserPasswordHash(session.user.id);

    // Null password means an OAuth-only account with nothing to compare against.
    if (!user?.password) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 },
      );
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await updateUserPassword(session.user.id, hashedPassword);

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password update failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { deleteUser, updateUserPlan, updateUserRole } from '@/lib/data/users';
import { Prisma, Role } from '@/lib/generated/prisma/client';
import { updateAdminUserSchema } from '@/lib/validations/user';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = updateAdminUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { id: userId } = await params;

  if ('role' in parsed.data) {
    // Demoting yourself here would lock you out of the panel that just did
    // it, with no other admin session left to undo it.
    if (userId === session.user.id && parsed.data.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 },
      );
    }

    try {
      const user = await updateUserRole(userId, parsed.data.role);
      return NextResponse.json({ message: 'Role updated successfully', user });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 },
        );
      }

      console.error('Failed to update user role:', error);
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 },
      );
    }
  }

  try {
    const subscription = await updateUserPlan(userId, parsed.data.planType);
    return NextResponse.json({
      message: 'Plan updated successfully',
      subscription,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      );
    }

    console.error('Failed to update user plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 },
    );
  }

  const { id: userId } = await params;

  // Deleting your own account here would lock you out of the panel that
  // just did it, with no one left to undo it.
  if (userId === session.user.id) {
    return NextResponse.json(
      { error: 'Cannot delete your own account' },
      { status: 400 },
    );
  }

  try {
    await deleteUser(userId);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 },
    );
  }
}

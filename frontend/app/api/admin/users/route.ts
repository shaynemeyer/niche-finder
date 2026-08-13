import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { listAdminUsers } from '@/lib/data/users';
import { Role } from '@/lib/generated/prisma/client';

export async function GET() {
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

  try {
    const users = await listAdminUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Failed to load admin users:', error);
    return NextResponse.json(
      { error: 'Failed to load users' },
      { status: 500 },
    );
  }
}

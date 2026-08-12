import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAdminAnalytics } from '@/lib/data/admin';
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
    const analytics = await getAdminAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Failed to load admin analytics:', error);
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 },
    );
  }
}

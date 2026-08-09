import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getUserProfile } from '@/lib/data/users';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserProfile(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

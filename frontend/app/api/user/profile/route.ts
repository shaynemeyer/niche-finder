import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getUserProfile, updateUserName } from '@/lib/data/users';
import { updateProfileSchema } from '@/lib/validations/profile';

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

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid profile details' }, {
      status: 400,
    });
  }

  try {
    const user = await updateUserName(session.user.id, parsed.data.name);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile update failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listAllPaymentRequests } from '@/lib/data/payments';
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
    const paymentRequests = await listAllPaymentRequests();
    return NextResponse.json({ paymentRequests });
  } catch (error) {
    console.error('Failed to load payment requests:', error);
    return NextResponse.json(
      { error: 'Failed to load payment requests' },
      { status: 500 },
    );
  }
}

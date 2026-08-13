import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import {
  approvePaymentRequest,
  rejectPaymentRequest,
} from '@/lib/data/payments';
import { Prisma, Role } from '@/lib/generated/prisma/client';
import { reviewPaymentRequestSchema } from '@/lib/validations/payment';

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

  const body = await request.json();
  const parsed = reviewPaymentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 },
    );
  }

  const { id } = await params;

  if (parsed.data.action === 'approve') {
    try {
      const paymentRequest = await approvePaymentRequest(id);
      return NextResponse.json({
        message: 'Payment request approved and subscription upgraded to Pro',
        paymentRequest,
      });
    } catch (error) {
      // P2025: update matched no row, i.e. the request is not PENDING or does
      // not exist — either way there is nothing to approve.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return NextResponse.json(
          { error: 'Payment request not found or already reviewed' },
          { status: 404 },
        );
      }

      console.error('Failed to approve payment request:', error);
      return NextResponse.json(
        { error: 'Failed to approve payment request' },
        { status: 500 },
      );
    }
  }

  try {
    const paymentRequest = await rejectPaymentRequest({
      id,
      reason: parsed.data.reason,
    });
    return NextResponse.json({
      message: 'Payment request rejected',
      paymentRequest,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Payment request not found or already reviewed' },
        { status: 404 },
      );
    }

    console.error('Failed to reject payment request:', error);
    return NextResponse.json(
      { error: 'Failed to reject payment request' },
      { status: 500 },
    );
  }
}

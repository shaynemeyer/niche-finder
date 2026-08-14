import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { cancelSubscription, getSubscription } from '@/lib/data/users';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const subscription = await getSubscription(userId);
  if (!subscription) {
    return NextResponse.json(
      { error: 'No subscription found' },
      { status: 404 },
    );
  }

  if (subscription.planType === 'FREE') {
    return NextResponse.json(
      { error: 'You are already on the Free plan' },
      { status: 400 },
    );
  }

  try {
    const updatedSubscription = await cancelSubscription(userId);

    return NextResponse.json({
      message: 'Successfully downgraded to Free Plan',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Subscription cancel failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}

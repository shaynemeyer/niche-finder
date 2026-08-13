/**
 * Resets a test user back to a fresh FREE account: deletes their payment
 * requests and reports, clears usage logs, and puts their subscription back
 * to FREE/active with no end date — the same shape prisma/seed.ts creates.
 *
 * See scripts/README.md for usage.
 */
import 'dotenv/config';

import { prisma } from '../lib/prisma';

async function resetUser(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`No user found with email ${email}`);
  }

  await prisma.$transaction([
    prisma.paymentRequest.deleteMany({ where: { userId: user.id } }),
    prisma.report.deleteMany({ where: { userId: user.id } }),
    prisma.usageLog.deleteMany({ where: { userId: user.id } }),
    prisma.subscription.update({
      where: { userId: user.id },
      data: { planType: 'FREE', isActive: true, endDate: null },
    }),
  ]);

  console.log(`Reset ${email} to a fresh FREE account`);
}

const email = process.argv[2];

if (!email) {
  console.error('Usage: bun run reset-user <email>');
  process.exit(1);
}

resetUser(email)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

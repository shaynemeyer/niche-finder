/**
 * Data access for user accounts. See lib/data/reports.ts for why queries live
 * in this layer rather than in route handlers.
 */
import { prisma } from '@/lib/prisma';
import { Role } from '@/lib/generated/prisma/client';

/**
 * Creates a user with the FREE subscription and usage row that every account
 * needs, in one nested write rather than three sequential calls — a failure
 * partway through would otherwise leave an account without a plan.
 *
 * Throws P2002 when the email is taken; the caller maps that to a 409.
 */
export function createUser(
  name: string,
  email: string,
  hashedPassword: string,
  now: Date = new Date(),
) {
  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: Role.USER,
      subscription: {
        create: { planType: 'FREE', isActive: true },
      },
      usage: {
        create: {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          validationCount: 0,
        },
      },
    },
    // Never read the password hash back out of the database.
    omit: { password: true },
    include: { subscription: true },
  });
}

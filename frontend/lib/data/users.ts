/**
 * Data access for user accounts. See lib/data/reports.ts for why queries live
 * in this layer rather than in route handlers.
 */
import { prisma } from '@/lib/prisma';
import { PlanType, Role } from '@/lib/generated/prisma/client';

/** Every user with their subscription and report count, for the admin user list. */
export function listAdminUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      subscription: { select: { planType: true, isActive: true } },
      _count: { select: { reports: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Deletes a user. Child records (subscription, usage, reports, payment
 * requests) cascade per the schema. Throws P2025 if the id does not exist;
 * the caller maps that to a 404.
 */
export function deleteUser(userId: string) {
  return prisma.user.delete({ where: { id: userId } });
}

/** Changes a user's role from the admin panel. Throws P2025 if the id does not exist. */
export function updateUserRole(userId: string, role: Role) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, role: true },
  });
}

/**
 * Changes a user's plan from the admin panel. Throws P2025 if the user has
 * no subscription row — the caller only offers this when one exists.
 */
export function updateUserPlan(userId: string, planType: PlanType) {
  return prisma.subscription.update({
    where: { userId },
    data: { planType },
    select: { userId: true, planType: true },
  });
}

/** The caller's subscription, for checking plan type before a cancel/downgrade. */
export function getSubscription(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
    select: { planType: true, isActive: true, startDate: true },
  });
}

/** Downgrades the caller's subscription to FREE. Throws P2025 if no subscription row exists. */
export function cancelSubscription(userId: string) {
  return prisma.subscription.update({
    where: { userId },
    data: { planType: 'FREE', isActive: true, endDate: null },
    select: { planType: true, isActive: true, startDate: true },
  });
}

/** Profile fields for the account settings page. Never selects the password hash. */
export function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

/** Updates the caller's display name. Email and role are not editable here. */
export function updateUserName(userId: string, name: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

/** The caller's password hash, for verifying the current password before a change. Null for OAuth-only accounts. */
export function getUserPasswordHash(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
}

/** Overwrites the caller's password hash. */
export function updateUserPassword(userId: string, hashedPassword: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
    select: { id: true },
  });
}

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

/**
 * Data access for payment requests. See lib/data/reports.ts for why queries
 * live in this layer rather than in pages and route handlers.
 */
import { prisma } from '@/lib/prisma';
import { PaymentStatus, type PaymentRequest } from '@/lib/generated/prisma/client';

/**
 * True while the user has a bank transfer awaiting admin approval.
 *
 * Only PENDING counts: an approved request has already upgraded the account,
 * and a rejected one needs a different message than "awaiting approval".
 */
export async function hasPendingPayment(userId: string): Promise<boolean> {
  const pending = await prisma.paymentRequest.findFirst({
    where: { userId, status: PaymentStatus.PENDING },
    select: { id: true },
  });

  return pending !== null;
}

export type PendingPaymentRequest = Pick<PaymentRequest, 'id' | 'createdAt'>;

/**
 * The user's pending bank transfer, if any. A user has at most one at a
 * time — submitting while a request is pending is blocked elsewhere — so
 * this returns a single row rather than a list.
 */
export function getPendingPaymentRequest(
  userId: string,
): Promise<PendingPaymentRequest | null> {
  return prisma.paymentRequest.findFirst({
    where: { userId, status: PaymentStatus.PENDING },
    select: { id: true, createdAt: true },
  });
}

export type PaymentRequestListItem = Pick<
  PaymentRequest,
  'id' | 'transactionId' | 'status' | 'rejectedReason' | 'createdAt'
>;

/** A user's payment requests, most recent first. invoicePath is excluded — never rendered in a list. */
export function listPaymentRequests(
  userId: string,
): Promise<PaymentRequestListItem[]> {
  return prisma.paymentRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      transactionId: true,
      status: true,
      rejectedReason: true,
      createdAt: true,
    },
  });
}

/** Records a bank-transfer request awaiting admin approval. */
export function createPaymentRequest(
  userId: string,
  transactionId: string,
  invoicePath: string,
): Promise<Pick<PaymentRequest, 'id' | 'status' | 'createdAt'>> {
  return prisma.paymentRequest.create({
    data: { userId, transactionId, invoicePath },
    select: { id: true, status: true, createdAt: true },
  });
}

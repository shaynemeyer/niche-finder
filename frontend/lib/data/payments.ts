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

export type AdminPaymentRequestListItem = Pick<
  PaymentRequest,
  | 'id'
  | 'transactionId'
  | 'invoicePath'
  | 'payment'
  | 'status'
  | 'rejectedReason'
  | 'approvedAt'
  | 'createdAt'
> & {
  user: { id: string; name: string | null; email: string };
};

/**
 * Every payment request across all users, most recent first, with the
 * submitter's name and email. Unlike listPaymentRequests this includes
 * invoicePath — admins need it to link to the uploaded invoice.
 */
export function listAllPaymentRequests(): Promise<
  AdminPaymentRequestListItem[]
> {
  return prisma.paymentRequest.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      transactionId: true,
      invoicePath: true,
      payment: true,
      status: true,
      rejectedReason: true,
      approvedAt: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

/**
 * A payment request's stored invoice path, by id. Used only to resolve the
 * file to stream back — never render invoicePath itself to a client.
 */
export function getPaymentRequestInvoicePath(
  id: string,
): Promise<Pick<PaymentRequest, 'invoicePath'> | null> {
  return prisma.paymentRequest.findUnique({
    where: { id },
    select: { invoicePath: true },
  });
}

export type ApprovedPaymentRequest = Pick<
  PaymentRequest,
  'id' | 'status' | 'approvedAt'
>;

/**
 * Approves a pending payment request and upgrades the submitter's
 * subscription to PRO. Both writes happen in one transaction so a request
 * can never end up APPROVED without the upgrade actually applying.
 *
 * Scoped to PENDING via the update's where clause: an already-approved or
 * rejected request matches zero rows, so a stale click can't double-upgrade
 * or overwrite a rejection. Prisma throws P2025 in that case.
 */
export async function approvePaymentRequest(
  id: string,
): Promise<ApprovedPaymentRequest> {
  return prisma.$transaction(async (tx) => {
    const paymentRequest = await tx.paymentRequest.update({
      where: { id, status: PaymentStatus.PENDING },
      data: { status: PaymentStatus.APPROVED, approvedAt: new Date() },
      select: { id: true, status: true, approvedAt: true, userId: true },
    });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    await tx.subscription.update({
      where: { userId: paymentRequest.userId },
      data: { planType: 'PRO', isActive: true, startDate, endDate },
    });

    return paymentRequest;
  });
}

export type RejectedPaymentRequest = Pick<
  PaymentRequest,
  'id' | 'status' | 'rejectedReason'
>;

/**
 * Rejects a pending payment request with a reason.
 *
 * Scoped to PENDING via the update's where clause, same as
 * approvePaymentRequest: an already-reviewed request matches zero rows, so a
 * stale click can't overwrite an existing decision. Prisma throws P2025 in
 * that case.
 */
export function rejectPaymentRequest(options: {
  id: string;
  reason: string;
}): Promise<RejectedPaymentRequest> {
  const { id, reason } = options;
  return prisma.paymentRequest.update({
    where: { id, status: PaymentStatus.PENDING },
    data: { status: PaymentStatus.REJECTED, rejectedReason: reason },
    select: { id: true, status: true, rejectedReason: true },
  });
}

/** Records a bank-transfer request awaiting admin approval. */
export function createPaymentRequest(options: {
  userId: string;
  transactionId: string;
  invoicePath: string;
  payment: number;
}): Promise<Pick<PaymentRequest, 'id' | 'status' | 'createdAt'>> {
  const { userId, transactionId, invoicePath, payment } = options;
  return prisma.paymentRequest.create({
    data: { userId, transactionId, invoicePath, payment },
    select: { id: true, status: true, createdAt: true },
  });
}

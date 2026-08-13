import { z } from 'zod';

export const ALLOWED_INVOICE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];
export const MAX_INVOICE_SIZE = 5 * 1024 * 1024;

export const createPaymentRequestSchema = z.object({
  transactionId: z
    .string()
    .trim()
    .min(5, 'Transaction ID must be at least 5 characters')
    .max(255, 'Transaction ID must be at most 255 characters'),
});

export type CreatePaymentRequestValues = z.infer<
  typeof createPaymentRequestSchema
>;

export const reviewPaymentRequestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('approve') }),
  z.object({
    action: z.literal('reject'),
    reason: z
      .string()
      .trim()
      .min(1, 'A rejection reason is required')
      .max(1000, 'Rejection reason must be at most 1000 characters'),
  }),
]);

export type ReviewPaymentRequestValues = z.infer<
  typeof reviewPaymentRequestSchema
>;

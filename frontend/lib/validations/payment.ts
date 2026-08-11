import { z } from 'zod';

export const ALLOWED_INVOICE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
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

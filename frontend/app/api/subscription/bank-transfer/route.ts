import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { createPaymentRequest, hasPendingPayment } from '@/lib/data/payments';
import {
  ALLOWED_INVOICE_TYPES,
  createPaymentRequestSchema,
  MAX_INVOICE_SIZE,
} from '@/lib/validations/payment';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'invoices');

function extensionFor(mimeType: string) {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    default:
      return '.pdf';
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const invoice = formData.get('invoice');

  if (!(invoice instanceof File)) {
    return NextResponse.json(
      { error: 'Invoice file is required' },
      { status: 400 },
    );
  }

  if (!ALLOWED_INVOICE_TYPES.includes(invoice.type)) {
    return NextResponse.json(
      { error: 'Only JPG, PNG, WEBP, or PDF files are allowed' },
      { status: 400 },
    );
  }

  if (invoice.size > MAX_INVOICE_SIZE) {
    return NextResponse.json(
      { error: 'File size must be less than 5MB' },
      { status: 400 },
    );
  }

  const parsed = createPaymentRequestSchema.safeParse({
    transactionId: formData.get('transactionId'),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payment request details' },
      { status: 400 },
    );
  }

  try {
    // Only one bank transfer can be pending review at a time.
    if (await hasPendingPayment(session.user.id)) {
      return NextResponse.json(
        { error: 'You already have a payment request awaiting approval' },
        { status: 409 },
      );
    }

    const filename = `${randomUUID()}${extensionFor(invoice.type)}`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    const bytes = Buffer.from(await invoice.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), bytes);

    const paymentRequest = await createPaymentRequest({
      userId: session.user.id,
      transactionId: parsed.data.transactionId,
      invoicePath: path.join('invoices', filename),
      payment: 29,
    });

    return NextResponse.json(
      { message: 'Payment request submitted', paymentRequest },
      { status: 201 },
    );
  } catch (error) {
    console.error('Bank transfer submission failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}

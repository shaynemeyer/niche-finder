import { readFile } from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getPaymentRequestInvoicePath } from '@/lib/data/payments';
import { Role } from '@/lib/generated/prisma/client';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'invoices');

function contentTypeFor(filename: string) {
  switch (path.extname(filename).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/pdf';
  }
}

export async function GET(
  _request: Request,
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

  const { id } = await params;
  const paymentRequest = await getPaymentRequestInvoicePath(id);

  if (!paymentRequest) {
    return NextResponse.json(
      { error: 'Payment request not found' },
      { status: 404 },
    );
  }

  try {
    // invoicePath is stored as "invoices/<filename>"; UPLOAD_DIR already
    // ends in "invoices", so only the filename is joined on here.
    const filename = path.basename(paymentRequest.invoicePath);
    const bytes = await readFile(path.join(UPLOAD_DIR, filename));

    return new NextResponse(bytes, {
      headers: { 'Content-Type': contentTypeFor(filename) },
    });
  } catch (error) {
    console.error('Failed to read invoice file:', error);
    return NextResponse.json(
      { error: 'Failed to load invoice' },
      { status: 500 },
    );
  }
}

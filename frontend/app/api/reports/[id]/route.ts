import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { deleteReport } from '@/lib/data/reports';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // deleteReport scopes by userId, so a report belonging to someone else is
  // indistinguishable from one that does not exist — a guessed id reveals
  // nothing about whether it is real.
  const deleted = await deleteReport(id, session.user.id);

  if (!deleted) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  // No body: there is nothing left to describe.
  return new NextResponse(null, { status: 204 });
}

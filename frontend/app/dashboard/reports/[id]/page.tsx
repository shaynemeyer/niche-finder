import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { auth } from '@/lib/auth';
import { getReport } from '@/lib/data/reports';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';

export default async function ReportDetailPage(
  props: PageProps<'/dashboard/reports/[id]'>,
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/signin');
  }

  const { id } = await props.params;

  // getReport scopes by userId: a report id is guessable enough that finding
  // it by id alone would let anyone read another account's report.
  const report = await getReport(id, session.user.id);

  if (!report) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          {/* CardTitle renders a div; the report name is this page's heading,
              so render an h1 with the same styling. */}
          <h1 className="font-heading text-base leading-snug font-medium">
            {report.niche}
          </h1>
          <CardDescription>{report.keyword}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            Report ID: <span className="font-mono">{report.id}</span>
          </p>
          <p>Status: {report.status}</p>
          <p>The full report view is not built yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}

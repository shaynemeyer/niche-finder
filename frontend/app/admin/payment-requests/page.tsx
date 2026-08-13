import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { listAllPaymentRequests } from '@/lib/data/payments';
import { Toaster } from '@/components/ui/sonner';
import { PaymentRequestsList } from '@/components/admin/payment-requests/payment-requests-list';

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

async function PaymentRequestsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const paymentRequests = await listAllPaymentRequests();

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Payment Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage bank transfer payment requests from users
          </p>
        </div>

        {/* Payment Requests List */}
        <PaymentRequestsList
          paymentRequests={paymentRequests.map((request) => ({
            id: request.id,
            name: request.user.name ?? 'Unknown',
            email: request.user.email,
            status: request.status,
            transactionId: request.transactionId,
            createdAt: formatDate(request.createdAt),
            invoiceUrl: `/api/admin/payment-requests/${request.id}/invoice`,
            rejectedReason: request.rejectedReason,
            approvedOn: request.approvedAt
              ? formatDate(request.approvedAt)
              : null,
          }))}
        />
      </div>
    </>
  );
}

export default PaymentRequestsPage;

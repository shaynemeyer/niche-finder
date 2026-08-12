import { Toaster } from '@/components/ui/sonner';
import { EmptyPaymentRequests } from '@/components/admin/payment-requests/empty-payment-requests';
import { PaymentRequestCard } from '@/components/admin/payment-requests/payment-request-card';

// No admin-scoped payment request query exists yet; this stands in until
// one does.
const SAMPLE_REQUEST = {
  name: 'name',
  email: 'email',
  status: 'PENDING' as const,
  transactionId: 'transactionId',
  createdAt: 'createdAt',
  invoiceUrl: '',
};

function PaymentRequestsPage() {
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
        <div className="grid gap-4">
          <EmptyPaymentRequests />

          <PaymentRequestCard {...SAMPLE_REQUEST} />
        </div>

        {/* Reject Modal */}

        {/* <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Reject Payment Request
              </h3>
              <textarea
                value="rejectReason"

                placeholder="Enter reason for rejection..."
                className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 min-h-[100px]"
                required
              />
              <div className="flex gap-2 mt-4">
                <button


                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                Confirm Reject
                </button>
                <button


                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div> */}
      </div>
    </>
  );
}

export default PaymentRequestsPage;

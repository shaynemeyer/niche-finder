'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { PaymentStatus } from '@/lib/generated/prisma/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { EmptyPaymentRequests } from '@/components/admin/payment-requests/empty-payment-requests';
import { PaymentRequestCard } from '@/components/admin/payment-requests/payment-request-card';

type PaymentRequestListItem = {
  id: string;
  name: string;
  email: string;
  status: PaymentStatus;
  transactionId: string;
  createdAt: string;
  invoiceUrl: string;
  rejectedReason: string | null;
  approvedOn: string | null;
};

export function PaymentRequestsList({
  paymentRequests,
}: {
  paymentRequests: PaymentRequestListItem[];
}) {
  const router = useRouter();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  async function handleApprove(id: string) {
    setApprovingId(id);

    try {
      const response = await fetch(`/api/admin/payment-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      const body = await response.json();

      if (!response.ok) {
        toast.error(body.error ?? 'Failed to approve payment request');
        return;
      }

      toast.success(body.message);
      router.refresh();
    } catch (error) {
      console.error('Failed to approve payment request:', error);
      toast.error('Failed to approve payment request');
    } finally {
      setApprovingId(null);
    }
  }

  function openRejectDialog(id: string) {
    setRejectTargetId(id);
    setRejectReason('');
  }

  function closeRejectDialog() {
    setRejectTargetId(null);
    setRejectReason('');
  }

  async function handleReject() {
    const id = rejectTargetId;
    if (!id) return;

    const reason = rejectReason.trim();
    if (!reason) {
      toast.error('A rejection reason is required');
      return;
    }

    setRejectingId(id);

    try {
      const response = await fetch(`/api/admin/payment-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason }),
      });
      const body = await response.json();

      if (!response.ok) {
        toast.error(body.error ?? 'Failed to reject payment request');
        return;
      }

      toast.success(body.message);
      closeRejectDialog();
      router.refresh();
    } catch (error) {
      console.error('Failed to reject payment request:', error);
      toast.error('Failed to reject payment request');
    } finally {
      setRejectingId(null);
    }
  }

  if (paymentRequests.length === 0) {
    return <EmptyPaymentRequests />;
  }

  return (
    <>
      <div className="grid gap-4">
        {paymentRequests.map((request) => (
          <PaymentRequestCard
            key={request.id}
            name={request.name}
            email={request.email}
            status={request.status}
            transactionId={request.transactionId}
            createdAt={request.createdAt}
            invoiceUrl={request.invoiceUrl}
            rejectedReason={request.rejectedReason}
            approvedOn={request.approvedOn}
            onApprove={() => handleApprove(request.id)}
            isApproving={approvingId === request.id}
            onReject={() => openRejectDialog(request.id)}
            isRejecting={rejectingId === request.id}
          />
        ))}
      </div>

      <Dialog
        open={rejectTargetId !== null}
        onOpenChange={(open) => {
          if (!open) closeRejectDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment Request</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Enter reason for rejection..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeRejectDialog}
              disabled={rejectingId !== null}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={rejectingId !== null || rejectReason.trim() === ''}
            >
              {rejectingId !== null ? 'Processing...' : 'Confirm Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

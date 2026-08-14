'use client';

import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  ALLOWED_INVOICE_TYPES,
  createPaymentRequestSchema,
  MAX_INVOICE_SIZE,
  type CreatePaymentRequestValues,
} from '@/lib/validations/payment';

type BankTransferFormProps = {
  onCancel: () => void;
  onSubmitted: () => void;
};

export function BankTransferForm({
  onCancel,
  onSubmitted,
}: BankTransferFormProps) {
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreatePaymentRequestValues>({
    resolver: zodResolver(createPaymentRequestSchema),
    defaultValues: { transactionId: '' },
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setInvoiceFile(null);
      return;
    }

    if (!ALLOWED_INVOICE_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, WEBP, or PDF files are allowed');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_INVOICE_SIZE) {
      toast.error('File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    setInvoiceFile(file);
  }

  async function onSubmit(values: CreatePaymentRequestValues) {
    if (!invoiceFile) {
      toast.error('Please upload payment proof');
      return;
    }

    const formData = new FormData();
    formData.append('invoice', invoiceFile);
    formData.append('transactionId', values.transactionId);

    let response: Response;
    try {
      response = await fetch('/api/subscription/bank-transfer', {
        method: 'POST',
        body: formData,
      });
    } catch {
      setError('root', { message: 'Something went wrong. Please try again.' });
      return;
    }

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      setError('root', {
        message: body?.error ?? 'Something went wrong. Please try again.',
      });
      return;
    }

    toast.success('Payment request submitted');
    onSubmitted();
  }

  return (
    <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
      <div>
        <h4 className="font-semibold text-foreground mb-2">
          Bank Transfer Details
        </h4>
        <div className="bg-muted p-3 rounded text-sm space-y-1 text-foreground">
          <p>
            <strong>Bank Name:</strong> Example Bank
          </p>
          <p>
            <strong>Account Name:</strong> NicheCopy Ltd
          </p>
          <p>
            <strong>Account Number:</strong> 1234567890
          </p>
          <p>
            <strong>Amount:</strong> $29.00 USD
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FieldGroup>
          {errors.root ? <FieldError errors={[errors.root]} /> : null}
          <Field data-invalid={!!errors.transactionId}>
            <FieldLabel htmlFor="transactionId">
              Transaction ID / Reference Number
            </FieldLabel>
            <Input
              id="transactionId"
              type="text"
              placeholder="Enter your transaction ID"
              aria-invalid={!!errors.transactionId}
              {...register('transactionId')}
            />
            <FieldError errors={[errors.transactionId]} />
          </Field>

          <div>
            <label
              htmlFor="invoice"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Upload Payment Proof (JPG, PNG, WEBP, or PDF)
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-accent cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {invoiceFile ? invoiceFile.name : 'Choose file'}
                <input
                  type="file"
                  id="invoice"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Max file size: 5MB
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !invoiceFile}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Payment Request'}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}

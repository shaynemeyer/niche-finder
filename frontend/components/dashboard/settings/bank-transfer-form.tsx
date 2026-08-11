'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

const ALLOWED_INVOICE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];
const MAX_INVOICE_SIZE = 5 * 1024 * 1024;

type BankTransferFormProps = {
  onCancel: () => void;
};

export function BankTransferForm({ onCancel }: BankTransferFormProps) {
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setInvoiceFile(null);
      return;
    }

    if (!ALLOWED_INVOICE_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, or PDF files are allowed');
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

  // No POST /api/payment-requests route exists yet; submission is not wired
  // up until that endpoint is built.
  function handleBankTransferSubmit(e: FormEvent) {
    e.preventDefault();
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

      <form className="space-y-4" onSubmit={handleBankTransferSubmit}>
        <div>
          <label
            htmlFor="transactionId"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Transaction ID / Reference Number
          </label>
          <input
            type="text"
            id="transactionId"
            defaultValue="transactionId"
            className="w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your transaction ID"
            required
            minLength={5}
          />
        </div>

        <div>
          <label
            htmlFor="invoice"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Upload Payment Proof (JPG, PNG, or PDF)
          </label>
          <div className="flex items-center gap-2">
            <label className="flex-1 flex items-center justify-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-accent cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              {invoiceFile ? invoiceFile.name : 'Choose file'}
              <input
                type="file"
                id="invoice"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                required
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
            disabled={!invoiceFile}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit Payment Request
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

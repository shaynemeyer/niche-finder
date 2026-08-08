'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Search, Sparkles } from 'lucide-react';

type ValidationFormProps = {
  // Optional so a server component can render the form; the submit handler
  // arrives when the report pipeline exists.
  onSubmit?: (values: { niche: string; keyword: string }) => void;
  isSubmitting?: boolean;
  error?: string | null;
  success?: string | null;
  disabled?: boolean;
};

export function ValidationForm({
  onSubmit,
  isSubmitting = false,
  error = null,
  success = null,
  disabled = false,
}: ValidationFormProps) {
  const [niche, setNiche] = useState('');
  const [keyword, setKeyword] = useState('');

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Validate New Niche
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Enter your niche and keyword to get comprehensive market insights
        </p>
      </div>

      <div className="px-6 py-4">
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.({ niche, keyword });
          }}
        >
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-200">
                {success}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="niche"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Niche Description
            </label>
            <input
              id="niche"
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g., AI productivity tools for writers"
              className="w-full px-4 py-2 bg-background text-foreground border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Describe your niche in a few words
            </p>
          </div>

          <div>
            <label
              htmlFor="keyword"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Primary Keyword
            </label>
            <input
              id="keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., AI writing assistant"
              className="w-full px-4 py-2 bg-background text-foreground border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              The main keyword people would search for
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || disabled}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Starting Validation...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Validate Niche
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

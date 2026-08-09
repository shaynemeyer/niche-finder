'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  validateNicheSchema,
  type ValidateNicheValues,
} from '@/lib/validations/report';

export function ValidationForm() {
  const router = useRouter();
  const form = useForm<ValidateNicheValues>({
    resolver: zodResolver(validateNicheSchema),
    defaultValues: { niche: '', keyword: '' },
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: ValidateNicheValues) {
    let response: Response;
    try {
      response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
    } catch {
      // fetch only rejects on a network failure, never on a 4xx/5xx.
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

    // 202: the row exists but the analysis is still running. Refreshing the
    // server component pulls it into Recent Validations as PENDING, which
    // already renders a status and tolerates a null score.
    reset();
    toast.success('Validation started', {
      description: 'Analyzing your niche — this takes about ten seconds.',
    });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Validate New Niche
        </CardTitle>
        <CardDescription>
          Enter your niche and keyword to get comprehensive market insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {errors.root ? <FieldError errors={[errors.root]} /> : null}
            <Field data-invalid={!!errors.niche}>
              <FieldLabel htmlFor="niche">Niche Description</FieldLabel>
              <Input
                id="niche"
                type="text"
                placeholder="e.g., AI productivity tools for writers"
                aria-invalid={!!errors.niche}
                {...register('niche')}
                disabled={isSubmitting}
              />
              <FieldDescription>
                Describe your niche in a few words
              </FieldDescription>
              <FieldError errors={[errors.niche]} />
            </Field>
            <Field data-invalid={!!errors.keyword}>
              <FieldLabel htmlFor="keyword">Primary Keyword</FieldLabel>
              <Input
                id="keyword"
                type="text"
                placeholder="e.g., AI writing assistant"
                aria-invalid={!!errors.keyword}
                {...register('keyword')}
                disabled={isSubmitting}
              />
              <FieldDescription>
                The main keyword people would search for
              </FieldDescription>
              <FieldError errors={[errors.keyword]} />
            </Field>
            {/* Field's vertical orientation applies *:w-full to its children,
                which is right for inputs and wrong for an action. Full width
                on mobile, intrinsic width from sm up. */}
            <Field className="sm:*:w-auto sm:items-start">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="h-11 px-6 text-sm"
              >
                {isSubmitting ? (
                  'Starting Validation...'
                ) : (
                  <>
                    <Sparkles data-icon="inline-start" />
                    Validate Niche
                  </>
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

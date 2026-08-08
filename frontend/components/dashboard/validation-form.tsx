'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Sparkles } from 'lucide-react';

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
  const form = useForm<ValidateNicheValues>({
    resolver: zodResolver(validateNicheSchema),
    defaultValues: { niche: '', keyword: '' },
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  // The report pipeline has no endpoint yet, so submitting reports that
  // rather than posting to a route that does not exist.
  async function onSubmit() {
    setError('root', { message: 'Niche validation is not available yet.' });
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
              />
              <FieldDescription>
                The main keyword people would search for
              </FieldDescription>
              <FieldError errors={[errors.keyword]} />
            </Field>
            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Starting Validation...'
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
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

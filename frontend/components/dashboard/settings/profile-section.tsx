'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'lucide-react';
import { toast } from 'sonner';

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  updateProfileSchema,
  type UpdateProfileValues,
} from '@/lib/validations/profile';

type ProfileUser = {
  name: string | null;
  email: string;
  role: string;
};

export function ProfileSection({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name ?? '' },
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: UpdateProfileValues) {
    let response: Response;
    try {
      response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
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

    toast.success('Profile updated');
    setIsEditing(false);
    router.refresh();
  }

  function handleCancel() {
    reset({ name: user.name ?? '' });
    setIsEditing(false);
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-foreground">
            Profile Information
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your account details and information
        </p>
      </div>
      <div className="px-6 py-4 space-y-4">
        {!isEditing ? (
          <>
            <div>
              <label className="text-sm font-medium text-foreground">
                Name
              </label>
              <p className="text-foreground mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <p className="text-foreground mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Role
              </label>
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200">
                  {user.role}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FieldGroup>
              {errors.root ? <FieldError errors={[errors.root]} /> : null}
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
                <FieldError errors={[errors.name]} />
              </Field>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Email (cannot be changed)
                </label>
                <p className="text-muted-foreground mt-1">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </FieldGroup>
          </form>
        )}
      </div>
    </div>
  );
}

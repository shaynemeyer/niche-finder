import { Suspense } from 'react';
import Link from 'next/link';

import { LoginForm } from '@/components/login-form';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SignInPage() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex justify-center">
          <span className="text-3xl font-bold">NicheFinder</span>
        </Link>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

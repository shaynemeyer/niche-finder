import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="text-muted-foreground mt-2">
        Signed in as {session.user.email}
      </p>
    </div>
  );
}

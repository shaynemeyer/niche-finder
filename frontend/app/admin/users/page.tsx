import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { listAdminUsers } from '@/lib/data/users';
import { UsersSection } from '@/components/admin/users/users-section';
import { UserRoleBreakdown } from '@/components/admin/users/user-role-breakdown';

async function UsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const users = await listAdminUsers();

  const admins = users.filter((user) => user.role === 'ADMIN').length;
  const proUsers = users.filter(
    (user) => user.subscription?.planType === 'PRO',
  ).length;
  const freeUsers = users.length - proUsers;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all platform users
        </p>
      </div>

      <UsersSection users={users} />

      <UserRoleBreakdown admins={admins} proUsers={proUsers} freeUsers={freeUsers} />
    </div>
  );
}

export default UsersPage;

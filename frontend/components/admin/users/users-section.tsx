'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Users } from 'lucide-react';

import type { PlanType, Role } from '@/lib/generated/prisma/client';
import { MetricCard } from '@/components/admin/shared/metric-card';
import { EmptyUsers } from '@/components/admin/users/empty-users';
import { UsersTable } from '@/components/admin/users/users-table';
import type { AdminUser } from '@/components/admin/users/user-row';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function matchesSearch(user: AdminUser, term: string) {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;

  return (
    user.name?.toLowerCase().includes(needle) ||
    user.email.toLowerCase().includes(needle)
  );
}

export function UsersSection({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredUsers = users.filter((user) => matchesSearch(user, searchTerm));

  async function handleRoleChange(userId: string, role: Role) {
    setUpdatingRoleId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const body = await response.json();

      if (!response.ok) {
        toast.error(body.error ?? 'Failed to update role');
        return;
      }

      toast.success(body.message);
      router.refresh();
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update role');
    } finally {
      setUpdatingRoleId(null);
    }
  }

  async function handlePlanChange(userId: string, planType: PlanType) {
    setUpdatingPlanId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      });
      const body = await response.json();

      if (!response.ok) {
        toast.error(body.error ?? 'Failed to update plan');
        return;
      }

      toast.success(body.message);
      router.refresh();
    } catch (error) {
      console.error('Failed to update user plan:', error);
      toast.error('Failed to update plan');
    } finally {
      setUpdatingPlanId(null);
    }
  }

  async function handleDeleteConfirm() {
    const userId = deleteTargetId;
    if (!userId) return;

    setDeletingId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const body = await response.json();

      if (!response.ok) {
        toast.error(body.error ?? 'Failed to delete user');
        return;
      }

      toast.success(body.message);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeletingId(null);
      setDeleteTargetId(null);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-card rounded-lg border border-border shadow-sm">
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <MetricCard label="Total Users" value={users.length} icon={Users} />
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyUsers />
      ) : (
        <UsersTable
          users={filteredUsers}
          onRoleChange={handleRoleChange}
          updatingRoleId={updatingRoleId}
          onPlanChange={handlePlanChange}
          updatingPlanId={updatingPlanId}
          onDeleteRequest={setDeleteTargetId}
          deletingId={deletingId}
        />
      )}

      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the account and all of its reports,
              usage history, and payment requests. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingId !== null}
            >
              {deletingId !== null ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

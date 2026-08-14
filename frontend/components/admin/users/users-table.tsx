'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, Trash2, Users } from 'lucide-react';
import { createColumnHelper, useTable } from '@tanstack/react-table';
import type { Header } from '@tanstack/react-table';

import type { PlanType, Role } from '@/lib/generated/prisma/client';
import type { AdminUser } from '@/lib/data/users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { features, type DataTableFeatures } from './data-table-features';

function formatJoinedDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

type UsersTableProps = {
  users: AdminUser[];
  onRoleChange: (userId: string, role: Role) => void;
  updatingRoleId: string | null;
  onPlanChange: (userId: string, planType: PlanType) => void;
  updatingPlanId: string | null;
  onDeleteRequest: (userId: string) => void;
  deletingId: string | null;
};

const columnHelper = createColumnHelper<DataTableFeatures, AdminUser>();

function SortableHeader<TValue>({
  header,
  children,
}: {
  header: Header<DataTableFeatures, AdminUser, TValue>;
  children: React.ReactNode;
}) {
  const sorted = header.column.getIsSorted();

  return (
    <button
      type="button"
      onClick={header.column.getToggleSortingHandler()}
      className="flex items-center gap-1 hover:text-foreground"
    >
      {children}
      {sorted === 'asc' && <ArrowUp className="w-3 h-3" />}
      {sorted === 'desc' && <ArrowDown className="w-3 h-3" />}
      {!sorted && <ArrowUpDown className="w-3 h-3 opacity-40" />}
    </button>
  );
}

export function UsersTable({
  users,
  onRoleChange,
  updatingRoleId,
  onPlanChange,
  updatingPlanId,
  onDeleteRequest,
  deletingId,
}: UsersTableProps) {
  const columns = columnHelper.columns([
    columnHelper.accessor((user) => user.name ?? user.email, {
      id: 'user',
      header: (info) => (
        <SortableHeader header={info.header}>User</SortableHeader>
      ),
      sortFn: 'alphanumeric',
      cell: (info) => (
        <div>
          <div className="font-medium text-foreground">
            {info.row.original.name ?? 'Unnamed user'}
          </div>
          <div className="text-sm text-muted-foreground">
            {info.row.original.email}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('role', {
      header: (info) => (
        <SortableHeader header={info.header}>Role</SortableHeader>
      ),
      sortFn: 'alphanumeric',
      cell: (info) => {
        const user = info.row.original;
        return (
          <select
            value={user.role}
            onChange={(event) =>
              onRoleChange(user.id, event.target.value as Role)
            }
            disabled={updatingRoleId === user.id}
            className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        );
      },
    }),
    columnHelper.accessor((user) => user.subscription?.planType ?? '', {
      id: 'plan',
      header: (info) => (
        <SortableHeader header={info.header}>Plan</SortableHeader>
      ),
      sortFn: 'alphanumeric',
      cell: (info) => {
        const user = info.row.original;
        return user.subscription ? (
          <select
            value={user.subscription.planType}
            onChange={(event) =>
              onPlanChange(user.id, event.target.value as PlanType)
            }
            disabled={updatingPlanId === user.id}
            className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="FREE">FREE</option>
            <option value="PRO">PRO</option>
          </select>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            No subscription
          </span>
        );
      },
    }),
    columnHelper.accessor((user) => user._count.reports, {
      id: 'reports',
      header: (info) => (
        <SortableHeader header={info.header}>Reports</SortableHeader>
      ),
      cell: (info) => (
        <span className="text-sm text-foreground">
          {info.row.original._count.reports}
        </span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      id: 'joined',
      header: (info) => (
        <SortableHeader header={info.header}>Joined</SortableHeader>
      ),
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatJoinedDate(info.row.original.createdAt)}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const user = info.row.original;
        return (
          <button
            type="button"
            onClick={() => onDeleteRequest(user.id)}
            disabled={deletingId === user.id}
            title="Delete user"
            className="inline-flex items-center justify-center p-1.5 text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-red-600 dark:disabled:hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        );
      },
    }),
  ]);

  const table = useTable({
    features,
    columns,
    data: users,
  });

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Users className="w-5 h-5" />
          All Users
        </h2>
      </div>
      <div className="px-6 py-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    <table.FlexRender header={header} />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

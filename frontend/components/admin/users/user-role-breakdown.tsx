type UserRoleBreakdownProps = {
  admins: number;
  proUsers: number;
  freeUsers: number;
};

export function UserRoleBreakdown({
  admins,
  proUsers,
  freeUsers,
}: UserRoleBreakdownProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card rounded-lg border border-border shadow-sm px-6 py-4">
        <p className="text-sm text-muted-foreground">Admins</p>
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
          {admins}
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border shadow-sm px-6 py-4">
        <p className="text-sm text-muted-foreground">Pro Users</p>
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {proUsers}
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border shadow-sm px-6 py-4">
        <p className="text-sm text-muted-foreground">Free Users</p>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {freeUsers}
        </div>
      </div>
    </div>
  );
}

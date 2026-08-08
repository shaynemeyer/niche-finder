import Link from 'next/link';
import { Activity, Settings, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Action = {
  href: string;
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  description: string;
};

const actions: Action[] = [
  {
    href: '/admin/users',
    icon: Users,
    iconClassName: 'text-blue-600 dark:text-blue-400',
    title: 'Manage Users',
    description: 'View and edit user accounts',
  },
  {
    href: '/admin/analytics',
    icon: Activity,
    iconClassName: 'text-green-600 dark:text-green-400',
    title: 'View Analytics',
    description: 'Detailed platform insights',
  },
  {
    href: '/admin/settings',
    icon: Settings,
    iconClassName: 'text-purple-600 dark:text-purple-400',
    title: 'Settings',
    description: 'Platform configuration',
  },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Common administrative tasks
        </p>
      </div>
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map(
            ({ href, icon: Icon, iconClassName, title, description }) => (
              <Link
                key={href}
                href={href}
                className="p-4 border border-border rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition text-center"
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${iconClassName}`} />
                <h3 className="font-medium text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

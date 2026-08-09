import { Bell } from 'lucide-react';

export function NotificationsSection() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-foreground">
            Notifications
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your notification preferences
        </p>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Email Notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive email when validations are complete
            </p>
          </div>
          <button
            disabled
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">
              Trending Niches Alert
            </p>
            <p className="text-sm text-muted-foreground">
              Get notified about trending niches (Pro only)
            </p>
          </div>
          <button
            disabled
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}

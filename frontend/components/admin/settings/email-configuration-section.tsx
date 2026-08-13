import { Mail } from 'lucide-react';

export function EmailConfigurationSection() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-foreground">
            Email Configuration
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Email service provider settings
        </p>
      </div>
      <div className="px-6 py-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Configure email service (SendGrid, Mailgun, etc.) for sending
          notifications
        </p>
        <button
          disabled
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg cursor-not-allowed opacity-50"
        >
          Configure Email (Coming Soon)
        </button>
      </div>
    </div>
  );
}

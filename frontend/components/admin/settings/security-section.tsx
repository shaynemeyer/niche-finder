import { Shield } from 'lucide-react';

export function SecuritySection() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform security settings
        </p>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">
              Two-Factor Authentication
            </p>
            <p className="text-sm text-muted-foreground">
              Require 2FA for admin accounts
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
            <p className="font-medium text-foreground">API Rate Limiting</p>
            <p className="text-sm text-muted-foreground">
              Protect against abuse
            </p>
          </div>
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            ✓ Enabled
          </span>
        </div>
      </div>
    </div>
  );
}

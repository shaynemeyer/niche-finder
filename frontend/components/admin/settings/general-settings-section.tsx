import { Globe } from 'lucide-react';

export function GeneralSettingsSection() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-foreground">
            General Settings
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform-wide configuration
        </p>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">
            Platform Name
          </label>
          <input
            type="text"
            value="NicheFinder"
            disabled
            className="mt-1 w-full px-4 py-2 border border-border rounded-lg bg-muted"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">
            Support Email
          </label>
          <input
            type="email"
            placeholder="support@nichefinder.com"
            disabled
            className="mt-1 w-full px-4 py-2 border border-border rounded-lg bg-muted"
          />
        </div>
        <button
          disabled
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg cursor-not-allowed opacity-50"
        >
          Save Changes (Coming Soon)
        </button>
      </div>
    </div>
  );
}

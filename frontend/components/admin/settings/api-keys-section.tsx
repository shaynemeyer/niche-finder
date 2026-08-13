import { Database } from 'lucide-react';

type ApiKeyStatus = {
  name: string;
  description: string;
  status: string;
  statusClassName: string;
};

const apiKeys: ApiKeyStatus[] = [
  {
    name: 'OpenAI API',
    description: 'GPT-4 for market insights',
    status: '✓ Connected',
    statusClassName: 'text-green-600 dark:text-green-400',
  },
  {
    name: 'Reddit API',
    description: 'Community analysis',
    status: 'Optional',
    statusClassName: 'text-muted-foreground',
  },
  {
    name: 'Google Trends',
    description: 'Search trends data',
    status: '✓ Active',
    statusClassName: 'text-green-600 dark:text-green-400',
  },
];

export function ApiKeysSection() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage external API integrations
        </p>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div className="space-y-2">
          {apiKeys.map(({ name, description, status, statusClassName }) => (
            <div
              key={name}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div>
                <p className="font-medium text-foreground">{name}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <span className={`text-sm font-medium ${statusClassName}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

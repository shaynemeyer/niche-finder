import { ApiKeysSection } from '@/components/admin/settings/api-keys-section';
import { EmailConfigurationSection } from '@/components/admin/settings/email-configuration-section';
import { GeneralSettingsSection } from '@/components/admin/settings/general-settings-section';
import { SecuritySection } from '@/components/admin/settings/security-section';

function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure platform settings and preferences
        </p>
      </div>

      <GeneralSettingsSection />
      <EmailConfigurationSection />
      <ApiKeysSection />
      <SecuritySection />
    </div>
  );
}

export default SettingsPage;

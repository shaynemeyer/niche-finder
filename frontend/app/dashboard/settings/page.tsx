import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { getUserProfile } from '@/lib/data/users';
import { DangerZoneSection } from '@/components/dashboard/settings/danger-zone-section';
import { NotificationsSection } from '@/components/dashboard/settings/notifications-section';
import { ProfileSection } from '@/components/dashboard/settings/profile-section';
import { SecuritySection } from '@/components/dashboard/settings/security-section';
import { SubscriptionSection } from '@/components/dashboard/settings/subscription-section';

async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/signin');
  }

  const user = await getUserProfile(session.user.id);

  if (!user) {
    redirect('/signin');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <ProfileSection user={user} />
      <SubscriptionSection />
      <SecuritySection />
      <NotificationsSection />
      <DangerZoneSection />
    </div>
  );
}

export default SettingsPage;

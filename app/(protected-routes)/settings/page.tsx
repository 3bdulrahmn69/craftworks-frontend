'use client';

import { useRouter } from 'next/navigation';
import SettingsCard from '@/app/components/settings/settings-card';
import Container from '@/app/components/ui/container';
import { Button } from '@/app/components/ui/button';
import { HiUser, HiLockClosed, HiArrowLeft } from 'react-icons/hi2';

const SettingsPage = () => {
  const router = useRouter();

  return (
    <Container>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SettingsCard
          title="Personal Information"
          description="Update your profile details, contact information, and address"
          href="/settings/personal"
          icon={HiUser}
        />
        <SettingsCard
          title="Security"
          description="Change your password and manage security preferences"
          href="/settings/security"
          icon={HiLockClosed}
        />
      </div>
    </Container>
  );
};

export default SettingsPage;

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
      <nav aria-label="Breadcrumb">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6"
          aria-label="Go back to previous page"
        >
          <HiArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </Button>
      </nav>

      <main role="main">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account preferences and security settings
          </p>
        </header>

        <section aria-labelledby="settings-options-heading">
          <h2 id="settings-options-heading" className="sr-only">
            Settings Options
          </h2>
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
        </section>
      </main>
    </Container>
  );
};

export default SettingsPage;

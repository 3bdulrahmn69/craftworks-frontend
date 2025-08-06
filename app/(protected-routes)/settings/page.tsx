'use client';

import { useRouter } from 'next/navigation';
import SettingsCard from '@/app/components/settings/settings-card';
import Container from '@/app/components/ui/container';
import { Button } from '@/app/components/ui/button';
import { HiArrowLeft } from 'react-icons/hi2';
import { settingsOptions } from './';

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
            {settingsOptions.map((option) => (
              <SettingsCard
                key={option.title}
                title={option.title}
                description={option.description}
                href={option.href}
                icon={option.icon}
              />
            ))}
          </div>
        </section>
      </main>
    </Container>
  );
};

export default SettingsPage;

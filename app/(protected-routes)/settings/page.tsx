'use client';

import { useTranslations } from 'next-intl';
import SettingsCard from '@/app/components/settings/settings-card';
import Container from '@/app/components/ui/container';
import BackButton from '@/app/components/ui/back-button';
import { settingsOptions } from './';
import { useAuth } from '@/app/hooks/useAuth';

const SettingsPage = () => {
  const t = useTranslations('settings');
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  return (
    <Container>
      <nav aria-label="Breadcrumb">
        <BackButton showLabel />
      </nav>

      <main role="main">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </header>

        <section aria-labelledby="settings-options-heading">
          <h2 id="settings-options-heading" className="sr-only">
            Settings Options
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {settingsOptions.map((option) => {
              if (
                option.titleKey === 'verification' &&
                userRole !== 'craftsman'
              ) {
                return null;
              }
              return (
                <SettingsCard
                  key={option.titleKey}
                  title={t(`options.${option.titleKey}.title`)}
                  description={t(`options.${option.titleKey}.description`)}
                  href={option.href}
                  icon={option.icon}
                />
              );
            })}
          </div>
        </section>
      </main>
    </Container>
  );
};

export default SettingsPage;

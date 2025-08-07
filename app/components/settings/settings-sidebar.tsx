'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { settingsOptions } from '@/app/(protected-routes)/settings/';
import BackButton from '../ui/back-button';
import { useAuth } from '@/app/hooks/useAuth';

export default function SettingsSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('settings');
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  const filteredOptions = settingsOptions.filter(({ titleKey }) =>
    titleKey === 'verification' ? userRole === 'craftsman' : true
  );

  const borderDirection = locale === 'en' ? 'border-l-4' : 'border-r-4';

  return (
    <aside className="hidden lg:block relative w-72">
      <div className="sticky top-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-2 border-b border-border/40">
          <BackButton />
          <h2 className="text-xl font-bold text-foreground">{t('title')}</h2>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-3">
          {filteredOptions.map(({ href, titleKey, icon: Icon }) => {
            const isActive = pathname === href;
            const title = t(`options.${titleKey}.title`);
            const description = t(`options.${titleKey}.description`);

            return (
              <Link
                key={href}
                href={href}
                replace
                className={`group flex items-start gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${borderDirection} ${
                  isActive
                    ? 'bg-primary/10 border-primary shadow-sm'
                    : 'hover:bg-muted/50 border-transparent'
                }`}
              >
                {/* Icon */}
                <div
                  className={`p-2.5 rounded-lg mt-0.5 transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium transition-colors ${
                      isActive
                        ? 'text-primary'
                        : 'text-foreground group-hover:text-primary'
                    }`}
                  >
                    {title}
                  </div>
                  <p
                    className={`text-xs mt-1.5 transition-colors truncate ${
                      isActive
                        ? 'text-primary/80'
                        : 'text-muted-foreground group-hover:text-primary/70'
                    }`}
                    title={description}
                  >
                    {description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

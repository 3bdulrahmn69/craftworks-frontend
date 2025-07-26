'use client';

import { usePathname } from 'next/navigation';
import SettingsSidebar from '@/app/components/settings/settings-sidebar';
import Container from '@/app/components/ui/container';

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isMainSettingsPage = pathname === '/settings';

  if (isMainSettingsPage) {
    return <div className="p-6">{children}</div>;
  }

  return (
    <Container className="flex justify-between py-8">
      <SettingsSidebar />
      <main className="flex-1">{children}</main>
    </Container>
  );
};

export default SettingsLayout;

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiUser, HiLockClosed } from 'react-icons/hi2';

const settingsItems = [
  {
    name: 'Personal Information',
    href: '/settings/personal',
    icon: HiUser,
    description: 'Manage your profile and personal details',
  },
  {
    name: 'Security',
    href: '/settings/security',
    icon: HiLockClosed,
    description: 'Update your password and security settings',
  },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block relative">
      <h2 className="text-lg font-semibold text-foreground mb-6">Settings</h2>
      <nav className="space-y-2 sticky top-6">
        {settingsItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              replace
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-foreground hover:bg-muted hover:text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <div>
                <div className="font-medium">{item.name}</div>
                <div
                  className={`text-xs mt-0.5 ${
                    isActive ? 'text-primary/70' : 'text-muted-foreground'
                  }`}
                >
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

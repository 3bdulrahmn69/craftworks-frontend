'use client';

import Redirect from '@/app/components/auth/redirect';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Redirect requireAuth={true}>{children}</Redirect>;
}

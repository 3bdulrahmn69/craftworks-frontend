import Redirect from '../components/auth/redirect';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Redirect />
      {children}
    </>
  );
}

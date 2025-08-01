import Redirect from '../components/redirect';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Redirect>{children}</Redirect>;
}

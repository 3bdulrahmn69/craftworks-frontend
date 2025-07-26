import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi2';

interface SettingsPageHeaderProps {
  title: string;
  description: string;
}

export default function SettingsPageHeader({
  title,
  description,
}: SettingsPageHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/settings"
        replace
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 lg:hidden transition-colors"
      >
        <HiArrowLeft className="w-4 h-4 mr-1" />
        Back to Settings
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        {title}
      </h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

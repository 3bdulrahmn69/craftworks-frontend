import { useLocale } from 'next-intl';
import Link from 'next/link';
import { HiChevronRight } from 'react-icons/hi2';

interface SettingsCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function SettingsCard({
  title,
  description,
  href,
  icon: Icon,
}: SettingsCardProps) {
  const locale = useLocale();

  return (
    <Link href={href} className="block h-full">
      <div className="h-full bg-card border border-border rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {title}
            </h3>
            <p
              className="text-muted-foreground mt-1 line-clamp-2"
              title={description}
            >
              {description}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <HiChevronRight
            className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ${
              locale === 'ar' ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>
    </Link>
  );
}

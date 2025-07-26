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
  return (
    <Link href={href} className="block">
      <div className="bg-card border border-border rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          <HiChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
}

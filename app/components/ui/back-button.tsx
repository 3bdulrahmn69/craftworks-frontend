import { HiArrowLeft } from 'react-icons/hi';
import Button from './button';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

interface BackButtonProps {
  showLabel?: boolean;
  className?: string;
}

const BackButton = ({ showLabel = false, className }: BackButtonProps) => {
  const locale = useLocale();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      aria-label="Back to Settings"
      className={clsx(
        'p-2 rounded-lg hover:bg-muted/50 transition-colors group flex items-center gap-2',
        className
      )}
      title="Back"
      onClick={() => router.back()}
    >
      <HiArrowLeft
        size={20}
        className={`text-muted-foreground group-hover:text-primary transition-colors ${
          locale === 'ar' ? 'rotate-180' : ''
        }`}
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
          {locale === 'ar' ? 'العودة' : 'Back'}
        </span>
      )}
    </Button>
  );
};

export default BackButton;

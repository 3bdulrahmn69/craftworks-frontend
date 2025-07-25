import type { ReactNode } from 'react';
import { cn } from '@/app/utils/cn';
import { memo, useMemo } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

const Container = memo(function Container({
  children,
  className,
  maxWidth = 'xl',
}: ContainerProps) {
  const computedClassName = useMemo(
    () =>
      cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidthClasses[maxWidth], className),
    [maxWidth, className]
  );

  return <div className={computedClassName}>{children}</div>;
});

export default Container;

import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xl2';
  className?: string;
}

const LoadingSpinner = memo(function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    xl2: 'w-10 h-10',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-2 border-primary border-t-primary-foreground rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
});

export default LoadingSpinner;

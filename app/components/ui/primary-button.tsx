import React, { memo, useMemo } from 'react';
import LoadingSpinner from './loading-spinner';

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  size?: 'default' | 'lg';
}

const PrimaryButton = memo(function PrimaryButton({
  children,
  isLoading = false,
  loadingText,
  size = 'default',
  className = '',
  disabled,
  ...props
}: PrimaryButtonProps) {
  const sizeClasses = useMemo(
    () => ({
      default: 'py-3 text-base',
      lg: 'py-4 text-lg',
    }),
    []
  );

  const computedClassName = useMemo(
    () =>
      `w-full bg-gradient-to-r from-primary to-primary-600 text-primary-foreground rounded-xl hover:from-primary-600 hover:to-primary-700 focus:ring-4 focus:ring-primary/20 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${sizeClasses[size]} ${className}`,
    [sizeClasses, size, className]
  );

  return (
    <button
      className={computedClassName}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size="md" />
          <span>{loadingText || 'Loading...'}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
});

export default PrimaryButton;

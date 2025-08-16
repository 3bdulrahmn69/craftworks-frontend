import React, { memo, useMemo } from 'react';
import { cn } from '@/app/utils/cn';
import LoadingSpinner from './loading-spinner';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'custom';
  size?: 'default' | 'sm' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
};

const variantClasses = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-border bg-transparent hover:bg-accent',
  ghost: 'bg-transparent hover:bg-accent',
  link: 'underline text-primary hover:text-primary/80 p-0 h-auto',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  custom: '',
};

const sizeClasses = {
  default: 'px-4 py-2 text-base',
  sm: 'px-3 py-1.5 text-sm',
  lg: 'px-6 py-3 text-lg',
};

export const Button = memo(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        className,
        variant = 'primary',
        size = 'default',
        isLoading = false,
        loadingText,
        disabled,
        children,
        ...props
      },
      ref
    ) => {
      const computedClassName = useMemo(
        () =>
          cn(
            'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
            variantClasses[variant],
            sizeClasses[size],
            className
          ),
        [variant, size, className]
      );

      return (
        <button
          ref={ref}
          className={computedClassName}
          disabled={disabled || isLoading}
          aria-busy={isLoading}
          {...props}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              <span>{loadingText || 'Loading...'}</span>
            </div>
          ) : (
            children
          )}
        </button>
      );
    }
  )
);
Button.displayName = 'Button';

export default Button;

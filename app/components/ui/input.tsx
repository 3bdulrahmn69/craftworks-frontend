'use client';

import { useState, memo, useCallback, useMemo } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useLocale } from 'next-intl';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  showPasswordToggle?: boolean;
}

const Input = memo(function Input({
  label,
  error,
  icon,
  showPasswordToggle = false,
  type = 'text',
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const inputType = useMemo(
    () => (showPasswordToggle ? (showPassword ? 'text' : 'password') : type),
    [showPasswordToggle, showPassword, type]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-sm font-medium text-foreground block mb-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span
            className={`absolute text-muted-foreground ${
              isRTL ? 'right-3' : 'left-3'
            }`}
          >
            {icon}
          </span>
        )}
        <input
          type={inputType}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/30 bg-background text-foreground transition-all duration-200 ${
            icon ? (isRTL ? 'pr-10' : 'pl-10') : ''
          } ${
            error
              ? 'border-destructive focus:border-destructive'
              : 'border-border focus:border-primary'
          }`}
          {...rest}
        />
        {showPasswordToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={togglePasswordVisibility}
            className={`absolute top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded ${
              isRTL ? 'left-3' : 'right-3'
            }`}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <FaEyeSlash className="w-5 h-5" aria-hidden="true" />
            ) : (
              <FaEye className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p
          className="text-destructive text-sm flex items-center gap-1 mt-1"
          role="alert"
        >
          <span
            className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-xs"
            aria-hidden="true"
          >
            !
          </span>
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;

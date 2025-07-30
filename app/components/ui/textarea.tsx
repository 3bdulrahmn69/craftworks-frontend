'use client';

import { memo, useMemo } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { useLocale } from 'next-intl';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = memo(function Textarea({
  label,
  error,
  helpText,
  showCharCount = false,
  maxLength,
  value = '',
  ...rest
}: TextareaProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const characterCount = useMemo(() => {
    return typeof value === 'string' ? value.length : 0;
  }, [value]);

  const errorId = error ? `${rest.id || 'textarea'}-error` : undefined;
  const helpTextId = helpText ? `${rest.id || 'textarea'}-help` : undefined;
  const describedBy =
    [errorId, helpTextId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label
          htmlFor={rest.id}
          className="text-sm font-medium text-foreground block mb-2"
        >
          {label}
          {rest.required && (
            <span className="text-destructive ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <textarea
          value={value}
          maxLength={maxLength}
          className={`w-full px-4 py-3 border rounded-xl resize-y min-h-[100px] focus:ring-2 focus:ring-primary/30 bg-background text-foreground transition-all duration-200 ${
            error
              ? 'border-destructive focus:border-destructive'
              : 'border-border focus:border-primary hover:border-primary/50'
          } ${isRTL ? 'text-right' : 'text-left'}`}
          aria-describedby={describedBy}
          {...rest}
        />

        {showCharCount && maxLength && (
          <div
            className={`absolute bottom-2 text-xs text-muted-foreground ${
              isRTL ? 'left-3' : 'right-3'
            }`}
          >
            <span
              className={characterCount > maxLength * 0.9 ? 'text-warning' : ''}
            >
              {characterCount}
            </span>
            /{maxLength}
          </div>
        )}
      </div>

      {helpText && (
        <p id={helpTextId} className="text-xs text-muted-foreground">
          {helpText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
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

export default Textarea;

'use client';

import { useState, useEffect, useRef } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

export interface DropdownOption {
  id: string;
  label: string;
  description?: string;
  value?: any;
}

interface DropdownSelectorProps {
  id: string;
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  error?: string;
}

const DropdownSelector = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  helpText,
  allowEmpty = true,
  emptyLabel = 'No selection',
  className = '',
  error,
}: DropdownSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const selectedOption = options.find((option) => option.id === value);
  const displayValue = selectedOption?.label || placeholder;

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
    }
  };

  const buttonClasses = disabled
    ? 'w-full px-4 py-3 border border-border rounded-xl bg-muted text-muted-foreground flex items-center justify-between cursor-not-allowed'
    : 'w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors flex items-center justify-between hover:border-primary/50';

  const errorId = error ? `${id}-error` : undefined;
  const helpTextId = helpText ? `${id}-help` : undefined;
  const describedBy =
    [errorId, helpTextId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          id={id}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={buttonClasses}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-describedby={describedBy}
        >
          <span className={!selectedOption ? 'text-muted-foreground' : ''}>
            {displayValue}
          </span>
          <HiChevronDown
            className={`w-5 h-5 transition-transform ${
              disabled ? 'opacity-50' : ''
            } ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {isOpen && !disabled && (
          <div
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto"
            role="listbox"
            aria-labelledby={id}
          >
            {allowEmpty && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border focus:outline-none focus:bg-muted"
                role="option"
                aria-selected={!value}
              >
                <span className="text-muted-foreground">{emptyLabel}</span>
              </button>
            )}
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 focus:outline-none focus:bg-muted ${
                  value === option.id ? 'bg-primary/10 text-primary' : ''
                }`}
                role="option"
                aria-selected={value === option.id}
              >
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p
          id={errorId}
          className="text-xs text-red-500 mt-1"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {helpText && (
        <p id={helpTextId} className="text-xs text-muted-foreground mt-1">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default DropdownSelector;

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  showPasswordToggle?: boolean;
}

const Input = ({
  label,
  error,
  icon,
  showPasswordToggle = false,
  type = 'text',
  ...rest
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-sm font-medium text-foreground block mb-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-muted-foreground">{icon}</span>}
        <input
          type={inputType}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/30 bg-background text-foreground transition-all duration-200 ${
            icon ? 'pl-10' : ''
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
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-destructive text-sm flex items-center gap-1 mt-1">
          <span className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-xs">!</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input; 
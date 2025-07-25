'use client';

interface PhoneInputProps {
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  countryCode?: string;
}

export default function PhoneInput({
  name,
  label,
  placeholder = '',
  value,
  onChange,
  error = '',
  required = false,
  autoComplete = 'tel',
  countryCode = '+20',
}: PhoneInputProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="text-sm font-medium text-foreground block mb-1"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      <div className="relative">
        <div className="flex">
          {/* Country Code */}
          <div className="flex items-center px-3 py-3 bg-muted border border-r-0 border-border rounded-l-xl text-muted-foreground font-medium">
            {countryCode}
          </div>

          {/* Phone Number Input */}
          <input
            id={name}
            name={name}
            type="tel"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            required={required}
            className={`flex-1 px-4 py-3 rounded-r-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
              error
                ? 'border-destructive focus:ring-destructive'
                : 'border-border'
            }`}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}

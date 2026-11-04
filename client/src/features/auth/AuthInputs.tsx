import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps {
  icon: ReactNode;
  label: string;
  name: string;
  type?: string;
  registration: InputHTMLAttributes<HTMLInputElement>;
  error?: string;
  autoComplete: string;
  placeholder?: string;
}

export function AuthInput({
  icon,
  label,
  name,
  type = "text",
  registration,
  error,
  autoComplete,
  placeholder,
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-bold text-foreground">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          id={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          {...registration}
          name={name}
          className="h-12 w-full rounded-lg border border-border bg-input pl-12 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
      {error && (
        <p
          id={`${name}-error`}
          className="text-xs font-semibold text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface PasswordInputProps {
  label: string;
  name: string;
  registration: InputHTMLAttributes<HTMLInputElement>;
  error?: string;
  autoComplete: string;
  placeholder?: string;
}

export function PasswordInput({
  label,
  name,
  registration,
  error,
  autoComplete,
  placeholder,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-bold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          {...registration}
          name={name}
          className="h-12 w-full rounded-lg border border-border bg-input px-4 pr-12 text-sm font-medium text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-md"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <p
          id={`${name}-error`}
          className="text-xs font-semibold text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
        </label>
      )}
      <input
        {...props}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm',
          'bg-white dark:bg-slate-900',
          'border-slate-200 dark:border-slate-700',
          'text-slate-900 dark:text-slate-100',
          'placeholder:text-slate-400 dark:placeholder:text-slate-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500',
          'transition-colors duration-150',
          error && 'border-red-400 focus:ring-red-400/30',
          className
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm resize-none',
          'bg-white dark:bg-slate-900',
          'border-slate-200 dark:border-slate-700',
          'text-slate-900 dark:text-slate-100',
          'placeholder:text-slate-400 dark:placeholder:text-slate-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500',
          'transition-colors duration-150',
          error && 'border-red-400',
          className
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
        </label>
      )}
      <select
        {...props}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm',
          'bg-white dark:bg-slate-900',
          'border-slate-200 dark:border-slate-700',
          'text-slate-900 dark:text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500',
          'transition-colors duration-150',
          error && 'border-red-400',
          className
        )}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

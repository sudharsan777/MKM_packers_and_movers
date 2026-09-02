import React from 'react';
import { cn } from '../../utils';
import { ChevronDown } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'flex w-full h-9 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 shadow-subtle',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-[11px] font-medium text-rose-500">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 3, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={cn(
            'flex w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 shadow-subtle',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-[11px] font-medium text-rose-500">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'flex w-full h-9 rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-xs text-slate-900 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 appearance-none shadow-subtle cursor-pointer',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {error ? (
          <p className="mt-1 text-[11px] font-medium text-rose-500">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent' | 'brand' | 'default';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    brand: 'bg-slate-900 text-white border-slate-800 font-semibold',
    accent: 'bg-amber-50 text-amber-900 border-amber-200/90 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/90 font-medium',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-medium',
    danger: 'bg-rose-50 text-rose-800 border-rose-200/90 font-medium',
    info: 'bg-sky-50 text-sky-800 border-sky-200/90 font-medium',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
    default: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
  };

  const dotColors = {
    brand: 'bg-white',
    accent: 'bg-amber-500',
    warning: 'bg-amber-500',
    success: 'bg-emerald-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-slate-400',
    default: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border leading-tight shrink-0 shadow-2xs',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};

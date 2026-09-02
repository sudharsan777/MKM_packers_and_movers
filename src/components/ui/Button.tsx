import React from 'react';
import { cn } from '../../utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'amber' | 'emerald' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 text-white font-bold hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] shadow-md shadow-indigo-500/20 border border-indigo-500/30 focus-visible:ring-indigo-500/40',
      amber:
        'bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 text-white font-bold hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] shadow-md shadow-amber-500/20 border border-amber-400 focus-visible:ring-amber-500/40',
      emerald:
        'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.98] shadow-md shadow-emerald-600/20 border border-emerald-500 focus-visible:ring-emerald-500/40',
      accent:
        'bg-slate-900 text-white font-bold hover:bg-slate-800 active:bg-slate-950 shadow-sm border border-slate-800 focus-visible:ring-slate-900/30',
      secondary:
        'bg-indigo-50 text-indigo-900 hover:bg-indigo-100/80 active:bg-indigo-200/80 border border-indigo-100 font-semibold focus-visible:ring-indigo-500/30',
      outline:
        'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50/80 hover:border-slate-300 hover:text-slate-900 active:bg-slate-100 shadow-2xs font-semibold focus-visible:ring-slate-400/30',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 border border-transparent font-semibold focus-visible:ring-slate-400/30',
      danger:
        'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 active:bg-rose-200 font-semibold focus-visible:ring-rose-400/30',
    };

    const sizes = {
      xs: 'h-7 px-2.5 text-[11px] gap-1.5 rounded-lg font-semibold',
      sm: 'h-8.5 px-3 text-xs gap-1.5 rounded-lg font-bold',
      md: 'h-9.5 px-4 text-xs gap-2 rounded-xl font-bold',
      lg: 'h-11 px-5 text-sm gap-2.5 rounded-xl font-bold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center select-none cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

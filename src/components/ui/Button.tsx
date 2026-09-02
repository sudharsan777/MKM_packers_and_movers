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
        'bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold shadow-subtle border border-slate-800 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-slate-900/30',
      accent:
        'bg-[#D97706] hover:bg-[#B45309] text-white font-semibold shadow-subtle border border-amber-600 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-amber-500/30',
      amber:
        'bg-[#D97706] hover:bg-[#B45309] text-white font-semibold shadow-subtle border border-amber-600 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-amber-500/30',
      emerald:
        'bg-[#059669] hover:bg-[#047857] text-white font-semibold shadow-subtle border border-emerald-600 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-emerald-500/30',
      secondary:
        'bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-200/90 shadow-subtle active:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-300',
      outline:
        'bg-transparent hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-300',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-medium focus-visible:ring-2 focus-visible:ring-slate-300',
      danger:
        'bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200/80 active:bg-rose-200 focus-visible:ring-2 focus-visible:ring-rose-400/30',
    };

    const sizes = {
      xs: 'h-7 px-2.5 text-[11px] gap-1.5 rounded-lg',
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
      md: 'h-9 px-3.5 text-xs gap-2 rounded-xl',
      lg: 'h-10.5 px-4.5 text-sm gap-2.5 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center select-none cursor-pointer transition-all duration-150 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
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

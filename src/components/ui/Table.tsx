import React from 'react';
import { cn } from '../../utils';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="w-full overflow-x-auto">
    <table className={cn('w-full text-left border-collapse text-xs', className)} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead
    className={cn(
      'bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/90 select-none',
      className
    )}
    {...props}
  />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn('divide-y divide-slate-100 bg-white', className)} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement> & { isClickable?: boolean }> = ({
  className,
  isClickable = false,
  ...props
}) => (
  <tr
    className={cn(
      'transition-colors duration-100',
      isClickable ? 'cursor-pointer hover:bg-indigo-50/40 active:bg-indigo-100/40' : 'hover:bg-slate-50/60',
      className
    )}
    {...props}
  />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th className={cn('px-4 py-3.5 font-bold text-slate-600 select-none whitespace-nowrap', className)} {...props} />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn('px-4 py-3.5 text-slate-700 align-middle', className)} {...props} />
);

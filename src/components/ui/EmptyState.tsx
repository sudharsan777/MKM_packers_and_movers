import React from 'react';
import { Button } from './Button';
import { cn } from '../../utils';

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  className?: string;
  actionIcon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  className,
  actionIcon,
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (
      typeof icon === 'function' ||
      (typeof icon === 'object' && icon !== null && ('render' in icon || '$$typeof' in icon))
    ) {
      const IconComponent = icon as React.ElementType;
      return <IconComponent className="w-6 h-6" />;
    }
    return icon as React.ReactNode;
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-[#EAE5DC] bg-white shadow-xs',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD1] flex items-center justify-center text-[#9E7B4F] shadow-2xs mb-3.5">
        {renderIcon()}
      </div>
      <h3 className="text-sm font-bold text-[#1A1D20] tracking-tight">{title}</h3>
      <p className="text-xs text-[#718292] max-w-sm mt-1 mb-4 font-normal leading-relaxed">
        {description}
      </p>
      {action ? (
        action
      ) : actionLabel && onAction ? (
        <Button variant="primary" size="sm" onClick={onAction} leftIcon={actionIcon}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};

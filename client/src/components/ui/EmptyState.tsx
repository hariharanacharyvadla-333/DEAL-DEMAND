import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-nothing border border-dashed border-[#D9D9D9] bg-white ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 mb-4 shadow-sm">
          {icon}
        </div>
      )}
      <h4 className="text-base font-bold text-[#0A0A0A] tracking-tight mb-1">
        {title}
      </h4>
      <p className="text-sm text-[#4A4A4A] max-w-sm mb-6 leading-relaxed font-normal">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

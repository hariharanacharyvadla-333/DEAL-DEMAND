import React from 'react';
import { StatusDot } from './StatusDot';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'orange' | 'success' | 'danger' | 'verified' | 'premium' | 'fast';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs font-semibold tracking-tight gap-1',
    md: 'px-3 py-1 text-xs font-semibold tracking-tight gap-1.5',
  };

  const variantStyles = {
    default: 'bg-white text-[#0A0A0A] border border-[#D9D9D9] shadow-2xs',
    orange: 'bg-[#FFF1EB] text-[#C43806] border border-[#FFD9CC]',
    success: 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]',
    danger: 'bg-[#FEECEB] text-[#B91C1C] border border-[#FCA5A5]',
    verified: 'bg-[#0A0A0A] text-[#FFFFFF] border border-[#0A0A0A]',
    premium: 'bg-[#FF5A1F] text-[#FFFFFF] border border-[#FF5A1F]',
    fast: 'bg-amber-100 text-amber-900 border border-amber-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <StatusDot
          size="sm"
          status={
            variant === 'danger'
              ? 'urgent'
              : variant === 'orange' || variant === 'premium'
              ? 'pending'
              : 'active'
          }
        />
      )}
      {children}
    </span>
  );
};
